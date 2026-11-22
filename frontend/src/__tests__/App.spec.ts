import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'

import App from '../App.vue'
import { i18n } from '../i18n'

vi.mock('../services/timeSlotsApi.js', () => ({
  fetchTimeSlots: vi.fn().mockResolvedValue([]),
}))

vi.mock('../services/timeSlotsSse.js', () => ({
  subscribeToTimeSlotUpdates: vi.fn().mockReturnValue(vi.fn()),
}))

describe('App', () => {
  it('renders the header with the translated title', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), i18n],
      },
    })

    expect(wrapper.get('h1.app-header__title').text()).toBe('Terminal Slot Reservations')
  })
})
