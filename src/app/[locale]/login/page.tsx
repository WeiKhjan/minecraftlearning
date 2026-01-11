'use client';

import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function LoginPage() {
  const t = useTranslations();

  const handleGoogleLogin = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white drop-shadow-lg">
          MYLearnt
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="minecraft-card max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {t('common.welcome')}
            </h1>
            <p className="text-gray-600">
              {t('auth.welcomeBack')}
            </p>
          </div>

          {/* Decorative Character */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-[#5D8731] rounded-lg flex items-center justify-center">
              <span className="text-5xl">⛏️</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full minecraft-button flex items-center justify-center gap-3 text-lg py-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('auth.signInWithGoogle')}
          </button>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 underline"
            >
              {t('common.back')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
