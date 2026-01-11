import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { locales, defaultLocale } from '@/lib/i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  // First, handle i18n routing
  const response = intlMiddleware(request);

  // Then, handle Supabase session
  // Note: We return the intl response but also update the session
  await updateSession(request);

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_static (static files)
    // - /favicon.ico, /sitemap.xml, /robots.txt (static files)
    '/((?!api|_next|_static|favicon.ico|sitemap.xml|robots.txt|equipment|characters|backgrounds|sounds).*)',
  ],
};
