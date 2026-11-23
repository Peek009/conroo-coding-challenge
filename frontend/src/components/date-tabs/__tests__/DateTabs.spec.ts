import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../../i18n/index.js';
import { useSlotsStore } from '../../../stores/slots.js';
import { makeTimeSlot } from '../../../test-utils/fixtures.js';
import DateTabs from '../DateTabs.vue';

describe('DateTabs', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    i18n.global.locale.value = 'en';
  });

  it('renders one real tab per day once ready', () => {
    const store = useSlotsStore();
    store.status = 'ready';
    store.slotsById = new Map([
      [1, makeTimeSlot({ id: 1, date: '2024-07-23' })],
      [2, makeTimeSlot({ id: 2, date: '2024-07-24' })],
    ]);
    store.selectedDate = '2024-07-23';
    const wrapper = mount(DateTabs, { global: { plugins: [i18n] } });

    expect(wrapper.findAll('.date-tab--skeleton')).toHaveLength(0);
    expect(wrapper.findAll('button.date-tab')).toHaveLength(2);
  });

  it('selecting a tab calls store.setDate', async () => {
    const store = useSlotsStore();
    store.status = 'ready';
    store.slotsById = new Map([
      [1, makeTimeSlot({ id: 1, date: '2024-07-23' })],
      [2, makeTimeSlot({ id: 2, date: '2024-07-24' })],
    ]);
    store.selectedDate = '2024-07-23';
    const wrapper = mount(DateTabs, { global: { plugins: [i18n] } });

    await wrapper.findAll('button.date-tab')[1]!.trigger('click');

    expect(store.selectedDate).toBe('2024-07-24');
  });
});
