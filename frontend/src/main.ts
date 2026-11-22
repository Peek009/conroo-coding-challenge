import { createApp } from 'vue'

import App from './App.vue'
import './assets/styles/main.scss'
import { i18n } from './i18n'
import { pinia } from './stores'

createApp(App).use(pinia).use(i18n).mount('#app')
