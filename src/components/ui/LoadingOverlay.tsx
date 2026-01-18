'use client';

import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  avatarUrl?: string | null;
  message?: string;
  locale?: 'ms' | 'zh' | 'en';
}

const defaultMessages = {
  ms: 'Memuatkan...',
  zh: '加载中...',
  en: 'Loading...',
};

export default function LoadingOverlay({
  isLoading,
  avatarUrl,
  message,
  locale = 'ms',
}: LoadingOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
    } else {
      // Delay hiding to allow fade-out animation
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (!visible) return null;

  const displayMessage = message || defaultMessages[locale];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Avatar with Aura Effect */}
        <div className="relative">
          {/* Outer glow rings */}
          <div className="absolute inset-0 -m-8 animate-ping-slow rounded-full bg-yellow-400/30" />
          <div className="absolute inset-0 -m-6 animate-pulse rounded-full bg-yellow-400/40" />
          <div className="absolute inset-0 -m-4 animate-pulse rounded-full bg-yellow-300/50" style={{ animationDelay: '0.5s' }} />

          {/* Rotating sparkles */}
          <div className="absolute inset-0 -m-12 animate-spin-slow">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">✨</span>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl">✨</span>
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl">✨</span>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl">✨</span>
          </div>

          {/* Inner glow */}
          <div className="absolute inset-0 -m-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 opacity-70 blur-md animate-pulse" />

          {/* Avatar container */}
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50 bg-[#5D8731]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover animate-bounce-gentle"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl animate-bounce-gentle">
                🧒
              </div>
            )}
          </div>

          {/* Sparkle particles */}
          <div className="absolute -top-4 -right-4 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
          <div className="absolute -bottom-4 -left-4 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>⭐</div>
          <div className="absolute -top-2 -left-6 text-xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
          <div className="absolute -bottom-2 -right-6 text-xl animate-bounce" style={{ animationDelay: '0.8s' }}>✨</div>
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <p className="text-white text-xl font-bold animate-pulse">
            {displayMessage}
          </p>
          {/* Loading dots */}
          <div className="flex justify-center gap-2 mt-3">
            <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
