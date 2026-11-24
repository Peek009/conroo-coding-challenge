<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useSlotsStore } from '../../stores/slots.js';
import GapRow from './GapRow.vue';
import SlotListSkeleton from './SlotListSkeleton.vue';
import SlotRow from './SlotRow.vue';

const { t } = useI18n();
const store = useSlotsStore();

const showSkeleton = computed(
  () => store.rowsForSelectedDay.length === 0 && store.status !== 'error',
);

const visibleRows = computed(() =>
  store.rowsForSelectedDay.filter(
    (row) => row.type === 'gap' || !store.isCategoryHidden(row.slot.category),
  ),
);

function capacityChangeFor(slotId: number): number | undefined {
  return store.highlights[slotId];
}
</script>

<template>
  <section
    :aria-label="t('slot.listLabel')"
    class="slot-panel"
  >
    <div
      class="slot-panel__columns"
      aria-hidden="true"
    >
      <span>{{ t('slot.columnTime') }}</span>
      <span>{{ t('slot.columnAvailability') }}</span>
      <span>{{ t('slot.columnBooked') }}</span>
      <span>{{ t('slot.columnFree') }}</span>
      <span>{{ t('slot.columnStatus') }}</span>
    </div>
    <SlotListSkeleton v-if="showSkeleton" />
    <ol
      v-else
      class="slot-panel__rows"
    >
      <template
        v-for="row in visibleRows"
        :key="row.key"
      >
        <SlotRow
          v-if="row.type === 'slot'"
          :day-slot="row.slot"
          :capacity-change="capacityChangeFor(row.slot.id)"
        />
        <GapRow
          v-else
          :from="row.from"
          :to="row.to"
        />
      </template>
    </ol>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.slot-panel {
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  overflow: hidden;

  &__columns {
    display: grid;
    grid-template-columns: $slot-row-columns;
    gap: $space-4;
    padding: $space-3 20px;
    border-bottom: 1px solid $color-border;
    font-size: $fs-sm;
    font-weight: 600;
    color: $color-muted;
    text-transform: uppercase;
    letter-spacing: 0.06em;

    span {
      min-width: 0;
      overflow-wrap: break-word;
    }
  }

  &__rows {
    list-style: none;
    margin: 0;
    padding: 0;
  }
}

@media (width <= $breakpoint-mobile) {
  .slot-panel {
    background: none;
    border: none;
    border-radius: 0;
    overflow: visible;

    &__columns {
      display: none;
    }
  }
}
</style>
