import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import {
  buildSlotRows,
  daySummary,
  groupByDate,
  mergeTimeSlotUpdate,
  toDaySlot,
  type Category,
  type DaySlot,
  type TimeSlot,
  type TimeSlotUpdate,
} from '../domain/timeSlot.js';
import { fetchTimeSlots } from '../services/timeSlotsApi.js';

export type SlotsStatus = 'idle' | 'loading' | 'ready' | 'error';
export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting' | 'offline';

const HIGHLIGHT_MS = 2600;
const MAX_RECENT_UPDATES = 10;

export const useSlotsStore = defineStore('slots', () => {
  const status = ref<SlotsStatus>('idle');
  const slotsById = ref<Map<number, TimeSlot>>(new Map());
  const connection = ref<ConnectionStatus>('connecting');
  const lastUpdateAt = ref<Date | null>(null);
  const selectedDate = ref<string | null>(null);
  const hiddenCategories = ref<Set<Category>>(new Set());
  const highlights = ref<Record<number, number>>({});
  const recentUpdates = ref<DaySlot[]>([]);

  const highlightTimers = new Map<number, ReturnType<typeof setTimeout>>();

  const days = computed(() => groupByDate([...slotsById.value.values()].map(toDaySlot)));

  const selectedDay = computed(
    () => days.value.find((day) => day.date === selectedDate.value) ?? null,
  );

  const selectedDaySummary = computed(() =>
    selectedDay.value ? daySummary(selectedDay.value.slots) : null,
  );

  const rowsForSelectedDay = computed(() =>
    selectedDay.value ? buildSlotRows(selectedDay.value.slots) : [],
  );

  function isCategoryHidden(category: Category): boolean {
    return hiddenCategories.value.has(category);
  }

  function touch(): void {
    lastUpdateAt.value = new Date();
  }

  async function load(): Promise<void> {
    status.value = 'loading';
    try {
      const slots = await fetchTimeSlots();
      slotsById.value = new Map(slots.map((slot) => [slot.id, slot]));
      status.value = 'ready';
      touch();

      const dates = days.value.map((day) => day.date);
      if (!selectedDate.value || !dates.includes(selectedDate.value)) {
        selectedDate.value = dates[0] ?? null;
      }
    } catch {
      status.value = 'error';
    }
  }

  function applyUpdate(update: TimeSlotUpdate): void {
    const existing = slotsById.value.get(update.id);
    if (!existing) {
      console.warn('received update for unknown slot', update.id);
      return;
    }

    const capacityChange = update.currentCapacity - existing.capacity.current;
    const hasChanged = capacityChange !== 0 || update.category !== existing.category;

    const merged = mergeTimeSlotUpdate([...slotsById.value.values()], update);
    slotsById.value = new Map(merged.map((slot) => [slot.id, slot]));
    touch();

    if (!hasChanged) return;

    highlights.value = { ...highlights.value, [update.id]: capacityChange };

    clearTimeout(highlightTimers.get(update.id));
    highlightTimers.set(
      update.id,
      setTimeout(() => {
        highlights.value = Object.fromEntries(
          Object.entries(highlights.value).filter(([id]) => Number(id) !== update.id),
        );
        highlightTimers.delete(update.id);
      }, HIGHLIGHT_MS),
    );

    const updated = merged.find((slot) => slot.id === update.id);
    if (updated) {
      recentUpdates.value = [...recentUpdates.value, toDaySlot(updated)].slice(-MAX_RECENT_UPDATES);
    }
  }

  function clearHighlights(): void {
    highlightTimers.forEach((timer) => clearTimeout(timer));
    highlightTimers.clear();
    highlights.value = {};
  }

  function setConnection(state: ConnectionStatus): void {
    connection.value = state;
  }

  function setDate(date: string): void {
    selectedDate.value = date;
    clearHighlights();
  }

  function toggleCategory(category: Category): void {
    const next = new Set(hiddenCategories.value);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    hiddenCategories.value = next;
  }

  return {
    status,
    slotsById,
    connection,
    lastUpdateAt,
    selectedDate,
    hiddenCategories,
    highlights,
    recentUpdates,
    days,
    selectedDay,
    selectedDaySummary,
    rowsForSelectedDay,
    isCategoryHidden,
    load,
    applyUpdate,
    clearHighlights,
    setConnection,
    touch,
    setDate,
    toggleCategory,
  };
});
