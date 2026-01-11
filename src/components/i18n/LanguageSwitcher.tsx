'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { localeNames, localeFlags, locales } from '@/lib/i18n/config';
import type { Locale } from '@/types';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const intlPathname = usePathname();
  const t = useTranslations('language');

  const handleLocaleChange = (newLocale: Locale) => {
    // Get current path from browser if intl pathname is empty
    // This handles edge cases where usePathname returns empty
    let targetPath = intlPathname;

    if (!targetPath || targetPath === '/') {
      // Fallback: extract path from window.location and remove locale prefix
      if (typeof window !== 'undefined') {
        const fullPath = window.location.pathname;
        // Remove current locale prefix (e.g., /ms/, /en/, /zh/)
        const pathWithoutLocale = fullPath.replace(/^\/(ms|en|zh)/, '') || '/';
        targetPath = pathWithoutLocale;
      }
    }

    // Preserve search params
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const fullPath = search ? `${targetPath}${search}` : targetPath;

    router.replace(fullPath, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white"
        >
          <span className="mr-2">{localeFlags[locale]}</span>
          <span className="hidden sm:inline">{localeNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            <span className="mr-2">{localeFlags[loc]}</span>
            {localeNames[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
