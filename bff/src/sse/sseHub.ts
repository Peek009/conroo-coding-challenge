import type { Response } from 'express';

import type { TimeSlotUpdate } from '../domain/timeSlot/timeSlotUpdate.js';

export function createSseHub() {
  const clients = new Set<Response>();

  function subscribe(res: Response): void {
    clients.add(res);
    res.on('error', () => unsubscribe(res));
  }

  function unsubscribe(res: Response): void {
    clients.delete(res);
  }

  function broadcast(update: TimeSlotUpdate): void {
    const payload = `data: ${JSON.stringify(update)}\n\n`;

    for (const client of clients) {
      try {
        client.write(payload);
      } catch {
        unsubscribe(client);
      }
    }
  }

  return {
    subscribe,
    unsubscribe,
    broadcast,
    get size() {
      return clients.size;
    },
  };
}

export type SseHub = ReturnType<typeof createSseHub>;
