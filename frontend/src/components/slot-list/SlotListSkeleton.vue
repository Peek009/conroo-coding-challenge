<script setup lang="ts">
import SkeletonBlock from '../base/SkeletonBlock.vue';
</script>

<template>
  <ol
    class="slot-panel__rows"
    aria-hidden="true"
  >
    <li
      v-for="row in 6"
      :key="row"
      class="slot-row slot-row--skeleton"
    >
      <SkeletonBlock
        width="80px"
        height="14px"
      />
      <SkeletonBlock
        width="100%"
        height="10px"
      />
      <SkeletonBlock
        class="slot-row__skeleton-hide"
        width="60px"
        height="14px"
      />
      <SkeletonBlock
        class="slot-row__skeleton-hide"
        width="60px"
        height="14px"
      />
      <SkeletonBlock
        width="90px"
        height="22px"
        pill
      />
    </li>
  </ol>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.slot-panel__rows {
  list-style: none;
  margin: 0;
  padding: 0;
}

.slot-row {
  display: grid;
  grid-template-columns: $slot-row-columns;
  gap: $space-4;
  align-items: center;
  padding: 0 20px;
  min-height: 56px;
  border-bottom: 1px solid $color-border-subtle;
  pointer-events: none;
}

@media (width <= $breakpoint-mobile) {
  .slot-row {
    grid-template-columns: 76px 1fr auto;
    padding: 10px 14px;
    min-height: unset;
  }

  .slot-row__skeleton-hide {
    display: none;
  }
}
</style>
