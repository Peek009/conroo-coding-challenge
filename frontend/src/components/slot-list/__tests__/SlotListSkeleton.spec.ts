import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SlotListSkeleton from '../SlotListSkeleton.vue';

describe('SlotListSkeleton', () => {
  it('shows six placeholder rows, hidden from the accessibility tree', () => {
    const wrapper = mount(SlotListSkeleton);

    expect(wrapper.attributes('aria-hidden')).toBe('true');
    expect(wrapper.findAll('.slot-row--skeleton')).toHaveLength(6);
  });
});
