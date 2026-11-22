import { describe, expect, it } from 'vitest'

import { parseTimeSlotUpdate } from '../timeSlotUpdate.js'

describe('parseTimeSlotUpdate', () => {
  it('parses a valid update', () => {
    const raw = { id: 1, currentCapacity: 30, category: 'yellow' }

    expect(parseTimeSlotUpdate(raw)).toEqual(raw)
  })

  it('throws on a missing field', () => {
    const raw = { id: 1, category: 'yellow' }

    expect(() => parseTimeSlotUpdate(raw)).toThrow()
  })

  it('throws on an unknown category', () => {
    const raw = { id: 1, currentCapacity: 30, category: 'blue' }

    expect(() => parseTimeSlotUpdate(raw)).toThrow()
  })
})
