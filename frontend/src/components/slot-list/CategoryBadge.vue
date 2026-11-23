<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { Category } from '../../domain/timeSlot.js';

defineProps<{ category: Category; size: 'full' | 'icon' }>();

const { t } = useI18n();
</script>

<template>
  <span
    class="category-badge"
    :class="{ 'category-badge--icon': size === 'icon' }"
    :data-category="category"
  >
    <span
      class="category-badge__icon"
      aria-hidden="true"
    />
    <span class="category-badge__label">{{ t(`category.${category}`) }}</span>
  </span>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: $radius-pill;
  background: var(--cat-bg);
  color: var(--cat-fg);
  font-size: $fs-sm;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background 0.4s ease,
    color 0.4s ease;

  &--icon {
    padding: 8px;

    .category-badge__label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }

  &__icon {
    display: block;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    background-color: currentcolor;
    mask-image: var(--cat-icon);
    mask-repeat: no-repeat;
    mask-size: contain;
    mask-position: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-badge {
    transition: none;
  }
}
</style>
