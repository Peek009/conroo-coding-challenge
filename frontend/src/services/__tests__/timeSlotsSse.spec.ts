import { afterEach, describe, expect, it, vi } from 'vitest'

import { subscribeToTimeSlotUpdates } from '../timeSlotsSse.js'

class MockEventSource {
  static instances: MockEventSource[] = []
  url: string
  onmessage: ((event: MessageEvent) => void) | null = null
  closed = false

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  close(): void {
    this.closed = true
  }

  emit(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent)
  }
}

function getInstance(): MockEventSource {
  const instance = MockEventSource.instances[0]
  if (!instance) throw new Error('no EventSource instance was created')
  return instance
}

describe('subscribeToTimeSlotUpdates', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    MockEventSource.instances = []
  })

  it('connects to /sse', () => {
    vi.stubGlobal('EventSource', MockEventSource)

    subscribeToTimeSlotUpdates(() => {})

    expect(MockEventSource.instances).toHaveLength(1)
    expect(getInstance().url).toBe('/sse')
  })

  it('forwards parsed updates to the callback', () => {
    vi.stubGlobal('EventSource', MockEventSource)
    const updates: unknown[] = []

    subscribeToTimeSlotUpdates((update) => updates.push(update))
    getInstance().emit({ id: 1, currentCapacity: 30, category: 'yellow' })

    expect(updates).toEqual([{ id: 1, currentCapacity: 30, category: 'yellow' }])
  })

  it('drops malformed updates without throwing', () => {
    vi.stubGlobal('EventSource', MockEventSource)
    const updates: unknown[] = []

    subscribeToTimeSlotUpdates((update) => updates.push(update))

    expect(() => getInstance().emit({ id: 1, category: 'yellow' })).not.toThrow()
    expect(updates).toEqual([])
  })

  it('closes the connection on unsubscribe', () => {
    vi.stubGlobal('EventSource', MockEventSource)

    const unsubscribe = subscribeToTimeSlotUpdates(() => {})
    unsubscribe()

    expect(getInstance().closed).toBe(true)
  })
})
