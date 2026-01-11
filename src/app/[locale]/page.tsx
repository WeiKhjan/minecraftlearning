'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function LandingPage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Language Switcher */}
      <div className="w-full p-4 flex justify-end">
        <LanguageSwitcher />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo/Title Area */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-4 minecraft-font">
            MYLearnt
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow">
            {t('common.welcome')}!
          </p>
        </div>

        {/* Login Button */}
        <Link href="/login">
          <button className="minecraft-button text-xl md:text-2xl px-8 py-4">
            {t('auth.signInWithGoogle')}
          </button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="w-full p-4 text-center text-white/70 text-sm">
        <p>MYLearnt - Making education fun!</p>
      </footer>
    </main>
  );
}
