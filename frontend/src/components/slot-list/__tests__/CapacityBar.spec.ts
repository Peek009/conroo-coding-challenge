import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import CapacityBar from '../CapacityBar.vue';

describe('CapacityBar', () => {
  it('sets the fill width from current/max', () => {
    const wrapper = mount(CapacityBar, { props: { current: 25, max: 50, category: 'yellow' } });

    expect(wrapper.get('.capacity-bar__fill').attributes('style')).toContain('width: 50%');
  });

  it('is hidden from the accessibility tree', () => {
    const wrapper = mount(CapacityBar, { props: { current: 10, max: 50, category: 'green' } });

    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });

  it('sets data-category for the shared CSS variables', () => {
    const wrapper = mount(CapacityBar, { props: { current: 10, max: 50, category: 'red' } });

    expect(wrapper.attributes('data-category')).toBe('red');
  });
});
