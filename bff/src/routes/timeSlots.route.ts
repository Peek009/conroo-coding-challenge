import { Router } from 'express'

import { env } from '../config/env.js'
import { normalizeTimeSlots } from '../domain/timeSlot/timeSlot.js'

export const timeSlotsRouter = Router()

timeSlotsRouter.get('/timeSlots', async (req, res) => {
  try {
    const response = await fetch(`${env.EXTERNAL_API_BASE_URL}/timeSlots`)

    if (!response.ok) {
      res.status(502).json({ error: 'failed to fetch time slots' })
      return
    }

    const raw = await response.json()
    res.json(normalizeTimeSlots(raw))
  } catch (error) {
    req.log.error(error)
    res.status(502).json({ error: 'failed to fetch time slots' })
  }
})
