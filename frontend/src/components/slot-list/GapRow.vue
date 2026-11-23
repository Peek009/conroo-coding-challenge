<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { formatClockTime } from '../../domain/timeSlot.js';

const props = defineProps<{ from: number; to: number }>();

const { t } = useI18n();
</script>

<template>
  <li class="gap-row">
    <span class="gap-row__time"
      >{{ formatClockTime(props.from) }} – {{ formatClockTime(props.to) }}</span
    >
    <span class="gap-row__line">
      <span class="gap-row__label">{{ t('slot.noSlots') }}</span>
    </span>
  </li>
</template>

<style scoped lang="scss">
@use 'sass:list';
@use '../../assets/styles/variables' as *;

.gap-row {
  display: grid;
  grid-template-columns: list.nth($slot-row-columns, 1) list.nth($slot-row-columns, 2);
  gap: $space-4;
  align-items: center;
  padding: 0 20px;
  min-height: 44px;
  border-bottom: 1px solid $color-border-subtle;
  color: $color-muted;
  font-size: $fs-md;

  &__time {
    font-family: $font-mono;
    font-weight: 600;
  }

  &__line {
    position: relative;
    border-top: 1px dashed $color-border-dashed;
  }

  &__label {
    position: relative;
    top: -10px;
    background: $color-surface;
    padding-right: $space-2;
  }
}

@media (width <= $breakpoint-mobile) {
  .gap-row {
    grid-template-columns: 76px minmax(0, 1fr);
    padding: 8px 14px;
  }
}
</style>
