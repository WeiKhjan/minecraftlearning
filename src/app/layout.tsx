import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MYLearnt',
  description: 'A gamified learning platform for Malaysian primary school kids',
  keywords: ['education', 'learning', 'kids', 'minecraft', 'malaysia', 'primary school'],
  authors: [{ name: 'MYLearnt' }],
  openGraph: {
    title: 'MYLearnt',
    description: 'A gamified learning platform for Malaysian primary school kids',
    images: ['/logo.jpeg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MYLearnt',
    description: 'A gamified learning platform for Malaysian primary school kids',
    images: ['/logo.jpeg'],
  },
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
