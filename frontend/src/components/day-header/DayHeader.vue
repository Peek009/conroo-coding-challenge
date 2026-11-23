<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatClockTime, type DaySummary } from '../../domain/timeSlot.js';
import Headline from '../base/Headline.vue';

const props = defineProps<{ date: string; summary: DaySummary }>();

const { t, locale } = useI18n();
const INTL_LOCALES: Record<string, string> = { en: 'en-GB', de: 'de-DE', pl: 'pl-PL', ru: 'ru-RU' };

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1, day));
}

const title = computed(() =>
  new Intl.DateTimeFormat(INTL_LOCALES[locale.value] ?? 'en-GB', {
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

@media (width <= 640px) {
  .day-header__title {
    font-size: 20px;
  }
}
</style>
