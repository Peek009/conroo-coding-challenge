<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { Category } from '../../domain/timeSlot.js';

defineProps<{ counts: Record<Category, number>; hidden: ReadonlySet<Category> }>();
defineEmits<{ toggle: [category: Category] }>();

const { t } = useI18n();
const CATEGORIES: Category[] = ['green', 'yellow', 'red'];
</script>

<template>
  <div class="category-filter">
    <span class="category-filter__label">{{ t('day.show') }}</span>
    <button
      v-for="category in CATEGORIES"
      :key="category"
      type="button"
      class="filter-chip"
      :class="`filter-chip--${category}`"
      :aria-pressed="!hidden.has(category)"
      @click="$emit('toggle', category)"
    >
      <span class="filter-chip__dot" />
      <span class="filter-chip__label">{{ t(`category.${category}`) }}</span>
      <span class="filter-chip__count">{{ counts[category] }}</span>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.category-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $space-2;

  &__label {
    font-size: $fs-md;
    color: $color-muted;
  }
}

.filter-chip {
  min-height: 36px;
  padding: 6px 12px;
  border-radius: $radius-pill;
  border: 1px solid transparent;
  font-size: $fs-md;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: $space-2;

  &--green {
    border-color: $cat-green-bar;
    background: $cat-green-bg;
    color: $cat-green-fg;

    .filter-chip__dot {
      background: $cat-green-bar;
    }
  }

  &--yellow {
    border-color: $cat-yellow-bar;
    background: $cat-yellow-bg;
    color: $cat-yellow-fg;

    .filter-chip__dot {
      background: $cat-yellow-bar;
    }
  }

  &--red {
    border-color: $cat-red-bar;
    background: $cat-red-bg;
    color: $cat-red-fg;

    .filter-chip__dot {
      background: $cat-red-bar;
    }
  }

  &[aria-pressed='false'] {
    background: $color-surface;
    color: $color-muted;
    border-color: $color-border-inactive;

    .filter-chip__dot {
      background: $color-border-inactive;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &__count {
    font-family: $font-mono;
    font-weight: 500;
  }
}

@media (width <= $breakpoint-mobile) {
  .category-filter__label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .filter-chip {
    padding: 6px 10px;
    gap: 6px;
  }
}
</style>
