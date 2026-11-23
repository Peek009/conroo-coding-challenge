import { z } from 'zod';

export const categorySchema = z.enum(['green', 'yellow', 'red']);
export type Category = z.infer<typeof categorySchema>;

const localTimestampSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);

export const timeSlotSchema = z.object({
  id: z.number(),
  startTime: localTimestampSchema,
  endTime: localTimestampSchema,
  category: categorySchema,
  capacity: z.object({
    current: z.number(),
    max: z.number(),
  }),
});
export type TimeSlot = z.infer<typeof timeSlotSchema>;

export const timeSlotUpdateSchema = z.object({
  id: z.number(),
  currentCapacity: z.number(),
  category: categorySchema,
});
export type TimeSlotUpdate = z.infer<typeof timeSlotUpdateSchema>;

export function parseTimeSlots(raw: unknown): TimeSlot[] {
  return z.array(timeSlotSchema).parse(raw);
}

export function parseTimeSlotUpdate(raw: unknown): TimeSlotUpdate {
  return timeSlotUpdateSchema.parse(raw);
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
  );
}

export interface DaySlot {
  id: number;
  date: string;
  start: number;
  end: number;
  category: Category;
  current: number;
  max: number;
}

export interface Day {
  date: string;
  slots: DaySlot[];
}

export interface DaySummary {
  slotCount: number;
  counts: Record<Category, number>;
  booked: number;
  capacity: number;
  free: number;
  from: number;
  to: number;
}

export function formatClockTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function parseLocalTimestamp(timestamp: string): { date: string; minutes: number } {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(timestamp);
  if (!match) throw new Error(`invalid local timestamp: ${timestamp}`);
  const [, date, hours, minutes] = match;
  return { date: date!, minutes: Number(hours) * 60 + Number(minutes) };
}

export function toDaySlot(slot: TimeSlot): DaySlot {
  const start = parseLocalTimestamp(slot.startTime);
  const end = parseLocalTimestamp(slot.endTime);
  return {
    id: slot.id,
    date: start.date,
    start: start.minutes,
    end: end.minutes,
    category: slot.category,
    current: slot.capacity.current,
    max: slot.capacity.max,
  };
}

export function groupByDate(slots: DaySlot[]): Day[] {
  const byDate = slots.reduce((map, slot) => {
    map.set(slot.date, [...(map.get(slot.date) ?? []), slot]);
    return map;
  }, new Map<string, DaySlot[]>());

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, daySlots]) => ({
      date,
      slots: [...daySlots].sort((a, b) => a.start - b.start),
    }));
}

export function daySummary(slots: DaySlot[]): DaySummary {
  const counts = slots.reduce<Record<Category, number>>(
    (acc, slot) => ({ ...acc, [slot.category]: acc[slot.category] + 1 }),
    { green: 0, yellow: 0, red: 0 },
  );
  const booked = slots.reduce((total, slot) => total + slot.current, 0);
  const capacity = slots.reduce((total, slot) => total + slot.max, 0);

  return {
    slotCount: slots.length,
    counts,
    booked,
    capacity,
    free: capacity - booked,
    from: Math.min(...slots.map((slot) => slot.start)),
    to: Math.max(...slots.map((slot) => slot.end)),
  };
}

export interface Gap {
  type: 'gap';
  key: string;
  from: number;
  to: number;
}

export interface SlotRowItem {
  type: 'slot';
  key: string;
  slot: DaySlot;
}

export type Row = Gap | SlotRowItem;

// Sorts by start time and inserts a gap row wherever two slots don't touch.
export function buildSlotRows(slots: DaySlot[]): Row[] {
  const sorted = [...slots].sort((a, b) => a.start - b.start);

  return sorted.reduce<Row[]>((acc, slot, index) => {
    const previous = sorted[index - 1];
    const withGap =
      previous && slot.start > previous.end
        ? [
            ...acc,
            {
              type: 'gap' as const,
              key: `gap-${previous.end}`,
              from: previous.end,
              to: slot.start,
            },
          ]
        : acc;

    return [...withGap, { type: 'slot' as const, key: `slot-${slot.id}`, slot }];
  }, []);
}
