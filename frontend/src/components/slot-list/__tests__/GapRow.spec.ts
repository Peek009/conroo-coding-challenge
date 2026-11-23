import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

import { i18n } from '../../../i18n/index.js';
import GapRow from '../GapRow.vue';

describe('GapRow', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en';
  });

  it('shows the time range and the no-slots message in separate columns', () => {
    const wrapper = mount(GapRow, {
      props: { from: 720, to: 780 },
      global: { plugins: [i18n] },
    });

    expect(wrapper.get('.gap-row__time').text()).toBe('12:00 – 13:00');
    expect(wrapper.get('.gap-row__label').text()).toBe('No slots');
  });
});
