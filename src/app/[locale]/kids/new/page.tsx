'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/routing';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import type { Grade, Locale } from '@/types';

const grades: { value: Grade; label: { ms: string; zh: string; en: string } }[] = [
  { value: 'primary_1', label: { ms: 'Darjah 1', zh: '一年级', en: 'Primary 1' } },
  { value: 'primary_2', label: { ms: 'Darjah 2', zh: '二年级', en: 'Primary 2' } },
  { value: 'primary_3', label: { ms: 'Darjah 3', zh: '三年级', en: 'Primary 3' } },
  { value: 'primary_4', label: { ms: 'Darjah 4', zh: '四年级', en: 'Primary 4' } },
  { value: 'primary_5', label: { ms: 'Darjah 5', zh: '五年级', en: 'Primary 5' } },
  { value: 'primary_6', label: { ms: 'Darjah 6', zh: '六年级', en: 'Primary 6' } },
];

const avatars = ['🧒', '👦', '👧', '🧒🏻', '👦🏻', '👧🏻', '🧒🏽', '👦🏽', '👧🏽'];

export default function NewKidPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as Locale;

  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState<Grade>('primary_1');
  const [avatar, setAvatar] = useState('🧒');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError(t('errors.notAuthenticated'));
      setLoading(false);
      return;
    }

    // Create kid profile
    const { error: insertError } = await supabase.from('kids').insert({
      parent_id: user.id,
      name: name.trim(),
      school: school.trim(),
      grade,
      preferred_language: locale,
      avatar_seed: avatar,
      level: 1,
      total_xp: 0,
    });

    if (insertError) {
      console.error('Error creating kid:', insertError);
      setError(t('errors.createKidFailed'));
      setLoading(false);
      return;
    }

    // Redirect to kids list
    router.push(`/${locale}/kids`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#5DADE2] flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href="/kids">
          <img src="/logo.jpeg" alt="MYLearnt" className="h-12 w-auto rounded-lg" />
        </Link>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="pixel-card max-w-lg w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {t('kids.addNewKid')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('kids.selectAvatar')}
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {avatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`w-12 h-12 text-2xl rounded-lg border-2 transition-all ${
                      avatar === av
                        ? 'border-[#5D8731] bg-[#5D8731]/20 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('kids.kidName')} *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder={t('kids.enterKidName')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D8731] focus:border-transparent"
              />
            </div>

            {/* School Input */}
            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                {t('kids.school')} *
              </label>
              <input
                type="text"
                id="school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                required
                placeholder={t('kids.enterSchool')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D8731] focus:border-transparent"
              />
            </div>

            {/* Grade Selection */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                {t('kids.grade')} *
              </label>
              <select
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value as Grade)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D8731] focus:border-transparent"
              >
                {grades.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label[locale]}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <Link
                href="/kids"
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </Link>
              <button
                type="submit"
                disabled={loading || !name.trim() || !school.trim()}
                className="flex-1 pixel-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('kids.createKid')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
