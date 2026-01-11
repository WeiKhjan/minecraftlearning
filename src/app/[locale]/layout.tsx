import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as 'ms' | 'zh' | 'en')) {
    notFound();
  }

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <NextIntlClientProvider messages={messages}>
          {/* Landscape orientation hint for mobile */}
          <div className="landscape-hint md:hidden">
            <div className="text-center">
              <div className="text-6xl mb-4">📱↔️</div>
              <p className="text-xl font-bold mb-2">
                {locale === 'ms'
                  ? 'Sila putar peranti anda'
                  : locale === 'zh'
                  ? '请旋转您的设备'
                  : 'Please rotate your device'}
              </p>
              <p className="text-gray-300">
                {locale === 'ms'
                  ? 'Aplikasi ini berfungsi lebih baik dalam mod landskap'
                  : locale === 'zh'
                  ? '此应用程序在横屏模式下效果更佳'
                  : 'This app works better in landscape mode'}
              </p>
            </div>
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
