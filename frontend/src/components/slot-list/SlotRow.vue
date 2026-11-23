<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatClockTime, type DaySlot } from '../../domain/timeSlot.js';
import CapacityBar from './CapacityBar.vue';
import CategoryBadge from './CategoryBadge.vue';

const props = defineProps<{ daySlot: DaySlot; capacityChange?: number }>();

const { t } = useI18n();

const isFull = computed(() => props.daySlot.current >= props.daySlot.max);
const isUpdated = computed(() => props.capacityChange !== undefined);

const timeRange = computed(
  () => `${formatClockTime(props.daySlot.start)} – ${formatClockTime(props.daySlot.end)}`,
);

const freeText = computed(() => {
  const free = props.daySlot.max - props.daySlot.current;
  return free <= 0 ? t('slot.fullyBooked') : t('slot.free', { n: free });
});

const capacityChangeText = computed(() => {
  const capacityChange = props.capacityChange ?? 0;
  const sign = capacityChange > 0 ? '+' : '−';
  return t('slot.updated', { change: `${sign}${Math.abs(capacityChange)}` });
});

const ariaLabel = computed(
  () =>
    `${timeRange.value}, ${props.daySlot.current} / ${props.daySlot.max} ${t('slot.booked')}, ${t(`category.${props.daySlot.category}`)}`,
);
</script>

<template>
  <li
    class="slot-row"
    :class="{ 'slot-row--full': isFull, 'slot-row--updated': isUpdated }"
    :aria-label="ariaLabel"
  >
    <span
      class="slot-row__time"
      aria-hidden="true"
      >{{ timeRange }}</span
    >
    <CapacityBar
      :current="daySlot.current"
      :max="daySlot.max"
      :category="daySlot.category"
    />
    <span
      class="slot-row__numbers"
      aria-hidden="true"
    >
      <span class="slot-row__count">
        <span class="slot-row__current">{{ daySlot.current }}</span>
        <span class="slot-row__max">/{{ daySlot.max }}</span>
        <span
          v-if="isUpdated"
          class="slot-row__updated-tag"
          >{{ capacityChangeText }}</span
        >
      </span>
      <span class="slot-row__free">{{ freeText }}</span>
    </span>
    <span
      class="slot-row__status"
      aria-hidden="true"
    >
      <CategoryBadge
        :category="daySlot.category"
        size="full"
      />
    </span>
  </li>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.slot-row {
  display: grid;
  grid-template-columns: $slot-row-columns;
  gap: $space-4;
  align-items: center;
  padding: 0 20px;
  min-height: 56px;
  border-bottom: 1px solid $color-border-subtle;
  transition: background 0.4s ease;

  &__time {
    font-family: $font-mono;
    font-size: $fs-base;
    font-weight: 600;
  }

  &__numbers {
    display: contents;
  }

  &__count {
    position: relative;
    font-family: $font-mono;
    font-size: $fs-base;
  }

  &__current {
    font-weight: 600;
  }

  &__max {
    color: $color-muted;
  }

  &__free {
    font-size: $fs-md;
    font-weight: 600;
  }

  &--full {
    .slot-row__free {
      color: $color-danger-text;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__updated-tag {
    position: absolute;
    top: 50%;
    left: 100%;
    margin-left: 6px;
    transform: translateY(-50%);
    font-size: $fs-sm;
    font-weight: 600;
    color: $color-accent;
    background: $color-accent-highlight;
    padding: 3px 8px;
    border-radius: $radius-sm;
    white-space: nowrap;
  }

  &--updated {
    animation: slot-row-flash $highlight-duration ease-out;
  }
}

@keyframes slot-row-flash {
  0% {
    background: $color-accent-highlight;
  }

  100% {
    background: transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slot-row {
    transition: none;

    &--updated {
      animation: none;
    }
  }
}

@media (width <= 640px) {
  .slot-row {
    background: $color-surface;
    border: 1px solid $color-border;
    box-shadow: $shadow-card;
    border-radius: $radius-lg;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'time numbers status'
      'time bar status';
    gap: 6px $space-3;
    padding: $space-3 14px;
    margin: 0 0 $space-3;
    border-bottom: none;

    &:last-child {
      margin-bottom: 0;
    }

    &__time {
      grid-area: time;
      font-size: $fs-md;
    }

    &__numbers {
      grid-area: numbers;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: $space-2;
    }

    &__current {
      font-size: $fs-base;
    }

    &__max {
      font-size: $fs-md;
    }

    &__free {
      font-size: $fs-sm;
    }

    &__status {
      grid-area: status;
    }

    &__updated-tag {
      display: none;
    }

    :deep(.capacity-bar) {
      grid-area: bar;
      height: 6px;
    }

    :deep(.category-badge) {
      padding: 8px;
    }

    :deep(.category-badge__label) {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
}
</style>
