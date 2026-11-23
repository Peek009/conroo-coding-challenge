import type { Category, DaySlot, TimeSlot } from '../domain/timeSlot.js';

interface TimeSlotOverrides {
  id?: number;
  date?: string;
  start?: string;
  end?: string;
  category?: Category;
  current?: number;
  max?: number;
}

// one shared builder for the raw TimeSlot shape
export function makeTimeSlot(overrides: TimeSlotOverrides = {}): TimeSlot {
  const {
    id = 1,
    date = '2024-07-23',
    start = '08:00',
    end = '08:30',
    category = 'yellow',
    current = 20,
    max = 50,
  } = overrides;

  return {
    id,
    startTime: `${date}T${start}:00`,
    endTime: `${date}T${end}:00`,
    category,
    capacity: { current, max },
  };
}

// the derived DaySlot shape
export function makeDaySlot(overrides: Partial<DaySlot> = {}): DaySlot {
  return {
    id: 1,
    date: '2024-07-23',
    start: 480,
    end: 510,
    category: 'yellow',
    current: 20,
    max: 50,
    ...overrides,
  };
}
