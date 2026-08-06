import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Titan Ahrefs SEO Dashboard',
  description: 'Automated Ahrefs API v3 Reporting & Analytics Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
