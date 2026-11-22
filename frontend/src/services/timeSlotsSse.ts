import { parseTimeSlotUpdate, type TimeSlotUpdate } from '../domain/timeSlot.js'

export interface TimeSlotStreamHandlers {
  onUpdate: (update: TimeSlotUpdate) => void
  onOpen?: () => void
  onError?: () => void
}

export function subscribeToTimeSlotUpdates(handlers: TimeSlotStreamHandlers): () => void {
  const eventSource = new EventSource('/sse')

  eventSource.onopen = () => {
    handlers.onOpen?.()
  }

  eventSource.onerror = () => {
    handlers.onError?.()
  }

  eventSource.onmessage = (event) => {
    try {
      handlers.onUpdate(parseTimeSlotUpdate(JSON.parse(event.data)))
    } catch {
      // malformed/unparseable update: drop it, keep the stream alive
    }
  }

  return function unsubscribe(): void {
    eventSource.close()
  }
}
