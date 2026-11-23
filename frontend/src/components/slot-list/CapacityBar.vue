<script setup lang="ts">
import { computed } from 'vue';

import type { Category } from '../../domain/timeSlot.js';

const props = defineProps<{ current: number; max: number; category: Category }>();

const percent = computed(() => Math.round((props.current / props.max) * 100));
</script>

<template>
  <div
    class="capacity-bar"
    :data-category="category"
    aria-hidden="true"
  >
    <span
      class="capacity-bar__fill"
      :style="{ width: `${percent}%` }"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.capacity-bar {
  height: 10px;
  border-radius: 5px;
  background: $color-border-subtle;
  overflow: hidden;

  &__fill {
    display: block;
    height: 100%;
    border-radius: 5px;
    background: var(--cat-bar);
    transition:
      width 0.5s ease,
      background 0.4s ease;
  }
}

@media (prefers-reduced-motion: reduce) {
  .capacity-bar__fill {
    transition: none;
  }
}
</style>
