<script setup lang="ts">
withDefaults(defineProps<{ width?: string; height?: string; pill?: boolean }>(), {
  width: '100%',
  height: '14px',
  pill: false,
});
</script>

<template>
  <span
    class="skeleton-block"
    :class="{ 'skeleton-block--pill': pill }"
    :style="{ width, height }"
  />
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.skeleton-block {
  display: block;
  border-radius: 4px;
  background: $color-skeleton;
  animation: skeleton-block-shimmer 1.4s ease-in-out infinite;

  &--pill {
    border-radius: $radius-pill;
  }
}

@keyframes skeleton-block-shimmer {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-block {
    animation: none;
  }
}
</style>
