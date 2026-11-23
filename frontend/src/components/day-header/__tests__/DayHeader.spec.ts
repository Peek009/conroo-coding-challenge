import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../../i18n/index.js';
import DayHeader from '../DayHeader.vue';

describe('DayHeader', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en';
  });

  it('renders the long date as an h2, not a page h1', () => {
    const wrapper = mount(DayHeader, {
      props: {
        date: '2024-07-23',
        summary: {
          slotCount: 2,
          counts: { green: 1, yellow: 1, red: 0 },
          booked: 40,
          capacity: 100,
          free: 60,
          from: 480,
          to: 540,
        },
      },
      global: { plugins: [i18n] },
    });

    expect(wrapper.find('h1').exists()).toBe(false);
    expect(wrapper.get('h2.day-header__title').text()).not.toBe('');
  });

  it('shows booked over capacity', () => {
    const wrapper = mount(DayHeader, {
      props: {
        date: '2024-07-23',
        summary: {
          slotCount: 1,
          counts: { green: 0, yellow: 1, red: 0 },
          booked: 40,
          capacity: 100,
          free: 60,
          from: 480,
          to: 510,
        },
      },
      global: { plugins: [i18n] },
    });

    expect(wrapper.get('.day-header__booked').text()).toBe('40/100');
  });
});
