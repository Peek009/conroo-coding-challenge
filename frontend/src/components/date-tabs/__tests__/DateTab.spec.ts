import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../../i18n/index.js';
import DateTab from '../DateTab.vue';

const summary = {
  slotCount: 4,
  counts: { green: 1, yellow: 2, red: 1 },
  booked: 60,
  capacity: 200,
  free: 140,
  from: 480,
  to: 600,
};

describe('DateTab', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en';
  });

  it('renders the formatted date and free count', () => {
    const wrapper = mount(DateTab, {
      props: { date: '2024-07-23', summary, selected: false },
      global: { plugins: [i18n] },
    });

    expect(wrapper.get('.date-tab__date').text()).not.toBe('');
    expect(wrapper.get('.date-tab__free').text()).toBe('140 free');
  });

  it('reflects selected state via aria-pressed and aria-current', () => {
    const wrapper = mount(DateTab, {
      props: { date: '2024-07-23', summary, selected: true },
      global: { plugins: [i18n] },
    });

    expect(wrapper.get('.date-tab').attributes('aria-pressed')).toBe('true');
    expect(wrapper.get('.date-tab').attributes('aria-current')).toBe('date');
  });

  it('emits select when clicked', async () => {
    const wrapper = mount(DateTab, {
      props: { date: '2024-07-23', summary, selected: false },
      global: { plugins: [i18n] },
    });

    await wrapper.get('.date-tab').trigger('click');

    expect(wrapper.emitted('select')).toHaveLength(1);
  });
});
