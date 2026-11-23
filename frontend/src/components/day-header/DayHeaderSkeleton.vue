<script setup lang="ts">
import SkeletonBlock from '../base/SkeletonBlock.vue';
</script>

<template>
  <div
    class="day-header"
    aria-hidden="true"
  >
    <div class="day-header__info">
      <!-- width scales via min() instead of a media query, since an inline style always wins over one -->
      <SkeletonBlock
        width="min(280px, 60vw)"
        height="28px"
      />
      <SkeletonBlock
        width="min(360px, 70vw)"
        height="16px"
      />
    </div>
    <div class="day-header__chips">
      <SkeletonBlock
        width="96px"
        height="36px"
        pill
      />
      <SkeletonBlock
        width="96px"
        height="36px"
        pill
      />
      <SkeletonBlock
        width="96px"
        height="36px"
        pill
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.day-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: $space-3;

  &__info {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__chips {
    display: flex;
    gap: $space-2;
  }
}
</style>
