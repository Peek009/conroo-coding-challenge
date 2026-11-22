import { z } from 'zod'

import { categorySchema } from './timeSlot.js'

export const timeSlotUpdateSchema = z.object({
  id: z.number(),
  currentCapacity: z.number(),
  category: categorySchema,
})
export type TimeSlotUpdate = z.infer<typeof timeSlotUpdateSchema>

export function parseTimeSlotUpdate(raw: unknown): TimeSlotUpdate {
  return timeSlotUpdateSchema.parse(raw)
}
