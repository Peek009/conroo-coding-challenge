import { z } from 'zod'

export const categorySchema = z.enum(['green', 'yellow', 'red'])
export type Category = z.infer<typeof categorySchema>

export const timeSlotSchema = z.object({
  id: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  category: categorySchema,
  capacity: z.object({
    current: z.number(),
    max: z.number(),
  }),
})
export type TimeSlot = z.infer<typeof timeSlotSchema>

export const timeSlotUpdateSchema = z.object({
  id: z.number(),
  currentCapacity: z.number(),
  category: categorySchema,
})
export type TimeSlotUpdate = z.infer<typeof timeSlotUpdateSchema>

export function parseTimeSlots(raw: unknown): TimeSlot[] {
  return z.array(timeSlotSchema).parse(raw)
}

export function parseTimeSlotUpdate(raw: unknown): TimeSlotUpdate {
  return timeSlotUpdateSchema.parse(raw)
}

export function mergeTimeSlotUpdate(slots: TimeSlot[], update: TimeSlotUpdate): TimeSlot[] {
  return slots.map((slot) =>
    slot.id === update.id
      ? {
          ...slot,
          category: update.category,
          capacity: { ...slot.capacity, current: update.currentCapacity },
        }
      : slot,
  )
}
