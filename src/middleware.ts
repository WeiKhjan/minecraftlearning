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
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static PWA files
  if (pathname === '/manifest.json' || pathname === '/sw.js') {
    return NextResponse.next();
  }

  // Skip i18n middleware for auth callback routes
  if (pathname.startsWith('/auth/')) {
    return await updateSession(request);
  }

  // Handle i18n routing for other routes
  const response = intlMiddleware(request);

  // Update Supabase session
  await updateSession(request);

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|json|mp4|mp3|wav|woff|woff2|ttf|eot)$).*)',
  ],
};
