import { parseTimeSlotUpdate, type TimeSlotUpdate } from '../domain/timeSlot.js'

export function subscribeToTimeSlotUpdates(onUpdate: (update: TimeSlotUpdate) => void): () => void {
  const eventSource = new EventSource('/sse')

  eventSource.onmessage = (event) => {
    try {
      onUpdate(parseTimeSlotUpdate(JSON.parse(event.data)))
    } catch {
      // malformed/unparseable update: drop it, keep the stream alive
    }
  }

  return function unsubscribe(): void {
    eventSource.close()
  }
}
