import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createApp } from '../app.js'

const rawTimeSlots = [
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

describe('GET /timeSlots', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches and normalizes the external payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(rawTimeSlots) }),
    )

    const response = await request(createApp()).get('/timeSlots')

    expect(response.status).toBe(200)
    expect(response.body).toEqual([
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

  it('returns 502 when the upstream call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    const response = await request(createApp()).get('/timeSlots')

    expect(response.status).toBe(502)
  })

  it('returns 502 when the upstream payload cannot be normalized', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ id: 1, category: 'yellow' }]),
      }),
    )

    const response = await request(createApp()).get('/timeSlots')

    expect(response.status).toBe(502)
  })
})
