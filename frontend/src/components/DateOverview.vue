<script setup lang="ts">
import { computed } from 'vue';

import { useSlotsStore } from '../stores/slots.js';
import DateTabs from './date-tabs/DateTabs.vue';
import DayHeader from './day-header/DayHeader.vue';
import DayHeaderSkeleton from './day-header/DayHeaderSkeleton.vue';
import CategoryFilter from './slot-list/CategoryFilter.vue';
import SlotAnnouncer from './slot-list/SlotAnnouncer.vue';
import SlotList from './slot-list/SlotList.vue';

const store = useSlotsStore();

const hasSelectedDay = computed(() => Boolean(store.selectedDay && store.selectedDaySummary));
const showSkeleton = computed(() => !hasSelectedDay.value && store.status !== 'error');
</script>

<template>
  <div class="date-overview">
    <DateTabs />
    <DayHeaderSkeleton v-if="showSkeleton" />
    <div
      v-else-if="hasSelectedDay"
      class="day-header"
    >
      <DayHeader
        :date="store.selectedDay!.date"
        :summary="store.selectedDaySummary!"
      />
      <CategoryFilter
        :counts="store.selectedDaySummary!.counts"
        :hidden="store.hiddenCategories"
        @toggle="store.toggleCategory"
      />
    </div>
    <SlotList />
    <SlotAnnouncer />
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/variables' as *;

.date-overview {
  max-width: $content-max;
  margin: 0 auto;
  padding: 28px $space-8 48px;
  display: flex;
  flex-direction: column;
  gap: $space-6;
}

.day-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: $space-3;
}

@media (width <= 640px) {
  .date-overview {
    padding: $space-4;
    gap: $space-4;
  }
}
</style>
