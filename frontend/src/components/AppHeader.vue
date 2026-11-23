<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Headline from './base/Headline.vue';
import LanguageSwitcher from './header/LanguageSwitcher.vue';
import LiveStatus from './header/LiveStatus.vue';

const { t } = useI18n();
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <div class="app-header__brand">
        <div class="app-header__logo">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="2.5"
              y="6"
              width="19"
              height="12"
              rx="1.5"
              stroke="#fff"
              stroke-width="1.6"
            />
            <path
              d="M7 9v6M10.5 9v6M14 9v6M17.5 9v6"
              stroke="#fff"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <div class="app-header__headline">
          <Headline class="app-header__title">
            {{ t('header.title') }}
          </Headline>
          <span class="app-header__subtitle">{{ t('header.subtitle') }}</span>
        </div>
      </div>

      <div class="app-header__actions">
        <LiveStatus />
        <span
          class="app-header__divider"
          aria-hidden="true"
        />
        <LanguageSwitcher />
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '../assets/styles/variables' as *;

.app-header {
  background: $color-surface;
  border-bottom: 1px solid $color-border;

  &__inner {
    max-width: $content-max;
    margin: 0 auto;
    padding: $space-4 $space-8;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: $space-4;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__logo {
    width: 40px;
    height: 40px;
    border-radius: $radius-md;
    background: $color-accent;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__headline {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }

  &__title {
    display: block;
    margin: 0;
    font-size: $fs-xl;
    font-weight: 700;
    letter-spacing: -0.01em;
  }

  &__subtitle {
    font-size: $fs-md;
    color: $color-muted;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-left: auto;
  }

  &__divider {
    width: 1px;
    height: 24px;
    background: $color-border;
  }
}

@media (width <= 640px) {
  .app-header {
    &__inner {
      display: flex;
      flex-direction: row;
      padding: 14px $space-4;
    }

    &__brand {
      max-width: 40%;
    }

    &__logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }

    &__title {
      font-size: 17px;
    }

    &__subtitle,
    &__divider {
      display: none;
    }
  }
}
</style>
