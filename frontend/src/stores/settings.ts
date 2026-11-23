import { defineStore } from 'pinia';
import { ref } from 'vue';

import { i18n } from '../i18n/index.js';

export const SUPPORTED_LOCALES = ['en', 'de', 'pl', 'ru'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  de: 'Deutsch',
  pl: 'Polski',
  ru: 'Русский',
};

const STORAGE_KEY = 'slot-board.locale';

function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function readStoredLocale(): SupportedLocale | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && isSupportedLocale(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

function detectBrowserLocale(): SupportedLocale | undefined {
  const browser = navigator.language.slice(0, 2);
  return isSupportedLocale(browser) ? browser : undefined;
}

function initialLocale(): SupportedLocale {
  return readStoredLocale() ?? detectBrowserLocale() ?? 'en';
}

export const useSettingsStore = defineStore('settings', () => {
  const locale = ref<SupportedLocale>(initialLocale());

  function setLocale(code: string): void {
    if (!isSupportedLocale(code)) return;

    locale.value = code;

    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // storage unavailable (private browsing, quota, etc.) — in-memory state still updates
    }

    i18n.global.locale.value = code;
    document.documentElement.lang = code;
  }

  return { locale, setLocale };
});
