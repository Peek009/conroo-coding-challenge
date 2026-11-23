import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../../i18n/index.js';
import CategoryBadge from '../CategoryBadge.vue';

describe('CategoryBadge', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en';
  });

  it('renders the translated label from category.<value>, never the raw string', () => {
    const wrapper = mount(CategoryBadge, {
      props: { category: 'yellow', size: 'full' },
      global: { plugins: [i18n] },
    });

    expect(wrapper.get('.category-badge__label').text()).toBe('Limited');
  });

  it('sets data-category so the shared CSS variables (color and icon) apply', () => {
    const wrapper = mount(CategoryBadge, {
      props: { category: 'red', size: 'full' },
      global: { plugins: [i18n] },
    });

    expect(wrapper.attributes('data-category')).toBe('red');
  });

  it('renders a single icon element, hidden from the accessibility tree', () => {
    const wrapper = mount(CategoryBadge, {
      props: { category: 'green', size: 'full' },
      global: { plugins: [i18n] },
    });

    const icons = wrapper.findAll('.category-badge__icon');
    expect(icons).toHaveLength(1);
    expect(icons[0]!.attributes('aria-hidden')).toBe('true');
  });

  it('visually hides the label in icon size while keeping it in the accessibility tree', () => {
    const wrapper = mount(CategoryBadge, {
      props: { category: 'green', size: 'icon' },
      global: { plugins: [i18n] },
    });

    expect(wrapper.classes()).toContain('category-badge--icon');
    expect(wrapper.get('.category-badge__label').text()).toBe('Available');
  });
});
