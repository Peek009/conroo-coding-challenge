<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useIntlLocale } from '../../composables/useIntlLocale.js';
import { dateFromKey, formatClockTime } from '../../domain/timeSlot.js';
import { useSlotsStore } from '../../stores/slots.js';

const { t } = useI18n();
const store = useSlotsStore();
const intlLocale = useIntlLocale();

function formatDate(key: string): string {
  return new Intl.DateTimeFormat(intlLocale.value, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(dateFromKey(key));
}

const message = computed(() => {
  const latest = store.recentUpdates.at(-1);
  if (!latest) return '';

  return t('slot.announce', {
    date: formatDate(latest.date),
    range: `${formatClockTime(latest.start)}–${formatClockTime(latest.end)}`,
    current: latest.current,
    max: latest.max,
    label: t(`category.${latest.category}`),
  });
});
</script>

<!-- screen-reader only: announces live updates, never visible on screen -->
<template>
  <div
    class="visually-hidden"
    aria-live="polite"
  >
    {{ message }}
  </div>
</template>
