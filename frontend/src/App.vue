<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

import AppHeader from './components/AppHeader.vue'
import { useSlotStream } from './composables/useSlotStream.js'
import { useSlotsStore } from './stores/slots.js'

const slotsStore = useSlotsStore()
const slotStream = useSlotStream()

onMounted(() => {
  void slotsStore.load()
  slotStream.start()
})

onUnmounted(() => {
  slotStream.stop()
})
</script>

<template>
  <div class="app">
    <AppHeader />
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh;
}
</style>
