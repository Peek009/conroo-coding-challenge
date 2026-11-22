import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import App from '../App.vue'
import { i18n } from '../i18n'

describe('App', () => {
  it('renders the app title', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), i18n],
      },
    })

    expect(wrapper.find('.app__title').text()).toBe('Terminal Slot Reservations')
  })
})
