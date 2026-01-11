import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ms', 'zh', 'en'],
  defaultLocale: 'ms',
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
