<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useIntlLocale } from '../../composables/useIntlLocale.js';
import { dateFromKey, type Category, type DaySummary } from '../../domain/timeSlot.js';

const props = defineProps<{ date: string; summary: DaySummary; selected: boolean }>();
defineEmits<{ select: [] }>();

const { t } = useI18n();
const intlLocale = useIntlLocale();

const CATEGORIES: Category[] = ['green', 'yellow', 'red'];

const formattedDate = computed(() =>
  new Intl.DateTimeFormat(intlLocale.value, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(dateFromKey(props.date)),
);
</script>

<template>
  <button
    class="date-tab"
    type="button"
    :aria-pressed="selected"
    :aria-current="selected ? 'date' : undefined"
    @click="$emit('select')"
  >
    <span class="date-tab__row">
      <span class="date-tab__date">{{ formattedDate }}</span>
      <span class="date-tab__free">{{ t('day.free', { n: summary.free }) }}</span>
    </span>
    <span
      class="date-tab__mix"
      aria-hidden="true"
    >
      <span
        v-for="category in CATEGORIES"
        :key="category"
        class="date-tab__mix-segment"
        :class="`date-tab__mix-segment--${category}`"
        :style="{ width: `${(summary.counts[category] / summary.slotCount) * 100}%` }"
      />
    </span>
    <span class="date-tab__counts">{{
      t('day.tabCounts', {
        g: summary.counts.green,
        y: summary.counts.yellow,
        r: summary.counts.red,
      })
    }}</span>
  </button>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.date-tab {
  scroll-snap-align: start;
  text-align: left;
  min-height: 44px;
  padding: 14px $space-4;
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  background: $color-surface;
  color: $color-ink;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    border-color: $color-accent;
  }

  &[aria-pressed='true'] {
    background: $color-accent;
    border-color: $color-accent;
    color: #fff;

    .date-tab__free,
    .date-tab__counts {
      color: $color-accent-on-dark;
    }
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
    gap: $space-2;
  }

  &__date {
    font-size: $fs-lg;
    font-weight: 600;
  }

  &__free {
    font-family: $font-mono;
    font-size: $fs-sm;
    color: $color-muted;
    white-space: nowrap;
  }

  &__mix {
    display: flex;
    width: 100%;
    height: 6px;
    gap: 2px;
  }

  &__mix-segment {
    border-radius: 3px;
    transition: width 0.4s ease;

    &--green {
      background: $cat-green-bar;
    }

    &--yellow {
      background: $cat-yellow-bar;
    }

    &--red {
      background: $cat-red-bar;
    }
  }

  &__counts {
    font-size: $fs-sm;
    color: $color-muted;
  }
}

@media (width <= $breakpoint-mobile) {
  .date-tab {
    padding: 10px;
    align-items: center;
    text-align: center;
    gap: 2px;

    &__free,
    &__mix,
    &__counts {
      display: none;
    }

    &__row {
      justify-content: center;
    }

    &__date {
      font-size: $fs-base;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .date-tab__mix-segment {
    transition: none;
  }
}
</style>
