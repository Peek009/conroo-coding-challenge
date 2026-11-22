import { describe, expect, it } from 'vitest'

import {
  mergeTimeSlotUpdate,
  parseTimeSlotUpdate,
  parseTimeSlots,
  type TimeSlot,
} from '../timeSlot.js'

const slots: TimeSlot[] = [
  {
    id: 1,
    startTime: '2024-07-23T08:00:00',
    endTime: '2024-07-23T08:30:00',
    category: 'yellow',
    capacity: { current: 20, max: 50 },
  },
  {
    id: 2,
    startTime: '2024-07-23T08:30:00',
    endTime: '2024-07-23T09:00:00',
    category: 'red',
    capacity: { current: 40, max: 50 },
  },
]

describe('parseTimeSlots', () => {
  it('parses a valid array', () => {
    expect(parseTimeSlots(slots)).toEqual(slots)
  })

  it('throws on a malformed entry', () => {
    expect(() => parseTimeSlots([{ id: 1, category: 'yellow' }])).toThrow()
  })
})

describe('parseTimeSlotUpdate', () => {
  it('parses a valid update', () => {
    const raw = { id: 1, currentCapacity: 30, category: 'green' }
    expect(parseTimeSlotUpdate(raw)).toEqual(raw)
  })

  it('throws on an unknown category', () => {
    expect(() => parseTimeSlotUpdate({ id: 1, currentCapacity: 30, category: 'blue' })).toThrow()
  })
})

describe('mergeTimeSlotUpdate', () => {
  it('updates capacity.current and category on the matching slot', () => {
    const update = { id: 1, currentCapacity: 35, category: 'red' as const }

    const result = mergeTimeSlotUpdate(slots, update)

    expect(result[0]).toEqual({
      id: 1,
      startTime: '2024-07-23T08:00:00',
      endTime: '2024-07-23T08:30:00',
      category: 'red',
      capacity: { current: 35, max: 50 },
    })
  })

  it('leaves every other slot untouched, by reference', () => {
    const update = { id: 1, currentCapacity: 35, category: 'red' as const }

    const result = mergeTimeSlotUpdate(slots, update)

    expect(result[1]).toBe(slots[1])
  })

  it('leaves the array unchanged when no slot matches the update id', () => {
    const update = { id: 999, currentCapacity: 35, category: 'red' as const }

    const result = mergeTimeSlotUpdate(slots, update)

    expect(result).toEqual(slots)
    expect(result[0]).toBe(slots[0])
    expect(result[1]).toBe(slots[1])
  })

  it('does not mutate the input array or its slots', () => {
    const original = structuredClone(slots)

    mergeTimeSlotUpdate(slots, { id: 1, currentCapacity: 35, category: 'red' as const })

    expect(slots).toEqual(original)
  })
})
