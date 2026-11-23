import { describe, expect, it } from 'vitest';

import {
  buildSlotRows,
  daySummary,
  formatClockTime,
  groupByDate,
  mergeTimeSlotUpdate,
  parseTimeSlotUpdate,
  parseTimeSlots,
  toDaySlot,
  type TimeSlot,
} from '../timeSlot.js';
import { makeDaySlot } from '../../test-utils/fixtures.js';

const slots: TimeSlot[] = [
  {
    id: 1,
    startTime: '2024-07-23T08:00:00',
    endTime: '2024-07-23T08:30:00',
    category: 'yellow',
    capacity: { current: 20, max: 50 },
  },
  {
    id: 2,
    startTime: '2024-07-23T08:30:00',
    endTime: '2024-07-23T09:00:00',
    category: 'red',
    capacity: { current: 40, max: 50 },
  },
];

describe('parseTimeSlots', () => {
  it('parses a valid array', () => {
    expect(parseTimeSlots(slots)).toEqual(slots);
  });

  it('throws on a malformed entry', () => {
    expect(() => parseTimeSlots([{ id: 1, category: 'yellow' }])).toThrow();
  });
});

describe('parseTimeSlotUpdate', () => {
  it('parses a valid update', () => {
    const raw = { id: 1, currentCapacity: 30, category: 'green' };
    expect(parseTimeSlotUpdate(raw)).toEqual(raw);
  });

  it('throws on an unknown category', () => {
    expect(() => parseTimeSlotUpdate({ id: 1, currentCapacity: 30, category: 'blue' })).toThrow();
  });
});

describe('mergeTimeSlotUpdate', () => {
  it('updates capacity.current and category on the matching slot', () => {
    const update = { id: 1, currentCapacity: 35, category: 'red' as const };

    const result = mergeTimeSlotUpdate(slots, update);

    expect(result[0]).toEqual({
      id: 1,
      startTime: '2024-07-23T08:00:00',
      endTime: '2024-07-23T08:30:00',
      category: 'red',
      capacity: { current: 35, max: 50 },
    });
  });

  it('leaves every other slot untouched, by reference', () => {
    const update = { id: 1, currentCapacity: 35, category: 'red' as const };

    const result = mergeTimeSlotUpdate(slots, update);

    expect(result[1]).toBe(slots[1]);
  });

  it('leaves the array unchanged when no slot matches the update id', () => {
    const update = { id: 999, currentCapacity: 35, category: 'red' as const };

    const result = mergeTimeSlotUpdate(slots, update);

    expect(result).toEqual(slots);
    expect(result[0]).toBe(slots[0]);
    expect(result[1]).toBe(slots[1]);
  });

  it('does not mutate the input array or its slots', () => {
    const original = structuredClone(slots);

    mergeTimeSlotUpdate(slots, { id: 1, currentCapacity: 35, category: 'red' as const });

    expect(slots).toEqual(original);
  });
});

describe('toDaySlot', () => {
  it('derives date and minutes-since-midnight from the local timestamp text', () => {
    expect(toDaySlot(slots[0]!)).toEqual({
      id: 1,
      date: '2024-07-23',
      start: 480,
      end: 510,
      category: 'yellow',
      current: 20,
      max: 50,
    });
  });

  it('throws on a timestamp that does not match the expected local format', () => {
    const malformed = { ...slots[0]!, startTime: 'not-a-timestamp' } as unknown as TimeSlot;

    expect(() => toDaySlot(malformed)).toThrow();
  });
});

describe('groupByDate', () => {
  it('sorts days by date and slots within each day by start time, from unsorted input', () => {
    const input = [
      makeDaySlot({ id: 3, date: '2024-07-24', start: 540, end: 570 }),
      makeDaySlot({ id: 1, date: '2024-07-23', start: 510, end: 540 }),
      makeDaySlot({ id: 2, date: '2024-07-23', start: 480, end: 510 }),
    ];

    const days = groupByDate(input);

    expect(days.map((day) => day.date)).toEqual(['2024-07-23', '2024-07-24']);
    expect(days[0]!.slots.map((slot) => slot.id)).toEqual([2, 1]);
  });

  it('does not mutate the input array', () => {
    const input = [makeDaySlot({ id: 1 }), makeDaySlot({ id: 2, start: 400, end: 430 })];
    const original = structuredClone(input);

    groupByDate(input);

    expect(input).toEqual(original);
  });
});

