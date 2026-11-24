<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useIntlLocale } from '../../composables/useIntlLocale.js';
import { useSlotsStore } from '../../stores/slots.js';

const { t } = useI18n();
const intlLocale = useIntlLocale();
const { connection, lastUpdateAt } = storeToRefs(useSlotsStore());

const formattedTime = computed(() => {
  if (!lastUpdateAt.value) return '–';
  return new Intl.DateTimeFormat(intlLocale.value, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(lastUpdateAt.value);
});
</script>

<template>
  <div
    class="live-status"
    :class="`live-status--${connection}`"
    role="status"
  >
    <span class="live-status__pill">
      <span class="live-status__dot" />
      <svg
        class="live-status__spinner"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14 8a6 6 0 1 1-1.8-4.3"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
      <span class="live-status__label">{{ t(`connection.${connection}`) }}</span>
    </span>
    <span class="live-status__last">
      <span>{{ t('header.lastUpdate') }}</span>
      <span class="live-status__time">{{ formattedTime }}</span>
    </span>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;

.live-status {
  display: flex;
  align-items: center;
  gap: $space-3;
  font-size: $fs-md;
  color: $color-muted;

  &__pill {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    padding: 8px 14px;
    border-radius: $radius-pill;
    font-weight: 600;
    white-space: nowrap;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__spinner {
    display: none;
    animation: live-status-spin 1s linear infinite;
  }

  &__time {
    font-family: $font-mono;
    color: $color-ink;
    padding-left: $space-3;
  }
}

.live-status--live {
  .live-status__pill {
    background: $color-accent-soft;
    color: $color-accent;
  }

  .live-status__dot {
    background: $color-live;
    animation: live-status-pulse 1.8s infinite;
  }
}

.live-status--connecting,
.live-status--reconnecting {
  .live-status__pill {
    background: $color-border-subtle;
    color: $color-neutral-strong;
  }

  .live-status__dot {
    display: none;
  }

  .live-status__spinner {
    display: block;
  }
}

.live-status--offline {
  .live-status__pill {
    background: $color-ink;
    color: #fff;
  }

  .live-status__dot {
    background: #fff;
  }
}

@keyframes live-status-pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(47 111 214 / 55%);
  }

  70% {
    box-shadow: 0 0 0 8px rgb(47 111 214 / 0%);
  }

  100% {
    box-shadow: 0 0 0 0 rgb(47 111 214 / 0%);
  }
}

@keyframes live-status-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (width <= $breakpoint-mobile) {
  .live-status {
    &__last {
      display: none;
    }

    &__pill {
      padding: 6px 10px;
      font-size: $fs-sm;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .live-status--live .live-status__dot,
  .live-status__spinner {
    animation: none;
  }
}
</style>
