import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchTimeSlots } from '../../services/timeSlotsApi.js'
import { useSlotsStore } from '../slots.js'

vi.mock('../../services/timeSlotsApi.js', () => ({
  fetchTimeSlots: vi.fn(),
}))

const slot = {
  id: 1,
  startTime: '2024-07-23T08:00:00',
  endTime: '2024-07-23T08:30:00',
  category: 'yellow' as const,
  capacity: { current: 20, max: 50 },
}

describe('useSlotsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(fetchTimeSlots).mockReset()
  })

  it('starts at connecting with no last update', () => {
    const store = useSlotsStore()

    expect(store.connection).toBe('connecting')
    expect(store.lastUpdateAt).toBeNull()
  })

  it('loads slots, sets status to idle and touches lastUpdateAt on success', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([slot])
    const store = useSlotsStore()

    await store.load()

    expect(store.slots).toEqual([slot])
    expect(store.status).toBe('idle')
    expect(store.lastUpdateAt).toBeInstanceOf(Date)
  })

  it('sets status to error and leaves lastUpdateAt untouched when loading fails', async () => {
    vi.mocked(fetchTimeSlots).mockRejectedValue(new Error('network error'))
    const store = useSlotsStore()

    await store.load()

    expect(store.status).toBe('error')
    expect(store.slots).toEqual([])
    expect(store.lastUpdateAt).toBeNull()
  })

  it('applyUpdate merges a live update into the current slots', () => {
    const store = useSlotsStore()
    store.slots = [slot]

    store.applyUpdate({ id: 1, currentCapacity: 35, category: 'red' })

    expect(store.slots[0]).toEqual({
      ...slot,
      category: 'red',
      capacity: { current: 35, max: 50 },
    })
  })

  it('setConnection updates the connection state', () => {
    const store = useSlotsStore()

    store.setConnection('live')
    expect(store.connection).toBe('live')

    store.setConnection('offline')
    expect(store.connection).toBe('offline')
  })

  it('touch sets lastUpdateAt to the current time', () => {
    const store = useSlotsStore()

    store.touch()

    expect(store.lastUpdateAt).toBeInstanceOf(Date)
  })
})
