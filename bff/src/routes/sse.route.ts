import type { Request, Response } from 'express'
import { Router } from 'express'

import type { SseHub } from '../sse/sseHub.js'

export function sseRequestHandler(hub: SseHub) {
  return function handleSseRequest(req: Request, res: Response): void {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    res.flushHeaders()

    hub.subscribe(res)
    req.on('close', () => hub.unsubscribe(res))
  }
}

export function createSseRouter(hub: SseHub) {
  const router = Router()
  router.get('/sse', sseRequestHandler(hub))
  return router
}
