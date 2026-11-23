import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../../i18n/index.js';
import { makeDaySlot } from '../../../test-utils/fixtures.js';
import SlotRow from '../SlotRow.vue';

describe('SlotRow', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en';
  });

  it('shows the time range and free count, hidden from the accessibility tree since aria-label covers it', () => {
    const wrapper = mount(SlotRow, {
      props: { daySlot: makeDaySlot() },
      global: { plugins: [i18n] },
    });

    expect(wrapper.get('.slot-row__time').text()).toBe('08:00 – 08:30');
    expect(wrapper.get('.slot-row__time').attributes('aria-hidden')).toBe('true');
    expect(wrapper.get('.slot-row__free').text()).toBe('30 free');
  });

  it('shows "Fully booked" in red text in the --full state', () => {
    const wrapper = mount(SlotRow, {
      props: { daySlot: makeDaySlot({ current: 50, max: 50 }) },
      global: { plugins: [i18n] },
    });

    expect(wrapper.classes()).toContain('slot-row--full');
    expect(wrapper.get('.slot-row__free').text()).toBe('Fully booked');
  });

  it('shows the signed capacity-change tag only when capacityChange is set', () => {
    const notUpdated = mount(SlotRow, {
      props: { daySlot: makeDaySlot() },
      global: { plugins: [i18n] },
    });
    expect(notUpdated.classes()).not.toContain('slot-row--updated');
    expect(notUpdated.find('.slot-row__updated-tag').exists()).toBe(false);

    const updated = mount(SlotRow, {
      props: { daySlot: makeDaySlot(), capacityChange: 6 },
      global: { plugins: [i18n] },
    });
    expect(updated.classes()).toContain('slot-row--updated');
    expect(updated.get('.slot-row__updated-tag').text()).toBe('+6');
  });

  it('formats a negative capacity change with a minus sign', () => {
    const wrapper = mount(SlotRow, {
      props: { daySlot: makeDaySlot(), capacityChange: -4 },
      global: { plugins: [i18n] },
    });

    expect(wrapper.get('.slot-row__updated-tag').text()).toBe('−4');
  });

  it('has an aria-label with time, booked/max and the translated category', () => {
    const wrapper = mount(SlotRow, {
      props: { daySlot: makeDaySlot({ current: 20, max: 50, category: 'yellow' }) },
      global: { plugins: [i18n] },
    });

    expect(wrapper.attributes('aria-label')).toBe('08:00 – 08:30, 20 / 50 booked, Limited');
  });
});
