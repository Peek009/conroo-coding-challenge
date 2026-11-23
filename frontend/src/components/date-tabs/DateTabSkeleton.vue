<script setup lang="ts">
import SkeletonBlock from '../base/SkeletonBlock.vue';
</script>

<template>
  <div
    class="date-tab date-tab--skeleton"
    aria-hidden="true"
  >
    <span class="date-tab__row">
      <SkeletonBlock
        width="110px"
        height="18px"
      />
      <SkeletonBlock
        class="date-tab__skeleton-hide"
        width="56px"
        height="12px"
      />
    </span>
    <SkeletonBlock
      class="date-tab__skeleton-hide"
      width="100%"
      height="6px"
    />
    <SkeletonBlock
      class="date-tab__skeleton-hide"
      width="70%"
      height="12px"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.date-tab {
  min-height: 44px;
  padding: 14px $space-4;
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  background: $color-surface;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
    gap: $space-2;
  }
}

@media (width <= 640px) {
  .date-tab {
    padding: 10px;
    align-items: center;
    gap: 2px;
  }

  .date-tab__skeleton-hide {
    display: none;
  }
}
</style>
