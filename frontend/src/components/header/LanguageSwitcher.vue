<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  useSettingsStore,
  type SupportedLocale,
} from '../../stores/settings.js';

const { t } = useI18n();
const settings = useSettingsStore();

const isOpen = ref(false);
const rootRef = ref<HTMLElement>();
const buttonRef = ref<HTMLButtonElement>();
const menuRef = ref<HTMLUListElement>();

function open(): void {
  isOpen.value = true;
  void nextTick(() => {
    menuRef.value?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
  });
}

function close(): void {
  if (!isOpen.value) return;
  isOpen.value = false;
  buttonRef.value?.focus();
}

function toggle(): void {
  if (isOpen.value) {
    close();
  } else {
    open();
  }
}

function choose(code: SupportedLocale): void {
  settings.setLocale(code);
  close();
}

function onMenuKeydown(event: KeyboardEvent): void {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

  const options = Array.from(menuRef.value?.querySelectorAll<HTMLElement>('[data-locale]') ?? []);
  if (options.length === 0) return;

  const index = options.indexOf(document.activeElement as HTMLElement);
  event.preventDefault();

  const nextIndex =
    event.key === 'ArrowDown'
      ? (index + 1) % options.length
      : (index - 1 + options.length) % options.length;
  options[nextIndex]?.focus();
}

function onDocumentClick(event: MouseEvent): void {
  if (!(event.target instanceof Node)) return;
  if (rootRef.value && !rootRef.value.contains(event.target)) close();
}

function onDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isOpen.value) close();
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onDocumentKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onDocumentKeydown);
});
</script>

<template>
  <div
    ref="rootRef"
    class="lang-switcher"
  >
    <button
      ref="buttonRef"
      class="lang-switcher__button"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      aria-controls="lang-menu"
      :aria-label="t('header.languageLabel', { name: LOCALE_NAMES[settings.locale] })"
      @click="toggle"
    >
      <span
        class="lang-switcher__flag"
        :class="`lang-switcher__flag--${settings.locale}`"
      />
      <svg
        class="lang-switcher__chevron"
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <ul
      v-show="isOpen"
      id="lang-menu"
      ref="menuRef"
      class="lang-switcher__menu"
      role="menu"
      @keydown="onMenuKeydown"
    >
      <li
        v-for="code in SUPPORTED_LOCALES"
        :key="code"
        role="none"
        class="lang-switcher__item"
      >
        <button
          class="lang-switcher__option"
          type="button"
          role="menuitemradio"
          :aria-checked="code === settings.locale"
          :data-locale="code"
          @click="choose(code)"
        >
          <div class="lang-switcher__label">
            <span
              class="lang-switcher__flag"
              :class="`lang-switcher__flag--${code}`"
            />
            {{ LOCALE_NAMES[code] }}
          </div>
          <svg
            class="lang-switcher__check"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3.5 8.5l3 3 6-6.5"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '../../assets/styles/variables' as *;
@use '../../assets/styles/images' as *;

.lang-switcher {
  position: relative;

  &__button {
    min-height: 40px;
    padding: 0 12px;
    border-radius: $radius-md;
    border: 1px solid $color-border;
    background: $color-surface;
    color: $color-ink;
    font-size: $fs-md;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: $space-2;

    &:hover {
      background: $color-bg;
    }
  }

  &__button[aria-expanded='true'] &__chevron {
    transform: rotate(180deg);
  }

  &__chevron {
    transition: transform 0.15s ease;
  }

  &__menu {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    z-index: 10;
    min-width: 180px;
    margin: 0;
    padding: 6px;
    list-style: none;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    box-shadow: $shadow-menu;
  }

  &__item {
    margin: 5px 0;
  }

  &__option {
    width: 100%;
    min-height: 40px;
    padding: 0 10px;
    border: 0;
    border-radius: $radius-sm;
    background: transparent;
    color: $color-ink;
    font-size: $fs-base;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    text-align: left;

    &:hover {
      background: $color-bg;
    }

    &[aria-checked='true'] {
      background: $color-accent-soft;
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__flag {
    display: inline-block;
    width: 22px;
    height: 16px;
    flex-shrink: 0;
    border-radius: 2px;
    background-color: $color-border-subtle;
    background-size: cover;
    background-position: center;

    &--en {
      background-image: $flag-en;
    }

    &--de {
      background-image: $flag-de;
    }

    &--pl {
      background-image: $flag-pl;
    }

    &--ru {
      background-image: $flag-ru;
    }
  }

  &__check {
    visibility: hidden;
  }

  &__option[aria-checked='true'] &__check {
    visibility: visible;
  }
}

@media (width <= $breakpoint-mobile) {
  .lang-switcher {
    &__button {
      min-height: 44px;
      min-width: 44px;
      padding: 0 10px;
    }

    &__chevron {
      display: none;
    }

    &__option {
      min-height: 44px;
    }
  }
}
</style>
