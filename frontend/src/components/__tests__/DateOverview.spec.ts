import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../i18n/index.js';
import { useSlotsStore } from '../../stores/slots.js';
import { makeTimeSlot } from '../../test-utils/fixtures.js';
import DateOverview from '../DateOverview.vue';
import DayHeader from '../day-header/DayHeader.vue';

describe('DateOverview', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    i18n.global.locale.value = 'en';
  });

  it('renders DayHeader and CategoryFilter for the selected day, filter counts unaffected by hidden categories', () => {
    const store = useSlotsStore();
    store.status = 'ready';
    store.slotsById = new Map([
      [1, makeTimeSlot({ id: 1, category: 'yellow' })],
      [2, makeTimeSlot({ id: 2, category: 'red' })],
    ]);
    store.selectedDate = '2024-07-23';
    store.toggleCategory('red');
    const wrapper = mount(DateOverview, { global: { plugins: [i18n] } });

    expect(wrapper.findComponent(DayHeader).exists()).toBe(true);
    expect(wrapper.get('.filter-chip--red .filter-chip__count').text()).toBe('1');
    expect(wrapper.get('.filter-chip--red').attributes('aria-pressed')).toBe('false');
  });

  it('toggling a category chip updates the store', async () => {
    const store = useSlotsStore();
    store.status = 'ready';
    store.slotsById = new Map([[1, makeTimeSlot({ id: 1, category: 'green' })]]);
    store.selectedDate = '2024-07-23';
    const wrapper = mount(DateOverview, { global: { plugins: [i18n] } });

    await wrapper.get('.filter-chip--green').trigger('click');

    expect(store.isCategoryHidden('green')).toBe(true);
  });
});
