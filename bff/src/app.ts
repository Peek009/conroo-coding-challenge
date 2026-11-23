import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';

import { env } from './config/env.js';
import { logger } from './logger.js';
import { createRoutes } from './routes/index.js';
import { createSseHub, type SseHub } from './sse/sseHub.js';

export function createApp(hub: SseHub = createSseHub()) {
  const app = express();

  app.use(cors({ origin: env.FRONTEND_ORIGIN }));
  app.use(pinoHttp({ logger }));
  app.use(express.json());

  app.use(createRoutes(hub));

  return app;
}
