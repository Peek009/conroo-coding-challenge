import { describe, expect, it } from 'vitest'

import { normalizeTimeSlot, normalizeTimeSlots } from '../timeSlot.js'

describe('normalizeTimeSlot', () => {
  it('normalizes the snake_case variant', () => {
    const raw = {
      id: 1,
      start_time: '2024-07-23T08:00:00',
      end_time: '2024-07-23T08:30:00',
      category: 'yellow',
      capacity: { current_capacity: 20, max_capacity: 50 },
    }

    expect(normalizeTimeSlot(raw)).toEqual({
      id: 1,
      startTime: '2024-07-23T08:00:00',
      endTime: '2024-07-23T08:30:00',
      category: 'yellow',
      capacity: { current: 20, max: 50 },
    })
  })

  it('normalizes the camelCase variant', () => {
    const raw = {
      id: 2,
      startTime: '2024-07-23T08:30:00',
      endTime: '2024-07-23T09:00:00',
      category: 'red',
      capacity: { current: 40, maximum: 50 },
    }

    expect(normalizeTimeSlot(raw)).toEqual({
      id: 2,
      startTime: '2024-07-23T08:30:00',
      endTime: '2024-07-23T09:00:00',
      category: 'red',
      capacity: { current: 40, max: 50 },
    })
  })

  it('throws when a required field has a wrong name', () => {
    const raw = {
      id: 3,
      category: 'green',
      capacity: { current: 10, maximum: 50 },
    }

    expect(() => normalizeTimeSlot(raw)).toThrow(/startTime/)
  })

  it('normalizes fields mixed across both naming variants', () => {
    const raw = {
      id: 4,
      start_time: '2024-07-23T08:00:00',
      endTime: '2024-07-23T08:30:00',
      category: 'green',
      capacity: { current_capacity: 10, maximum: 50 },
    }

    expect(normalizeTimeSlot(raw)).toEqual({
      id: 4,
      startTime: '2024-07-23T08:00:00',
      endTime: '2024-07-23T08:30:00',
      category: 'green',
      capacity: { current: 10, max: 50 },
    })
  })
})

describe('normalizeTimeSlots', () => {
  it('normalizes a mixed-shape array', () => {
    const raw = [
      {
        id: 1,
        start_time: '2024-07-23T08:00:00',
        end_time: '2024-07-23T08:30:00',
        category: 'yellow',
        capacity: { current_capacity: 20, max_capacity: 50 },
      },
      {
        id: 2,
        startTime: '2024-07-23T08:30:00',
        endTime: '2024-07-23T09:00:00',
        category: 'red',
        capacity: { current: 40, maximum: 50 },
      },
    ]

    expect(normalizeTimeSlots(raw)).toEqual([
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
    ])
  })
})
