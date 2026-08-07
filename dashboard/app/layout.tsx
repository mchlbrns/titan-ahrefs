import './globals.css';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Titan Ahrefs SEO Dashboard',
  description: 'SEO performance reporting for titantreasure.com — organic traffic, rankings, backlinks.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body
        className="antialiased selection:bg-cyan-400/20 selection:text-cyan-100"
        style={{ background: 'var(--color-canvas)', color: 'var(--color-text-primary)' }}
      >
        {children}
      </body>
    </html>
  );
}
