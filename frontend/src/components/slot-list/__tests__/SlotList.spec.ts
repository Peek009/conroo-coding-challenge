import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../../i18n/index.js';
import { useSlotsStore } from '../../../stores/slots.js';
import { makeTimeSlot } from '../../../test-utils/fixtures.js';
import GapRow from '../GapRow.vue';
import SlotList from '../SlotList.vue';
import SlotListSkeleton from '../SlotListSkeleton.vue';
import SlotRow from '../SlotRow.vue';

describe('SlotList', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    i18n.global.locale.value = 'en';
  });

  it('shows the skeleton while there is no data yet (idle)', () => {
    const wrapper = mount(SlotList, { global: { plugins: [i18n] } });

    expect(wrapper.findComponent(SlotListSkeleton).exists()).toBe(true);
  });

  it('renders the column headers and one flat list of rows, with a gap between non-touching slots', () => {
    const store = useSlotsStore();
    store.status = 'ready';
    store.slotsById = new Map([
      [1, makeTimeSlot({ id: 1, start: '08:00', end: '08:30' })],
      [2, makeTimeSlot({ id: 2, start: '13:00', end: '13:30' })],
    ]);
    store.selectedDate = '2024-07-23';
    const wrapper = mount(SlotList, { global: { plugins: [i18n] } });

    expect(wrapper.findComponent(SlotListSkeleton).exists()).toBe(false);
    expect(wrapper.get('.slot-panel__columns').text()).toContain('Time');
    expect(wrapper.findAllComponents(SlotRow)).toHaveLength(2);
    expect(wrapper.findComponent(GapRow).exists()).toBe(true);
  });

  it('cuts a row out when its category is hidden', () => {
    const store = useSlotsStore();
    store.status = 'ready';
    store.slotsById = new Map([
      [1, makeTimeSlot({ id: 1, start: '08:00', end: '08:30' })],
      [2, makeTimeSlot({ id: 2, start: '08:30', end: '09:00', category: 'green' })],
    ]);
    store.selectedDate = '2024-07-23';
    store.toggleCategory('yellow');
    const wrapper = mount(SlotList, { global: { plugins: [i18n] } });

    expect(wrapper.findAllComponents(SlotRow)).toHaveLength(1);
    expect(wrapper.findComponent(SlotRow).props('daySlot').id).toBe(2);
  });
});
