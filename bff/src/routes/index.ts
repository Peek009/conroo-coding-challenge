import { Router } from 'express';

import type { SseHub } from '../sse/sseHub.js';
import { createSseRouter } from './sse.route.js';
import { timeSlotsRouter } from './timeSlots.route.js';

export function createRoutes(hub: SseHub): Router {
  const router = Router();

  router.use(timeSlotsRouter);
  router.use(createSseRouter(hub));

  return router;
}
