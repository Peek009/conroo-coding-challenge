<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { daySummary } from '../../domain/timeSlot.js';
import { useSlotsStore } from '../../stores/slots.js';
import DateTab from './DateTab.vue';
import DateTabSkeleton from './DateTabSkeleton.vue';

const { t } = useI18n();
const store = useSlotsStore();

const showSkeleton = computed(() => store.days.length === 0 && store.status !== 'error');
</script>

<template>
  <nav
    class="date-tabs"
    :aria-label="t('day.datesLabel')"
    :aria-busy="showSkeleton"
  >
    <template v-if="showSkeleton">
      <DateTabSkeleton
        v-for="n in 3"
        :key="n"
      />
    </template>
    <template v-else>
      <DateTab
        v-for="day in store.days"
        :key="day.date"
        :date="day.date"
        :summary="daySummary(day.slots)"
        :selected="day.date === store.selectedDate"
        @select="store.setDate(day.date)"
      />
    </template>
  </nav>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.date-tabs {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(245px, 1fr);
  gap: $space-3;
  overflow: auto;
  scroll-snap-type: x proximity;
  padding-bottom: 4px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

@media (width <= $breakpoint-mobile) {
  .date-tabs {
    grid-auto-columns: minmax(96px, 1fr);
    gap: $space-2;
  }
}
</style>
