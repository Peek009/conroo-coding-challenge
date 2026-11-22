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

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : undefined
}

function mapRawFieldAliases(raw: unknown): unknown {
  const record = asRecord(raw)
  if (!record) return raw

  const capacity = asRecord(record.capacity)

  return {
    id: record.id,
    startTime: record.start_time ?? record.startTime,
    endTime: record.end_time ?? record.endTime,
    category: record.category,
    capacity: capacity && {
      current: capacity.current_capacity ?? capacity.current,
      max: capacity.max_capacity ?? capacity.maximum,
    },
  }
}

export function normalizeTimeSlot(raw: unknown): TimeSlot {
  return timeSlotSchema.parse(mapRawFieldAliases(raw))
}

export function normalizeTimeSlots(raw: unknown): TimeSlot[] {
  return z.array(z.unknown()).parse(raw).map(normalizeTimeSlot)
}
