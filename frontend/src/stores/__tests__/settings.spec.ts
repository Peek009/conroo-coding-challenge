import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '../../i18n/index.js';
import { useSettingsStore } from '../settings.js';

const STORAGE_KEY = 'slot-board.locale';

describe('useSettingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    document.documentElement.lang = '';
    i18n.global.locale.value = 'en';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to en when nothing is stored and the browser language is unsupported', () => {
    vi.stubGlobal('navigator', { ...navigator, language: 'fr-FR' });

    const store = useSettingsStore();

    expect(store.locale).toBe('en');
  });

  it('falls back to the browser language when supported and nothing is stored', () => {
    vi.stubGlobal('navigator', { ...navigator, language: 'de-DE' });

    const store = useSettingsStore();

    expect(store.locale).toBe('de');
  });

  it('prefers a stored locale over the browser language', () => {
    localStorage.setItem(STORAGE_KEY, 'pl');
    vi.stubGlobal('navigator', { ...navigator, language: 'de-DE' });

    const store = useSettingsStore();

    expect(store.locale).toBe('pl');
  });

  it('setLocale updates the store, localStorage, i18n and <html lang>', () => {
    const store = useSettingsStore();

    store.setLocale('ru');

    expect(store.locale).toBe('ru');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('ru');
    expect(i18n.global.locale.value).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
  });

  it('setLocale ignores an unsupported code', () => {
    const store = useSettingsStore();

    store.setLocale('fr');

    expect(store.locale).toBe('en');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('setLocale keeps working even if localStorage.setItem throws', () => {
    const store = useSettingsStore();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(() => store.setLocale('de')).not.toThrow();
    expect(store.locale).toBe('de');
  });
});
