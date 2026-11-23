import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchTimeSlots } from '../../services/timeSlotsApi.js';
import { makeTimeSlot } from '../../test-utils/fixtures.js';
import { useSlotsStore } from '../slots.js';

vi.mock('../../services/timeSlotsApi.js', () => ({
  fetchTimeSlots: vi.fn(),
}));

describe('useSlotsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(fetchTimeSlots).mockReset();
  });

  it('starts idle, empty, with no selected date', () => {
    const store = useSlotsStore();

    expect(store.status).toBe('idle');
    expect(store.days).toEqual([]);
    expect(store.selectedDate).toBeNull();
    expect(store.connection).toBe('connecting');
    expect(store.lastUpdateAt).toBeNull();
  });

  it('loads slots, sets status to ready, touches lastUpdateAt and selects the first date', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([
      makeTimeSlot({ id: 1, date: '2024-07-24' }),
      makeTimeSlot({ id: 2, date: '2024-07-23' }),
    ]);
    const store = useSlotsStore();

    await store.load();

    expect(store.status).toBe('ready');
    expect(store.lastUpdateAt).toBeInstanceOf(Date);
    expect(store.days.map((day) => day.date)).toEqual(['2024-07-23', '2024-07-24']);
    expect(store.selectedDate).toBe('2024-07-23');
  });

  it('keeps the current selected date across a reload when it still exists', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([
      makeTimeSlot({ id: 1, date: '2024-07-23' }),
      makeTimeSlot({ id: 2, date: '2024-07-24' }),
    ]);
    const store = useSlotsStore();
    await store.load();
    store.setDate('2024-07-24');

    await store.load();

    expect(store.selectedDate).toBe('2024-07-24');
  });

  it('re-selects the first date when the selected date no longer exists', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([makeTimeSlot({ id: 1, date: '2024-07-23' })]);
    const store = useSlotsStore();
    await store.load();
    store.setDate('2024-07-23');

    vi.mocked(fetchTimeSlots).mockResolvedValue([makeTimeSlot({ id: 2, date: '2024-07-25' })]);
    await store.load();

    expect(store.selectedDate).toBe('2024-07-25');
  });

  it('sets status to error and leaves slots empty when loading fails', async () => {
    vi.mocked(fetchTimeSlots).mockRejectedValue(new Error('network error'));
    const store = useSlotsStore();

    await store.load();

    expect(store.status).toBe('error');
    expect(store.days).toEqual([]);
  });

  it('applyUpdate merges a live update into the day and selected-day summary', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([makeTimeSlot({ id: 1 })]);
    const store = useSlotsStore();
    await store.load();

    store.applyUpdate({ id: 1, currentCapacity: 35, category: 'red' });

    expect(store.selectedDay?.slots[0]).toMatchObject({ category: 'red', current: 35 });
    expect(store.selectedDaySummary?.counts).toEqual({ green: 0, yellow: 0, red: 1 });
  });

  it('applyUpdate records the change as a highlight and clears it after 2600ms', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchTimeSlots).mockResolvedValue([makeTimeSlot({ id: 1, current: 20 })]);
    const store = useSlotsStore();
    await store.load();

    store.applyUpdate({ id: 1, currentCapacity: 35, category: 'red' });
    expect(store.highlights[1]).toBe(15);

    vi.advanceTimersByTime(2599);
    expect(store.highlights[1]).toBe(15);

    vi.advanceTimersByTime(1);
    expect(store.highlights[1]).toBeUndefined();

    vi.useRealTimers();
  });

  it('applyUpdate restarts the highlight timer on a second update for the same slot', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchTimeSlots).mockResolvedValue([makeTimeSlot({ id: 1, current: 20 })]);
    const store = useSlotsStore();
    await store.load();

    store.applyUpdate({ id: 1, currentCapacity: 25, category: 'yellow' });
    vi.advanceTimersByTime(2000);
    store.applyUpdate({ id: 1, currentCapacity: 30, category: 'yellow' });
    vi.advanceTimersByTime(2000);

    expect(store.highlights[1]).toBe(5);

    vi.advanceTimersByTime(600);
    expect(store.highlights[1]).toBeUndefined();

    vi.useRealTimers();
  });

  it('applyUpdate appends to recentUpdates and calls touch', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([makeTimeSlot({ id: 1 })]);
    const store = useSlotsStore();
    await store.load();
    const before = store.lastUpdateAt;

    store.applyUpdate({ id: 1, currentCapacity: 35, category: 'red' });

    expect(store.recentUpdates).toHaveLength(1);
    expect(store.recentUpdates[0]).toMatchObject({ id: 1, current: 35, category: 'red' });
    expect(store.lastUpdateAt).not.toBe(before);
  });

  it('applyUpdate caps recentUpdates at 10 entries, dropping the oldest', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([makeTimeSlot({ id: 1, current: 0 })]);
    const store = useSlotsStore();
    await store.load();

    for (let current = 1; current <= 11; current += 1) {
      store.applyUpdate({ id: 1, currentCapacity: current, category: 'yellow' });
    }

    expect(store.recentUpdates).toHaveLength(10);
    expect(store.recentUpdates[0]).toMatchObject({ current: 2 });
    expect(store.recentUpdates[9]).toMatchObject({ current: 11 });
  });

  it('applyUpdate still syncs state and touches, but skips highlight/recentUpdates when nothing actually changed', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([
      makeTimeSlot({ id: 1, current: 20, category: 'yellow' }),
    ]);
    const store = useSlotsStore();
    await store.load();
    const before = store.lastUpdateAt;

    store.applyUpdate({ id: 1, currentCapacity: 20, category: 'yellow' });

    expect(store.highlights[1]).toBeUndefined();
    expect(store.recentUpdates).toHaveLength(0);
    expect(store.lastUpdateAt).not.toBe(before);
  });

  it('applyUpdate still highlights a category-only change even when the count stays the same', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([
      makeTimeSlot({ id: 1, current: 20, category: 'yellow' }),
    ]);
    const store = useSlotsStore();
    await store.load();

    store.applyUpdate({ id: 1, currentCapacity: 20, category: 'red' });

    expect(store.highlights[1]).toBe(0);
    expect(store.recentUpdates).toHaveLength(1);
  });

  it('applyUpdate ignores and logs an update for an unknown slot id', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(fetchTimeSlots).mockResolvedValue([makeTimeSlot({ id: 1 })]);
    const store = useSlotsStore();
    await store.load();

    store.applyUpdate({ id: 999, currentCapacity: 10, category: 'green' });

    expect(store.selectedDay?.slots[0]).toMatchObject({ current: 20 });
    expect(store.recentUpdates).toHaveLength(0);
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('clearHighlights removes all pending highlights and cancels their timers', async () => {
    vi.useFakeTimers();
    vi.mocked(fetchTimeSlots).mockResolvedValue([
      makeTimeSlot({ id: 1, current: 20 }),
      makeTimeSlot({ id: 2, current: 20 }),
    ]);
    const store = useSlotsStore();
    await store.load();
    store.applyUpdate({ id: 1, currentCapacity: 25, category: 'yellow' });
    store.applyUpdate({ id: 2, currentCapacity: 25, category: 'yellow' });

    store.clearHighlights();

    expect(store.highlights).toEqual({});
    vi.advanceTimersByTime(5000);
    expect(store.highlights).toEqual({});

    vi.useRealTimers();
  });

  it('setDate clears highlights from the previous day', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([
      makeTimeSlot({ id: 1, date: '2024-07-23' }),
      makeTimeSlot({ id: 2, date: '2024-07-24' }),
    ]);
    const store = useSlotsStore();
    await store.load();
    store.applyUpdate({ id: 1, currentCapacity: 35, category: 'red' });
    expect(store.highlights[1]).toBeDefined();

    store.setDate('2024-07-24');

    expect(store.highlights).toEqual({});
  });

  it('rowsForSelectedDay builds one flat row list for the selected day', async () => {
    vi.mocked(fetchTimeSlots).mockResolvedValue([
      makeTimeSlot({ id: 1, start: '08:00', end: '08:30' }),
      makeTimeSlot({ id: 2, start: '13:00', end: '13:30' }),
    ]);
    const store = useSlotsStore();
    await store.load();

    expect(store.rowsForSelectedDay).toEqual([
      { type: 'slot', key: 'slot-1', slot: expect.objectContaining({ id: 1 }) },
      { type: 'gap', key: 'gap-510', from: 510, to: 780 },
      { type: 'slot', key: 'slot-2', slot: expect.objectContaining({ id: 2 }) },
    ]);
  });

  it('rowsForSelectedDay is empty when there is no selected day', () => {
    const store = useSlotsStore();

    expect(store.rowsForSelectedDay).toEqual([]);
  });

  it('selectedDaySummary is null when there is no selected day', () => {
    const store = useSlotsStore();

    expect(store.selectedDay).toBeNull();
    expect(store.selectedDaySummary).toBeNull();
  });

  it('setConnection updates the connection state', () => {
    const store = useSlotsStore();

    store.setConnection('live');
    expect(store.connection).toBe('live');
  });

  it('touch sets lastUpdateAt to the current time', () => {
    const store = useSlotsStore();

    store.touch();

    expect(store.lastUpdateAt).toBeInstanceOf(Date);
  });

  it('toggleCategory adds and removes a category from hiddenCategories', () => {
    const store = useSlotsStore();

    store.toggleCategory('red');
    expect(store.isCategoryHidden('red')).toBe(true);

    store.toggleCategory('red');
    expect(store.isCategoryHidden('red')).toBe(false);
  });
});
