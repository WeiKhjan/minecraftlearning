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
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_static (static files)
    // - /favicon.ico, /sitemap.xml, /robots.txt (static files)
    // - Static assets in public folder (images, videos, etc.)
    // - PWA files (manifest.json, sw.js)
    '/((?!api|_next|_static|favicon.ico|sitemap.xml|robots.txt|manifest.json|sw.js|equipment|characters|backgrounds|sounds|fonts|logo\\.jpeg|hero-video\\.mp4|hero-video2\\.mp4|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|mp4|webm|ogg|mp3|wav|pdf|woff|woff2|ttf|eot|json|js)$).*)',
  ],
};
