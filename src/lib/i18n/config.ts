import { Locale } from '@/types';

export const locales: Locale[] = ['ms', 'zh', 'en'];
export const defaultLocale: Locale = 'ms';

export const localeNames: Record<Locale, string> = {
  ms: 'Bahasa Malaysia',
  zh: '中文',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  ms: '🇲🇾',
  zh: '🇨🇳',
  en: '🇬🇧',
};
