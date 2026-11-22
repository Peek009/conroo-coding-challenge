import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TimeSlotUpdate } from '../../domain/timeSlot.js'
import { fetchTimeSlots } from '../../services/timeSlotsApi.js'
import { subscribeToTimeSlotUpdates } from '../../services/timeSlotsSse.js'
import { useTimeSlotsStore } from '../timeSlots.js'

vi.mock('../../services/timeSlotsApi.js', () => ({
  fetchTimeSlots: vi.fn(),
}))

vi.mock('../../services/timeSlotsSse.js', () => ({
  subscribeToTimeSlotUpdates: vi.fn(),
}))

const slot = {
  id: 1,
  startTime: '2024-07-23T08:00:00',
  endTime: '2024-07-23T08:30:00',
  category: 'yellow' as const,
  capacity: { current: 20, max: 50 },
}

describe('useTimeSlotsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(fetchTimeSlots).mockReset()
    vi.mocked(subscribeToTimeSlotUpdates).mockReset()
  })

  it('loads slots and sets status to idle on success', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([slot])
    const store = useTimeSlotsStore()

    await store.load()

    expect(store.slots).toEqual([slot])
    expect(store.status).toBe('idle')
  })

  it('sets status to error when loading fails', async () => {
    vi.mocked(fetchTimeSlots).mockRejectedValue(new Error('network error'))
    const store = useTimeSlotsStore()

    await store.load()

    expect(store.status).toBe('error')
    expect(store.slots).toEqual([])
  })

  it('merges SSE updates into the current slots', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([slot])
    let capturedCallback: ((update: TimeSlotUpdate) => void) | undefined
    vi.mocked(subscribeToTimeSlotUpdates).mockImplementation((onUpdate) => {
      capturedCallback = onUpdate
      return vi.fn()
    })
    const store = useTimeSlotsStore()
    await store.load()

    store.subscribe()
    capturedCallback?.({ id: 1, currentCapacity: 35, category: 'red' })

    expect(store.slots[0]).toEqual({
      ...slot,
      category: 'red',
      capacity: { current: 35, max: 50 },
    })
  })

  it('stops the previous subscription when subscribing again', () => {
    const stop1 = vi.fn()
    const stop2 = vi.fn()
    vi.mocked(subscribeToTimeSlotUpdates).mockReturnValueOnce(stop1).mockReturnValueOnce(stop2)
    const store = useTimeSlotsStore()

    store.subscribe()
    store.subscribe()

    expect(stop1).toHaveBeenCalled()
  })

  it('stops the subscription on unsubscribe', () => {
    const stop = vi.fn()
    vi.mocked(subscribeToTimeSlotUpdates).mockReturnValue(stop)
    const store = useTimeSlotsStore()

    store.subscribe()
    store.unsubscribe()

    expect(stop).toHaveBeenCalled()
  })
})
