import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { subscribeToTimeSlotUpdates } from '../../services/timeSlotsSse.js'
import { useSlotsStore } from '../../stores/slots.js'
import { useSlotStream } from '../useSlotStream.js'

vi.mock('../../services/timeSlotsSse.js', () => ({
  subscribeToTimeSlotUpdates: vi.fn(),
}))

describe('useSlotStream', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(subscribeToTimeSlotUpdates).mockReset()
  })

  it('sets connection to live on open', () => {
    vi.mocked(subscribeToTimeSlotUpdates).mockImplementation(({ onOpen }) => {
      onOpen?.()
      return vi.fn()
    })
    const store = useSlotsStore()

    useSlotStream().start()

    expect(store.connection).toBe('live')
  })

  it('sets connection to reconnecting on error', () => {
    vi.mocked(subscribeToTimeSlotUpdates).mockImplementation(({ onError }) => {
      onError?.()
      return vi.fn()
    })
    const store = useSlotsStore()

    useSlotStream().start()

    expect(store.connection).toBe('reconnecting')
  })

  it('applies updates and touches lastUpdateAt on message', () => {
    const slot = {
      id: 1,
      startTime: '2024-07-23T08:00:00',
      endTime: '2024-07-23T08:30:00',
      category: 'yellow' as const,
      capacity: { current: 20, max: 50 },
    }
    vi.mocked(subscribeToTimeSlotUpdates).mockImplementation(({ onUpdate }) => {
      onUpdate({ id: 1, currentCapacity: 35, category: 'red' })
      return vi.fn()
    })
    const store = useSlotsStore()
    store.slots = [slot]

    useSlotStream().start()

    expect(store.slots[0]).toEqual({ ...slot, category: 'red', capacity: { current: 35, max: 50 } })
    expect(store.lastUpdateAt).toBeInstanceOf(Date)
  })

  it('stops the previous subscription when starting again', () => {
    const stop1 = vi.fn()
    const stop2 = vi.fn()
    vi.mocked(subscribeToTimeSlotUpdates).mockReturnValueOnce(stop1).mockReturnValueOnce(stop2)
    const stream = useSlotStream()

    stream.start()
    stream.start()

    expect(stop1).toHaveBeenCalled()
  })

  it('stop() unsubscribes and sets connection to offline', () => {
    const unsubscribe = vi.fn()
    vi.mocked(subscribeToTimeSlotUpdates).mockReturnValue(unsubscribe)
    const store = useSlotsStore()
    const stream = useSlotStream()

    stream.start()
    stream.stop()

    expect(unsubscribe).toHaveBeenCalled()
    expect(store.connection).toBe('offline')
  })
})
