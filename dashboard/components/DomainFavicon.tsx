import React, { useState } from 'react';
import { Globe } from 'lucide-react';

interface DomainFaviconProps {
  domain: string;
  className?: string;
  size?: number;
}

export default function DomainFavicon({ domain, className = 'h-5 w-5', size = 64 }: DomainFaviconProps) {
  const [errorCount, setErrorCount] = useState(0);

  // Clean domain name to hostname (e.g., https://titantreasure.com/casino -> titantreasure.com)
  const cleanDomain = (domain || '')
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .trim();

  if (!cleanDomain || errorCount >= 2) {
    return <Globe className={`text-slate-500 shrink-0 ${className}`} />;
  }

  // Favicon provider URLs
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=${size}`;
  const duckduckgoFaviconUrl = `https://icons.duckduckgo.com/ip3/${cleanDomain}.ico`;

  const src = errorCount === 0 ? googleFaviconUrl : duckduckgoFaviconUrl;

  return (
    <img
      src={src}
      alt={`${cleanDomain} favicon`}
      onError={() => setErrorCount((prev) => prev + 1)}
      className={`rounded object-contain bg-slate-900/80 border border-slate-700/60 p-0.5 shadow-sm shrink-0 ${className}`}
      loading="lazy"
    />
  );
}
