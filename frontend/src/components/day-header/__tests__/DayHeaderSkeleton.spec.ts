import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SkeletonBlock from '../../base/SkeletonBlock.vue';
import DayHeaderSkeleton from '../DayHeaderSkeleton.vue';

describe('DayHeaderSkeleton', () => {
  it('is hidden from the accessibility tree and shows placeholders for the title, meta and three chips', () => {
    const wrapper = mount(DayHeaderSkeleton);

    expect(wrapper.attributes('aria-hidden')).toBe('true');
    expect(wrapper.findAllComponents(SkeletonBlock)).toHaveLength(5);
    expect(wrapper.findAllComponents(SkeletonBlock).filter((b) => b.props('pill'))).toHaveLength(3);
  });
});
