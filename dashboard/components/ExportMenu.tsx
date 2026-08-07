import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Mail, ChevronDown, Check, Loader2, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type DashboardTab = 'overview' | 'keywords' | 'pages' | 'backlinks' | 'competitors' | 'insights' | 'reddit';

interface ExportMenuProps {
  domain: string;
  activeTab?: DashboardTab;
  summary?: {
    healthScore?: number | null;
    domain_rating?: number | null;
    domainRating?: number | null;
    ahrefs_rank?: number | null;
    ahrefsRank?: number | null;
    organic_traffic?: number | null;
    organicTraffic?: number | null;
    ref_domains?: number | string | null;
    referringDomains?: number | string | null;
    total_backlinks?: number | string | null;
    totalBacklinks?: number | string | null;
    striking_distance_count?: number;
  };
  keywords?: any[];
  overviewKeywords?: any[];
  pages?: any[];
  backlinks?: any[];
  competitors?: any[];
  redditThreads?: any[];
  liveRecommendations?: string[];
  healthScore?: number;
  healthGrade?: string;
  keywordFilterLabel?: string;
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ExportMenu({
  domain,
  activeTab = 'overview',
  summary,
  keywords = [],
  overviewKeywords = [],
  pages = [],
  backlinks = [],
  competitors = [],
  redditThreads = [],
  liveRecommendations = [],
  healthScore,
  healthGrade,
  keywordFilterLabel = 'All',
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTab, setEmailTab] = useState<'rich' | 'plain'>('rich');
  const [copied, setCopied] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePdfExport = async () => {
    setIsOpen(false);
    setIsPdfGenerating(true);

    try {
      const primaryDomain = domain || 'titantreasure.com';
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Title Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 30, 'F');

      const tabTitleMap: Record<DashboardTab, string> = {
        overview: 'Executive Overview Report',
        keywords: 'Organic Keyword Rankings Report',
        pages: 'Top Organic Traffic Pages Report',
        backlinks: 'Referring Domains & Backlink Audit',
        competitors: 'Competitor Organic Gap Matrix',
        insights: 'SEO Recommendations & Action Feed',
        reddit: 'Reddit Thread & Keyword Targeting Report',
      };

      const reportTitle = tabTitleMap[activeTab] || 'Executive SEO Report';
      const filterSuffix = (activeTab === 'keywords' && keywordFilterLabel && keywordFilterLabel !== 'All')
        ? ` · Filtered: ${keywordFilterLabel}`
        : '';

      doc.setTextColor(6, 182, 212); // cyan-400
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(`Titan Ahrefs ${reportTitle}`, 14, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Domain: ${primaryDomain}${filterSuffix}`, 14, 22);
      doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`, 150, 22);

      let startY = 38;

      const healthScoreVal = summary?.healthScore !== null && summary?.healthScore !== undefined
        ? `${summary.healthScore}/100`
        : (healthScore !== undefined ? `${healthScore}/100` : 'N/A');
      const drVal = (summary?.domain_rating ?? summary?.domainRating) !== null && (summary?.domain_rating ?? summary?.domainRating) !== undefined
        ? `${summary.domain_rating ?? summary.domainRating}`
        : 'N/A';
      const rankSub = (summary?.ahrefs_rank ?? summary?.ahrefsRank)
        ? `Rank #${(summary.ahrefs_rank ?? summary.ahrefsRank).toLocaleString()}`
        : 'Rank N/A';
      const trafficVal = (summary?.organic_traffic ?? summary?.organicTraffic) !== null && (summary?.organic_traffic ?? summary?.organicTraffic) !== undefined
        ? (summary.organic_traffic ?? summary.organicTraffic).toLocaleString()
        : 'N/A';
      const refDomainsVal = (summary?.ref_domains ?? summary?.referringDomains) !== null && (summary?.ref_domains ?? summary?.referringDomains) !== undefined
        ? `${summary.ref_domains ?? summary.referringDomains}`
        : `${backlinks.length}`;

      if (activeTab === 'overview' || activeTab === 'keywords') {
        const kpis = [
          { label: 'SEO HEALTH SCORE', val: healthScoreVal, sub: healthGrade ? `Grade ${healthGrade}` : 'Health Rating' },
          { label: 'DOMAIN RATING (DR)', val: drVal, sub: rankSub },
          { label: 'EST. ORGANIC TRAFFIC', val: trafficVal, sub: 'Monthly Visits' },
          { label: 'REFERRING DOMAINS', val: refDomainsVal, sub: 'Unique Domains' }
        ];

        const cardWidth = 43;
        kpis.forEach((kpi, idx) => {
          const x = 14 + idx * 47;
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(226, 232, 240);
          doc.roundedRect(x, startY, cardWidth, 24, 2, 2, 'FD');

          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 116, 139);
          doc.text(kpi.label, x + 4, startY + 6);

          doc.setFontSize(13);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text(kpi.val, x + 4, startY + 14);

          doc.setFontSize(6.5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(5, 150, 105);
          doc.text(kpi.sub, x + 4, startY + 20);
        });

        startY += 30;
      }

      if (activeTab === 'overview') {
        const kwList = overviewKeywords.length > 0 ? overviewKeywords : keywords.slice(0, 3);
        if (kwList.length > 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text('1. Top Keywords Preview (Condensed — 3 entries)', 14, startY);
          startY += 3;

          autoTable(doc, {
            startY,
            head: [['Keyword', 'Position', 'Change', 'Search Volume', 'KD', 'Est. Traffic', 'Intent']],
            body: kwList.map((k: any) => [
              k.keyword,
              `#${k.position}`,
              (k.position_delta || k.positionChange || 0) > 0 ? `+${k.position_delta || k.positionChange}` : `${k.position_delta || k.positionChange || 0}`,
              (k.search_volume || k.searchVolume || 0).toLocaleString(),
              k.keyword_difficulty || k.keywordDifficulty || 0,
              (k.traffic || k.estimatedTraffic || 0).toLocaleString(),
              k.intent || k.searchIntent || 'Informational'
            ]),
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7.5 },
            bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
            margin: { left: 14, right: 14 }
          });
          const docWithAutoTable = doc as any;
          startY = (docWithAutoTable.lastAutoTable?.finalY || startY) + 8;
        }

        const pgList = pages.slice(0, 3);
        if (pgList.length > 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text('2. Top Pages Preview (Condensed — 3 entries)', 14, startY);
          startY += 3;

          autoTable(doc, {
            startY,
            head: [['Page URL', 'Top Keyword', 'Organic Traffic', 'Ranking Keywords']],
            body: pgList.map((p: any) => [
              p.url,
              p.top_keyword || p.topKeyword || '—',
              (p.organic_traffic || p.organicTraffic || 0).toLocaleString(),
              p.organic_keywords || p.rankingKeywords || 0
            ]),
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7.5 },
            bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
            margin: { left: 14, right: 14 }
          });
          const docWithAutoTable = doc as any;
          startY = (docWithAutoTable.lastAutoTable?.finalY || startY) + 8;
        }

        const blList = backlinks.slice(0, 3);
        if (blList.length > 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(15, 23, 42);
          doc.text('3. Referring Domains Preview (Condensed — 3 entries)', 14, startY);
          startY += 3;

          autoTable(doc, {
            startY,
            head: [['Referring Domain', 'DR', 'Dofollow Links', 'Status']],
            body: blList.map((b: any) => [
              b.ref_domain || b.urlFrom || 'external-site.com',
              b.domain_rating || b.domainRatingFrom || 30,
              b.dofollow_links || b.isDofollow ? 'Yes' : 'No',
              (b.status || 'ACTIVE').toUpperCase()
            ]),
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7.5 },
            bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
            margin: { left: 14, right: 14 }
          });
        }
      } else if (activeTab === 'keywords') {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`Organic Keyword Rankings (${keywords.length} entries${keywordFilterLabel ? ` · ${keywordFilterLabel}` : ''})`, 14, startY);
        startY += 3;

        autoTable(doc, {
          startY,
          head: [['Keyword', 'Position', 'Change', 'Search Volume', 'KD', 'Est. Traffic', 'Intent']],
          body: keywords.map((k: any) => [
            k.keyword,
            `#${k.position}`,
            (k.position_delta || k.positionChange || 0) > 0 ? `+${k.position_delta || k.positionChange}` : `${k.position_delta || k.positionChange || 0}`,
            (k.search_volume || k.searchVolume || 0).toLocaleString(),
            k.keyword_difficulty || k.keywordDifficulty || 0,
            (k.traffic || k.estimatedTraffic || 0).toLocaleString(),
            k.intent || k.searchIntent || 'Informational'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7.5 },
          bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { left: 14, right: 14 }
        });
      } else if (activeTab === 'pages') {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`Top Organic Pages (${pages.length} entries)`, 14, startY);
        startY += 3;

        autoTable(doc, {
          startY,
          head: [['Page URL', 'Top Keyword', 'Organic Traffic', 'Ranking Keywords']],
          body: pages.map((p: any) => [
            p.url,
            p.top_keyword || p.topKeyword || '—',
            (p.organic_traffic || p.organicTraffic || 0).toLocaleString(),
            p.organic_keywords || p.rankingKeywords || 0
          ]),
          theme: 'grid',
          headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7.5 },
          bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
          margin: { left: 14, right: 14 }
        });
      } else if (activeTab === 'backlinks') {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`Referring Domains Audit (${backlinks.length} entries)`, 14, startY);
        startY += 3;

        autoTable(doc, {
          startY,
          head: [['Referring Domain', 'DR', 'Dofollow Links', 'Status']],
          body: backlinks.map((b: any) => [
            b.ref_domain || b.urlFrom || 'external-site.com',
            b.domain_rating || b.domainRatingFrom || 30,
            b.dofollow_links || b.isDofollow ? 'Dofollow' : 'Nofollow',
            (b.status || 'ACTIVE').toUpperCase()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7.5 },
          bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
          margin: { left: 14, right: 14 }
        });
      } else if (activeTab === 'competitors') {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`Competitor Organic Gap Matrix (${competitors.length} entries)`, 14, startY);
        startY += 3;

        if (competitors.length === 0) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 116, 139);
          doc.text('No competitor data currently configured.', 14, startY + 6);
        } else {
          autoTable(doc, {
            startY,
            head: [['Competitor Domain', 'DR', 'Shared Keywords', 'Exclusive Keywords', 'Est. Traffic']],
            body: competitors.map((c: any) => [
              c.competitor_domain || c.competitorDomain || '',
              c.competitor_dr || c.domainRating || 30,
              (c.overlap_keywords || c.sharedKeywords || 0).toLocaleString(),
              (c.competitor_keywords || c.competitorExclusiveKeywords || 0).toLocaleString(),
              (c.competitor_traffic || c.organicTraffic || 0).toLocaleString()
            ]),
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7.5 },
            bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
            margin: { left: 14, right: 14 }
          });
        }
      } else if (activeTab === 'insights') {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('SEO Recommendations Feed', 14, startY);
        startY += 3;

        const recRows = (liveRecommendations || []).map((rec: string, idx: number) => [
          idx <= 1 ? 'HIGH IMPACT' : 'MEDIUM',
          'Recommendation',
          '99',
          rec
        ]);

        autoTable(doc, {
          startY,
          head: [['Priority', 'Category', 'Karma', 'Action Signal / Recommendation']],
          body: recRows.length > 0 ? recRows : [['HIGH IMPACT', 'Striking distance', '99', 'Monitor keyword positions and internal linking.']],
          theme: 'grid',
          headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7.5 },
          bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
          margin: { left: 14, right: 14 }
        });
      } else if (activeTab === 'reddit') {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Reddit Thread Target Opportunities (Google SERP)', 14, startY);
        startY += 3;

        autoTable(doc, {
          startY,
          head: [['Thread Title / URL', 'Target Keyword', 'Search Volume', 'Est. Traffic', 'KD', 'Scrape Status']],
          body: (redditThreads || []).map((t: any) => [
            t.title || t.url || 'Reddit Thread',
            t.targetKeyword || t.topKeyword || '—',
            (t.searchVolume || t.topKeywordVolume || 0).toLocaleString(),
            (t.estTraffic || t.organicTraffic || t.traffic || 0).toLocaleString(),
            t.keywordDifficulty || 0,
            t.scrapeStatus || 'Unscraped'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold', fontSize: 7.5 },
          bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
          margin: { left: 14, right: 14 }
        });
      }

      doc.save(`Titan_Ahrefs_${reportTitle.replace(/\s+/g, '_')}_${primaryDomain.replace(/\./g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleCsvExport = () => {
    setIsOpen(false);
    const primaryDomain = domain || 'titantreasure.com';

    if (activeTab === 'overview') {
      const headers = ['Section', 'Item / URL', 'Metric 1', 'Metric 2', 'Details'];
      const rows: (string | number)[][] = [
        ['KPI Summary', 'SEO Health Score', summary?.healthScore ?? 'N/A', '', '0-100 Score'],
        ['KPI Summary', 'Domain Rating', summary?.domain_rating ?? 'N/A', summary?.ahrefs_rank ? `Rank #${summary.ahrefs_rank}` : '', 'Ahrefs DR'],
        ['KPI Summary', 'Organic Traffic', summary?.organic_traffic ?? 'N/A', '', 'Monthly visits'],
        ['KPI Summary', 'Referring Domains', summary?.ref_domains ?? backlinks.length, '', 'Unique linking domains'],
        ...(overviewKeywords.length > 0 ? overviewKeywords : keywords.slice(0, 3)).map((k: any) => ['Top Keyword', k.keyword, `#${k.position}`, k.traffic, `Volume: ${k.search_volume}`]),
        ...pages.slice(0, 3).map((p: any) => ['Top Page', p.url, p.top_keyword || '—', p.organic_traffic, `Keywords: ${p.organic_keywords}`]),
        ...backlinks.slice(0, 3).map((b: any) => ['Backlink', b.ref_domain || b.urlFrom || '', b.domain_rating || 0, b.dofollow_links ? 'Dofollow' : 'Nofollow', b.status || 'ACTIVE'])
      ];
      downloadCsv(`titan-ahrefs-overview-${primaryDomain}.csv`, headers, rows);
    } else if (activeTab === 'keywords') {
      const headers = ['Keyword', 'Position', 'Position Delta', 'Search Volume', 'Keyword Difficulty', 'Est. Traffic', 'Intent', 'Striking Distance'];
      const rows = keywords.map((k: any) => [
        k.keyword,
        k.position,
        k.position_delta || 0,
        k.search_volume || 0,
        k.keyword_difficulty || 0,
        k.traffic || 0,
        k.intent || 'Informational',
        k.striking_distance || (k.position >= 4 && k.position <= 20 ? 'YES' : 'NO')
      ]);
      downloadCsv(`titan-ahrefs-keywords-${primaryDomain}.csv`, headers, rows);
    } else if (activeTab === 'pages') {
      const headers = ['Page URL', 'Top Keyword', 'Organic Traffic', 'Ranking Keywords'];
      const rows = pages.map((p: any) => [
        p.url,
        p.top_keyword || '—',
        p.organic_traffic || 0,
        p.organic_keywords || 0
      ]);
      downloadCsv(`titan-ahrefs-pages-${primaryDomain}.csv`, headers, rows);
    } else if (activeTab === 'backlinks') {
      const headers = ['Referring Domain', 'Domain Rating', 'Dofollow Links', 'Status'];
      const rows = backlinks.map((b: any) => [
        b.ref_domain || b.urlFrom || '',
        b.domain_rating || 0,
        b.dofollow_links ? 'Yes' : 'No',
        b.status || 'ACTIVE'
      ]);
      downloadCsv(`titan-ahrefs-backlinks-${primaryDomain}.csv`, headers, rows);
    } else if (activeTab === 'competitors') {
      const headers = ['Competitor Domain', 'Domain Rating', 'Shared Keywords', 'Exclusive Keywords', 'Est. Traffic'];
      const rows = competitors.map((c: any) => [
        c.competitor_domain || '',
        c.competitor_dr || 0,
        c.overlap_keywords || 0,
        c.competitor_keywords || 0,
        c.competitor_traffic || 0
      ]);
      downloadCsv(`titan-ahrefs-competitors-${primaryDomain}.csv`, headers, rows);
    } else if (activeTab === 'insights') {
      const headers = ['Priority', 'Category', 'Karma', 'Recommendation'];
      const rows = (liveRecommendations || []).map((rec: string, idx: number) => [
        idx <= 1 ? 'HIGH IMPACT' : 'MEDIUM',
        'Recommendation',
        99,
        rec
      ]);
      downloadCsv(`titan-ahrefs-insights-${primaryDomain}.csv`, headers, rows);
    } else if (activeTab === 'reddit') {
      const headers = ['Reddit Thread Title', 'Canonical URL', 'Target Keyword', 'Search Volume', 'Est. Google Traffic', 'Keyword Difficulty (KD)', 'URL Rating', 'Scrape Status'];
      const rows = (redditThreads || []).map((t: any) => [
        t.title || t.topKeyword || 'Reddit Thread',
        t.url || '',
        t.targetKeyword || t.topKeyword || '',
        t.searchVolume || t.topKeywordVolume || 0,
        t.estTraffic || t.organicTraffic || t.traffic || 0,
        t.keywordDifficulty || 0,
        t.urlRating || 0,
        t.scrapeStatus || 'Unscraped'
      ]);
      downloadCsv(`titan-ahrefs-reddit-targets-${primaryDomain}.csv`, headers, rows);
    }
  };

  const handleEmailSummary = async () => {
    setIsOpen(false);
    setIsEmailModalOpen(true);
    setLoadingEmail(true);

    try {
      const primaryDomain = domain || 'titantreasure.com';
      const dateStr = new Date().toISOString().slice(0, 10);
      let subject = '';
      let body = '';

      if (activeTab === 'overview') {
        subject = `Executive Weekly SEO Briefing — ${primaryDomain} (${dateStr})`;
        body = `Hi Team,\n\nHere is your high-level Executive SEO Briefing for ${primaryDomain}:\n\n` +
          `• SEO Health Score: ${summary?.healthScore ?? 'N/A'}/100\n` +
          `• Domain Rating: ${summary?.domain_rating ?? 'N/A'}\n` +
          `• Est. Organic Traffic: ${(summary?.organic_traffic ?? 0).toLocaleString()} monthly visits\n` +
          `• Referring Domains: ${summary?.ref_domains ?? backlinks.length}\n\n` +
          `Top Keyword Movements (Condensed):\n` +
          (overviewKeywords.length > 0 ? overviewKeywords : keywords.slice(0, 3)).map((k: any) => `  - ${k.keyword} (#${k.position}, Traffic: ${k.traffic?.toLocaleString() ?? '—'})`).join('\n') + '\n\n' +
          `Best regards,\nTitan SEO Automation Engine`;
      } else if (activeTab === 'keywords') {
        subject = `Keyword Rankings Report — ${primaryDomain} (${dateStr}${keywordFilterLabel ? ` | ${keywordFilterLabel}` : ''})`;
        body = `Hi Team,\n\nHere is the keyword performance summary for ${primaryDomain}:\n\n` +
          keywords.map((k: any) => `• ${k.keyword} | Pos #${k.position} (${(k.position_delta || 0) >= 0 ? `+${k.position_delta || 0}` : k.position_delta}) | Volume: ${k.search_volume?.toLocaleString() ?? 0} | Est. Traffic: ${k.traffic?.toLocaleString() ?? 0}`).join('\n') + '\n\n' +
          `Best regards,\nTitan SEO Team`;
      } else if (activeTab === 'pages') {
        subject = `Top Pages Performance Report — ${primaryDomain} (${dateStr})`;
        body = `Hi Team,\n\nHere is the top performing pages summary for ${primaryDomain}:\n\n` +
          pages.map((p: any) => `• ${p.url.replace(/^https?:\/\//, '')} | Est. Traffic: ${(p.organic_traffic || 0).toLocaleString()} | Top Kw: ${p.top_keyword || '—'} | Keywords: ${p.organic_keywords || 0}`).join('\n') + '\n\n' +
          `Best regards,\nTitan SEO Team`;
      } else if (activeTab === 'backlinks') {
        subject = `Referring Domains & Backlinks Report — ${primaryDomain} (${dateStr})`;
        body = `Hi Team,\n\nHere is the referring domains summary for ${primaryDomain}:\n\n` +
          backlinks.map((b: any) => `• ${b.ref_domain || b.urlFrom || ''} | DR ${b.domain_rating || 0} | Dofollow: ${b.dofollow_links ? 'Yes' : 'No'} | Status: ${b.status || 'ACTIVE'}`).join('\n') + '\n\n' +
          `Best regards,\nTitan SEO Team`;
      } else if (activeTab === 'competitors') {
        subject = `Competitor SERP Gap Analysis — ${primaryDomain} (${dateStr})`;
        body = `Hi Team,\n\nHere is the competitor keyword gap analysis for ${primaryDomain}:\n\n` +
          competitors.map((c: any) => `• ${c.competitor_domain} | DR ${c.competitor_dr || 0} | Kw Overlap: ${c.overlap_keywords?.toLocaleString() ?? 0} | Their Kws: ${c.competitor_keywords?.toLocaleString() ?? 0} | Est. Traffic: ${c.competitor_traffic?.toLocaleString() ?? 0}`).join('\n') + '\n\n' +
          `Best regards,\nTitan SEO Team`;
      } else {
        subject = `SEO Action & Insights Briefing — ${primaryDomain} (${dateStr})`;
        body = `Hi Team,\n\nHere are the latest actionable SEO recommendations for ${primaryDomain}:\n\n` +
          (liveRecommendations.length > 0 ? liveRecommendations : [
            'Maintain backlink acquisition velocity and monitor core branded ranking keywords.',
            'Refrain from aggressive title updates on top 3 ranking URLs.'
          ]).map((rec: string, idx: number) => `• [${idx <= 1 ? 'HIGH IMPACT' : 'RECOMMENDATION'}] ${rec}`).join('\n') + '\n\n' +
          `Best regards,\nTitan SEO Team`;
      }

      setEmailSubject(subject);
      setEmailBody(body);
    } catch {
      setEmailSubject(`Executive Weekly SEO Briefing — ${domain}`);
      setEmailBody(`Hi Team,\n\nHere is the executive SEO performance briefing for ${domain}.\n\nBest regards,\nTitan SEO Team`);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    const textToCopy = emailTab === 'plain' ? `Subject: ${emailSubject}\n\n${emailBody}` : emailBody;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative inline-block text-left flex-1 sm:flex-initial" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPdfGenerating}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 sm:py-1.5 text-xs font-semibold text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/60 transition-all disabled:opacity-50 w-full sm:w-auto whitespace-nowrap"
        aria-label="Export Report"
      >
        {isPdfGenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
        ) : (
          <Download className="h-3.5 w-3.5 shrink-0" />
        )}
        <span className="whitespace-nowrap">{isPdfGenerating ? 'Generating...' : 'Export Report'}</span>
        <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-[rgba(255,255,255,0.12)] shadow-2xl z-50 overflow-hidden py-1">
          <div className="px-3.5 py-2 border-b border-[rgba(255,255,255,0.06)] text-[10px] uppercase font-bold text-slate-500 tracking-wider text-left">
            Export As ({activeTab.toUpperCase()})
          </div>

          <button
            onClick={handlePdfExport}
            className="w-full text-left px-3.5 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
          >
            <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-white">Download PDF Report (.pdf)</div>
              <div className="text-[10px] text-slate-400">Current tab view as PDF</div>
            </div>
          </button>

          <button
            onClick={handleCsvExport}
            className="w-full text-left px-3.5 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-white">Download CSV / Excel (.csv)</div>
              <div className="text-[10px] text-slate-400">Spreadsheet-ready data export</div>
            </div>
          </button>

          <button
            onClick={handleEmailSummary}
            className="w-full text-left px-3.5 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
          >
            <Mail className="h-4 w-4 text-purple-400 shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-white">Email Summary</div>
              <div className="text-[10px] text-slate-400">Copy-ready summary for your team</div>
            </div>
          </button>
        </div>
      )}

      {/* Email Summary Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)] bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Weekly SEO Summary</h3>
                  <p className="text-[11px] text-slate-400">{domain}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-[rgba(255,255,255,0.06)] text-[11px]">
                  <button
                    onClick={() => setEmailTab('rich')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${emailTab === 'rich' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Email Preview
                  </button>
                  <button
                    onClick={() => setEmailTab('plain')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${emailTab === 'plain' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Plain Text
                  </button>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="text-slate-500 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950/70">
              {loadingEmail ? (
                <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                  Preparing email summary...
                </div>
              ) : emailTab === 'rich' ? (
                <div className="bg-slate-900 border border-[rgba(255,255,255,0.08)] rounded-xl p-6 text-xs text-slate-300 space-y-4 shadow-inner">
                  <div className="pb-3 border-b border-[rgba(255,255,255,0.06)] font-semibold text-purple-300 text-sm">
                    Subject: {emailSubject}
                  </div>

                  <div className="whitespace-pre-line leading-relaxed text-slate-200 font-sans">
                    {emailBody}
                  </div>
                </div>
              ) : (
                <div className="p-4 font-mono text-xs text-slate-300 bg-slate-900 rounded-xl border border-[rgba(255,255,255,0.06)] whitespace-pre-wrap">
                  {`Subject: ${emailSubject}\n\n${emailBody}`}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(255,255,255,0.08)] bg-slate-900">
              <a
                href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody.slice(0, 1500))}`}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium underline inline-flex items-center gap-1"
              >
                Open in Email Client ↗
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-[rgba(255,255,255,0.1)] rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleCopyEmail}
                  className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-purple-400 hover:bg-purple-300 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Email Body'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
