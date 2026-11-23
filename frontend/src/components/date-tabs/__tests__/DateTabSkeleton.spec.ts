import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DateTabSkeleton from '../DateTabSkeleton.vue';

describe('DateTabSkeleton', () => {
  it('renders as a hidden, non-interactive placeholder', () => {
    const wrapper = mount(DateTabSkeleton);
    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });
});
