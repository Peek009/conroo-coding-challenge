import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../app.js'

describe('GET /timeSlots', () => {
  it('is stubbed until the real proxy lands', async () => {
    const app = createApp()

    const response = await request(app).get('/timeSlots')

    expect(response.status).toBe(501)
  })
})
