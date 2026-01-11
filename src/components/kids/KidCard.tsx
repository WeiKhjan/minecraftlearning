'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import type { Kid, Locale } from '@/types';

const gradeLabels: Record<string, { ms: string; zh: string; en: string }> = {
  primary_1: { ms: 'Darjah 1', zh: '一年级', en: 'Primary 1' },
  primary_2: { ms: 'Darjah 2', zh: '二年级', en: 'Primary 2' },
  primary_3: { ms: 'Darjah 3', zh: '三年级', en: 'Primary 3' },
  primary_4: { ms: 'Darjah 4', zh: '四年级', en: 'Primary 4' },
  primary_5: { ms: 'Darjah 5', zh: '五年级', en: 'Primary 5' },
  primary_6: { ms: 'Darjah 6', zh: '六年级', en: 'Primary 6' },
};

interface KidCardProps {
  kid: Kid;
  locale: Locale;
}

export default function KidCard({ kid, locale }: KidCardProps) {
  const t = useTranslations();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('kids')
      .delete()
      .eq('id', kid.id);

    if (error) {
      console.error('Error deleting kid:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }

    router.refresh();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative group">
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDeleteConfirm(true);
        }}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center"
        title={t('kids.deleteKid')}
      >
        x
      </button>

      {/* Kid Card Link */}
      <Link
        href={`/dashboard?kid=${kid.id}`}
        className="minecraft-card hover:scale-105 transition-transform cursor-pointer text-center block"
      >
        {/* Avatar */}
        <div className="w-20 h-20 mx-auto mb-3 bg-[#5D8731] rounded-lg flex items-center justify-center">
          <span className="text-4xl">
            {kid.avatar_seed || '🧒'}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-bold text-gray-800 text-lg mb-1">
          {kid.name}
        </h3>

        {/* Grade */}
        <p className="text-sm text-gray-600">
          {gradeLabels[kid.grade]?.[locale] || kid.grade}
        </p>

        {/* Level */}
        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="text-yellow-500">*</span>
          <span className="text-sm font-medium text-gray-700">
            Level {kid.level}
          </span>
        </div>

        {/* XP Bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#5D8731] h-2 rounded-full transition-all"
            style={{ width: `${Math.min((kid.total_xp % 100), 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {kid.total_xp} XP
        </p>
      </Link>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="minecraft-card max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {t('kids.confirmDelete')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('kids.confirmDeleteMessage', { name: kid.name })}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? t('common.loading') : t('kids.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
