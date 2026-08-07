/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Globe } from 'lucide-react';

interface DomainFaviconProps {
  domain: string;
  className?: string;
  size?: number;
}

const faviconErrorCache = new Map<string, number>();

export default function DomainFavicon({ domain, className = 'h-7 w-7', size = 64 }: DomainFaviconProps) {
  // Clean domain name to hostname (e.g., https://titantreasure.com/casino -> titantreasure.com)
  const cleanDomain = (domain || '')
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .trim();

  const [errorCount, setErrorCount] = useState<number>(() => faviconErrorCache.get(cleanDomain) || 0);

  if (!cleanDomain || errorCount >= 2) {
    return <Globe className={`text-slate-400 shrink-0 ${className}`} />;
  }

  // Favicon provider URLs
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=${size}`;
  const duckduckgoFaviconUrl = `https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`;

  const src = errorCount === 0 ? googleFaviconUrl : duckduckgoFaviconUrl;

  const handleError = () => {
    setErrorCount((prev) => {
      const next = prev + 1;
      faviconErrorCache.set(cleanDomain, next);
      return next;
    });
  };

  return (
    <img
      src={src}
      alt={`${cleanDomain} favicon`}
      onError={handleError}
      className={`rounded-lg object-contain bg-slate-900 border border-slate-700/80 p-0.5 shadow-md shrink-0 transition-all hover:border-slate-500 ${className}`}
      loading="lazy"
    />
  );
}
