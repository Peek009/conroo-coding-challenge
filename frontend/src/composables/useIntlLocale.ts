import { computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';

const INTL_LOCALES: Record<string, string> = { en: 'en-GB', de: 'de-DE', pl: 'pl-PL', ru: 'ru-RU' };

export function useIntlLocale(): ComputedRef<string> {
  const { locale } = useI18n();
  return computed(() => INTL_LOCALES[locale.value] ?? 'en-GB');
}
