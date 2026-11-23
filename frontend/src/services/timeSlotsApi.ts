import { parseTimeSlots, type TimeSlot } from '../domain/timeSlot.js';

export async function fetchTimeSlots(): Promise<TimeSlot[]> {
  const response = await fetch('/timeSlots');

  if (!response.ok) {
    throw new Error(`failed to fetch time slots: ${response.status}`);
  }

  const raw = await response.json();
  return parseTimeSlots(raw);
}
