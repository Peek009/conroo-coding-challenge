import { subscribeToTimeSlotUpdates } from '../services/timeSlotsSse.js';
import { useSlotsStore } from '../stores/slots.js';

export function useSlotStream() {
  const store = useSlotsStore();
  let unsubscribe: (() => void) | undefined;

  function start(): void {
    unsubscribe?.();
    unsubscribe = subscribeToTimeSlotUpdates({
      onUpdate: (update) => store.applyUpdate(update),
      onOpen: () => store.setConnection('live'),
      onError: () => store.setConnection('reconnecting'),
    });
  }

  function stop(): void {
    unsubscribe?.();
    unsubscribe = undefined;
    store.setConnection('offline');
  }

  return { start, stop };
}
