import { env } from '../config/env.js'
import { parseTimeSlotUpdate, type TimeSlotUpdate } from '../domain/timeSlot/timeSlotUpdate.js'
import { logger } from '../logger.js'
import { createSseLineParser } from './sseLineParser.js'

const RECONNECT_DELAY_MS = 2000

export function startUpstreamSseClient(
  onUpdate: (update: TimeSlotUpdate) => void,
  reconnectDelayMs = RECONNECT_DELAY_MS,
): () => void {
  let stopped = false
  let wakeSleep: (() => void) | undefined

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms)
      wakeSleep = () => {
        clearTimeout(timer)
        resolve()
      }
    })
  }

  async function connectOnce(): Promise<void> {
    const response = await fetch(`${env.EXTERNAL_API_BASE_URL}/sse`, {
      headers: { Accept: 'text/event-stream' },
    })

    if (!response.ok || !response.body) {
      throw new Error(`upstream SSE connection failed with status ${response.status}`)
    }

    const feed = createSseLineParser((data) => {
      try {
        onUpdate(parseTimeSlotUpdate(JSON.parse(data)))
      } catch (error) {
        logger.warn({ error, data }, 'dropping invalid SSE update from upstream')
      }
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (!stopped) {
      const { value, done } = await reader.read()
      if (done) break
      feed(decoder.decode(value, { stream: true }))
    }
  }

  async function run(): Promise<void> {
    while (!stopped) {
      try {
        await connectOnce()
      } catch (error) {
        logger.warn({ error }, 'upstream SSE connection lost, retrying')
      }

      if (!stopped) {
        await sleep(reconnectDelayMs)
      }
    }
  }

  void run()

  return function stop(): void {
    stopped = true
    wakeSleep?.()
  }
}
