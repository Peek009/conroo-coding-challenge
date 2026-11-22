import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchTimeSlots } from '../timeSlotsApi.js'

const validSlot = {
  id: 1,
  startTime: '2024-07-23T08:00:00',
  endTime: '2024-07-23T08:30:00',
  category: 'yellow',
  capacity: { current: 20, max: 50 },
}

describe('fetchTimeSlots', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches and parses the time slots', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([validSlot]) }),
    )

    expect(await fetchTimeSlots()).toEqual([validSlot])
  })

  it('throws when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 502 }))

    await expect(fetchTimeSlots()).rejects.toThrow('502')
  })

  it('throws when the payload does not match the schema', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([{ id: 1 }]) }),
    )

    await expect(fetchTimeSlots()).rejects.toThrow()
  })
})
