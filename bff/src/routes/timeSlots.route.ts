import { Router } from 'express'

export const timeSlotsRouter = Router()

// proxying + normalizing the external API response lands in a follow-up commit
timeSlotsRouter.get('/timeSlots', (_req, res) => {
  res.status(501).json({ error: 'not implemented' })
})
