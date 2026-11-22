import { afterEach, describe, expect, it, vi } from 'vitest'

import { startUpstreamSseClient } from '../upstreamSseClient.js'

function sseStreamFrom(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  let index = 0

  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]))
        index++
      } else {
        controller.close()
      }
    },
  })
}

describe('startUpstreamSseClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('forwards valid updates and drops invalid ones', async () => {
    const body = sseStreamFrom([
      'data: {"id":1,"currentCapacity":30,"category":"yellow"}\n\n',
      'data: {"id":2,"category":"red"}\n\n',
    ])

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body }))

    const updates: unknown[] = []
    const stop = startUpstreamSseClient((update) => updates.push(update))

    await vi.waitFor(() => expect(updates).toHaveLength(1))
    expect(updates[0]).toEqual({ id: 1, currentCapacity: 30, category: 'yellow' })

    stop()
  })

  it('retries after an upstream connection failure', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        body: sseStreamFrom(['data: {"id":1,"currentCapacity":10,"category":"green"}\n\n']),
      })
      .mockResolvedValue({ ok: false, status: 503 })
    vi.stubGlobal('fetch', fetchMock)

    const updates: unknown[] = []
    const stop = startUpstreamSseClient((update) => updates.push(update), 5)

    await vi.waitFor(() => expect(updates).toHaveLength(1))
    stop()

    expect(updates[0]).toEqual({ id: 1, currentCapacity: 10, category: 'green' })
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})
