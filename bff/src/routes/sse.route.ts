import { Router } from 'express'

export const sseRouter = Router()

// relaying the external SSE stream lands in a follow-up commit
sseRouter.get('/sse', (_req, res) => {
  res.status(501).json({ error: 'not implemented' })
})
