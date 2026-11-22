import cors from 'cors'
import express from 'express'
import pinoHttp from 'pino-http'

import { env } from './config/env.js'
import { logger } from './logger.js'
import { sseRouter } from './routes/sse.route.js'
import { timeSlotsRouter } from './routes/timeSlots.route.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.FRONTEND_ORIGIN }))
  app.use(pinoHttp({ logger }))
  app.use(express.json())

  app.use(timeSlotsRouter)
  app.use(sseRouter)

  return app
}
