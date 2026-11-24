<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useIntlLocale } from '../../composables/useIntlLocale.js';
import { dateFromKey, formatClockTime, type DaySummary } from '../../domain/timeSlot.js';
import Headline from '../base/Headline.vue';

const props = defineProps<{ date: string; summary: DaySummary }>();

const { t } = useI18n();
const intlLocale = useIntlLocale();

const title = computed(() =>
  new Intl.DateTimeFormat(intlLocale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateFromKey(props.date)),
);

const timeRange = computed(
  () => `${formatClockTime(props.summary.from)}–${formatClockTime(props.summary.to)}`,
);
</script>

<template>
  <div>
    <Headline
      :level="2"
      class="day-header__title"
      >{{ title }}</Headline
    >
    <p class="day-header__meta">
      {{ t('day.slots', { n: summary.slotCount }) }} ·
      {{ timeRange }}
      · <span class="day-header__booked">{{ summary.booked }}/{{ summary.capacity }}</span>
      {{ t('day.booked') }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.day-header {
  &__title {
    margin: 0;
    font-size: $fs-2xl;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  &__meta {
    margin: $space-1 0 0;
    font-size: $fs-base;
    color: $color-muted;
  }

  &__booked {
    font-family: $font-mono;
    color: $color-ink;
  }
}

@media (width <= $breakpoint-mobile) {
  .day-header__title {
    font-size: 20px;
  }
}
</style>
