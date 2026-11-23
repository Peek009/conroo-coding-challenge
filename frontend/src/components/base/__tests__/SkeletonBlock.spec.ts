import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import SkeletonBlock from '../SkeletonBlock.vue';

describe('SkeletonBlock', () => {
  it('defaults to a full-width text-sized bar', () => {
    const wrapper = mount(SkeletonBlock);

    expect(wrapper.attributes('style')).toContain('width: 100%');
    expect(wrapper.attributes('style')).toContain('height: 14px');
    expect(wrapper.classes()).not.toContain('skeleton-block--pill');
  });

  it('sizes itself from the width/height props', () => {
    const wrapper = mount(SkeletonBlock, { props: { width: '96px', height: '36px' } });

    expect(wrapper.attributes('style')).toContain('width: 96px');
    expect(wrapper.attributes('style')).toContain('height: 36px');
  });

  it('applies a pill radius when pill is set', () => {
    const wrapper = mount(SkeletonBlock, { props: { pill: true } });

    expect(wrapper.classes()).toContain('skeleton-block--pill');
  });

  it('forwards a class passed by the parent onto its own root, for per-use overrides', () => {
    const wrapper = mount(SkeletonBlock, { attrs: { class: 'hide-on-mobile' } });

    expect(wrapper.classes()).toContain('hide-on-mobile');
  });
});
