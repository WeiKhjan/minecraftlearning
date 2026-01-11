'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function LandingPage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white drop-shadow-lg">
          MineCraft Learning
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Logo/Title Area */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg mb-4 minecraft-font">
            MineCraft Learning
          </h1>
          <p className="text-xl md:text-2xl text-white/90 drop-shadow">
            {t('common.welcome')}!
          </p>
        </div>

        {/* Decorative Minecraft Elements */}
        <div className="flex gap-4 mb-8">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#7CBA3D] border-4 border-t-[#9EDE5D] border-l-[#9EDE5D] border-b-[#4A7A20] border-r-[#4A7A20] pixelated"></div>
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#8B5A2B] border-4 border-t-[#A67B4B] border-l-[#A67B4B] border-b-[#5D3A1A] border-r-[#5D3A1A] pixelated"></div>
          <div className="w-16 h-16 md:w-24 md:h-24 bg-[#7F7F7F] border-4 border-t-[#A0A0A0] border-l-[#A0A0A0] border-b-[#555555] border-r-[#555555] pixelated"></div>
        </div>

        {/* Login Button */}
        <Link href="/login">
          <button className="minecraft-button text-xl md:text-2xl px-8 py-4">
            {t('auth.signInWithGoogle')}
          </button>
        </Link>

        {/* Features */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
          <FeatureCard
            icon="🇲🇾"
            title={t('subjects.bm')}
            color="bg-yellow-500"
          />
          <FeatureCard
            icon="🇨🇳"
            title={t('subjects.bc')}
            color="bg-red-500"
          />
          <FeatureCard
            icon="🇬🇧"
            title={t('subjects.en')}
            color="bg-blue-500"
          />
          <FeatureCard
            icon="🔢"
            title={t('subjects.math')}
            color="bg-green-500"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full p-4 text-center text-white/70 text-sm">
        <p>MineCraft Learning - Making education fun!</p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  color,
}: {
  icon: string;
  title: string;
  color: string;
}) {
  return (
    <div className="minecraft-card text-center">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl mx-auto mb-2`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-800">{title}</p>
    </div>
  );
}
