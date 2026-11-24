import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../../i18n/index.js';
import { useSlotsStore } from '../../../stores/slots.js';
import SlotAnnouncer from '../SlotAnnouncer.vue';

describe('SlotAnnouncer', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    i18n.global.locale.value = 'en';
  });

  it('is one polite live region, empty when there are no updates yet', () => {
    const wrapper = mount(SlotAnnouncer, { global: { plugins: [i18n] } });

    expect(wrapper.attributes('aria-live')).toBe('polite');
    expect(wrapper.text()).toBe('');
  });

  it('announces the newest recentUpdates entry', async () => {
    const store = useSlotsStore();
    store.slotsById = new Map([
      [
        1,
        {
          id: 1,
          startTime: '2024-07-23T08:00:00',
          endTime: '2024-07-23T08:30:00',
          category: 'yellow' as const,
          capacity: { current: 20, max: 50 },
        },
      ],
    ]);
    const wrapper = mount(SlotAnnouncer, { global: { plugins: [i18n] } });

    store.applyUpdate({ id: 1, currentCapacity: 35, category: 'red' });
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toBe('Tuesday, 23 July 2024, 08:00–08:30: 35 of 50 booked, Almost full');
  });
});