describe('daySummary', () => {
  it('counts slots per category and sums max as capacity, not slotCount * 50', () => {
    const summary = daySummary([
      makeDaySlot({ id: 1, category: 'green', max: 30 }),
      makeDaySlot({ id: 2, category: 'yellow', max: 40 }),
      makeDaySlot({ id: 3, category: 'yellow', max: 50 }),
    ]);

    expect(summary.slotCount).toBe(3);
    expect(summary.counts).toEqual({ green: 1, yellow: 2, red: 0 });
    expect(summary.capacity).toBe(120);
  });

  it('computes booked and free from current/max, handling a single slot', () => {
    const summary = daySummary([makeDaySlot({ current: 20, max: 50 })]);

    expect(summary.booked).toBe(20);
    expect(summary.free).toBe(30);
  });

  it('reports free as 0 for a fully booked day', () => {
    const summary = daySummary([
      makeDaySlot({ id: 1, current: 50, max: 50, category: 'red' }),
      makeDaySlot({ id: 2, current: 30, max: 30, category: 'red' }),
    ]);

    expect(summary.free).toBe(0);
  });

  it('spans from/to across a lunch gap between morning and afternoon slots', () => {
    const summary = daySummary([
      makeDaySlot({ id: 1, start: 480, end: 510 }),
      makeDaySlot({ id: 2, start: 780, end: 810 }),
    ]);

    expect(summary.from).toBe(480);
    expect(summary.to).toBe(810);
  });
});

describe('formatClockTime', () => {
  it('pads hours and minutes to two digits', () => {
    expect(formatClockTime(480)).toBe('08:00');
    expect(formatClockTime(5)).toBe('00:05');
  });
});

describe('buildSlotRows', () => {
  it('builds one slot row per slot, in start order', () => {
    const rows = buildSlotRows([
      makeDaySlot({ id: 2, start: 510, end: 540 }),
      makeDaySlot({ id: 1, start: 480, end: 510 }),
    ]);

    expect(rows).toEqual([
      { type: 'slot', key: 'slot-1', slot: makeDaySlot({ id: 1, start: 480, end: 510 }) },
      { type: 'slot', key: 'slot-2', slot: makeDaySlot({ id: 2, start: 510, end: 540 }) },
    ]);
  });

  it('inserts a gap row between slots that do not touch', () => {
    const rows = buildSlotRows([
      makeDaySlot({ id: 1, start: 480, end: 510 }),
      makeDaySlot({ id: 2, start: 780, end: 810 }),
    ]);

    expect(rows).toEqual([
      { type: 'slot', key: 'slot-1', slot: makeDaySlot({ id: 1, start: 480, end: 510 }) },
      { type: 'gap', key: 'gap-510', from: 510, to: 780 },
      { type: 'slot', key: 'slot-2', slot: makeDaySlot({ id: 2, start: 780, end: 810 }) },
    ]);
  });

  it('does not insert a gap for slots that touch', () => {
    const rows = buildSlotRows([
      makeDaySlot({ id: 1, start: 480, end: 510 }),
      makeDaySlot({ id: 2, start: 510, end: 540 }),
    ]);

    expect(rows).toEqual([
      { type: 'slot', key: 'slot-1', slot: makeDaySlot({ id: 1, start: 480, end: 510 }) },
      { type: 'slot', key: 'slot-2', slot: makeDaySlot({ id: 2, start: 510, end: 540 }) },
    ]);
  });

  it('handles a single slot', () => {
    const rows = buildSlotRows([makeDaySlot({ id: 1 })]);

    expect(rows).toEqual([{ type: 'slot', key: 'slot-1', slot: makeDaySlot({ id: 1 }) }]);
  });

  it('does not mutate the input array', () => {
    const input = [
      makeDaySlot({ id: 2, start: 510, end: 540 }),
      makeDaySlot({ id: 1, start: 480, end: 510 }),
    ];
    const original = structuredClone(input);

    buildSlotRows(input);

    expect(input).toEqual(original);
  });
});
