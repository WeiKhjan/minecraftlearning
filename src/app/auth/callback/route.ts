import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/ms/kids'; // Default to kids selection page

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a profile
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check if parent profile exists
        const { data: parent } = await supabase
          .from('parents')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!parent) {
          // Create parent profile
          await supabase.from('parents').insert({
            id: user.id,
            email: user.email,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            preferred_language: 'ms',
            is_admin: false,
            last_login_at: new Date().toISOString(),
          });
        } else {
          // Update last login time for existing users
          await supabase
            .from('parents')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id);
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/ms/login?error=auth_failed`);
}
