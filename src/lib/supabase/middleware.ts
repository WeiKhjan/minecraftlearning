import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/auth/callback'];
  const pathname = request.nextUrl.pathname;

  // Remove locale prefix for route matching
  const pathWithoutLocale = pathname.replace(/^\/(ms|zh|en)/, '') || '/';

  const isPublicRoute = publicRoutes.some(
    (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith('/auth/')
  );

  if (!user && !isPublicRoute) {
    // Redirect to login if not authenticated and trying to access protected route
    const locale = pathname.match(/^\/(ms|zh|en)/)?.[1] || 'ms';
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
