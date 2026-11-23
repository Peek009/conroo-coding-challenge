import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../../i18n/index.js';
import type { Category } from '../../../domain/timeSlot.js';
import CategoryFilter from '../CategoryFilter.vue';

function hidden(...categories: Category[]): Set<Category> {
  return new Set(categories);
}

describe('CategoryFilter', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en';
  });

  it('renders one chip per category with its count', () => {
    const wrapper = mount(CategoryFilter, {
      props: { counts: { green: 3, yellow: 2, red: 1 }, hidden: hidden() },
      global: { plugins: [i18n] },
    });

    const chips = wrapper.findAll('.filter-chip');
    expect(chips).toHaveLength(3);
    expect(chips[0]!.get('.filter-chip__count').text()).toBe('3');
  });

  it('marks a hidden category as not pressed', () => {
    const wrapper = mount(CategoryFilter, {
      props: { counts: { green: 3, yellow: 2, red: 1 }, hidden: hidden('red') },
      global: { plugins: [i18n] },
    });

    expect(wrapper.get('.filter-chip--red').attributes('aria-pressed')).toBe('false');
    expect(wrapper.get('.filter-chip--green').attributes('aria-pressed')).toBe('true');
  });

  it('emits toggle with the clicked category', async () => {
    const wrapper = mount(CategoryFilter, {
      props: { counts: { green: 3, yellow: 2, red: 1 }, hidden: hidden() },
      global: { plugins: [i18n] },
    });

    await wrapper.get('.filter-chip--yellow').trigger('click');

    expect(wrapper.emitted('toggle')).toEqual([['yellow']]);
  });

  it('still shows the full count for a hidden category', () => {
    const wrapper = mount(CategoryFilter, {
      props: { counts: { green: 3, yellow: 2, red: 1 }, hidden: hidden('yellow') },
      global: { plugins: [i18n] },
    });

    expect(wrapper.get('.filter-chip--yellow .filter-chip__count').text()).toBe('2');
  });
});
