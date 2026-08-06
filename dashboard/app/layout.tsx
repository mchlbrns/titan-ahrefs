import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Titan Ahrefs SEO Dashboard',
  description: 'SEO performance reporting for titantreasure.com — organic traffic, rankings, backlinks.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="bg-[#0a0b0d] text-slate-100 antialiased selection:bg-amber-400/30 selection:text-amber-100">
        {children}
      </body>
    </html>
  );
}
