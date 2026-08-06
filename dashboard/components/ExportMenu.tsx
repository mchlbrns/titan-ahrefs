import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Mail, ChevronDown, Check, Sparkles } from 'lucide-react';

interface ExportMenuProps {
  domain: string;
}

export default function ExportMenu({ domain }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rich' | 'plain'>('rich');
  const [copied, setCopied] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);

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

  const handlePdfExport = () => {
    setIsOpen(false);
    // Opens print-ready window that automatically pops browser's native PDF export / Print dialog
    window.open(`/api/report?format=html&domain=${encodeURIComponent(domain)}`, 'TitanPdfReport', 'width=1100,height=850');
  };

  const handleCsvExport = () => {
    setIsOpen(false);
    const link = document.createElement('a');
    link.href = `/api/report?format=csv&domain=${encodeURIComponent(domain)}`;
    link.download = `ahrefs-seo-report-${domain}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmailSummary = async () => {
    setIsOpen(false);
    setIsEmailModalOpen(true);
    setLoadingEmail(true);
    try {
      const res = await fetch(`/api/report?format=markdown&domain=${encodeURIComponent(domain)}`);
      const text = await res.text();
      setEmailContent(text);
    } catch {
      setEmailContent(`Subject: Executive Weekly SEO Briefing — ${domain}\n\nHi Team,\n\nHere is the executive SEO performance briefing for ${domain}.\n\nBest regards,\nTitan SEO Team`);
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/60 transition-all"
      >
        <Download className="h-3.5 w-3.5" />
        Export Report
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-900 border border-[rgba(255,255,255,0.12)] shadow-2xl z-50 overflow-hidden py-1">
          <div className="px-3 py-1.5 border-b border-[rgba(255,255,255,0.06)] text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Export Report Options
          </div>

          <button
            onClick={handlePdfExport}
            className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
          >
            <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">PDF Executive Document</div>
              <div className="text-[10px] text-slate-500">Triggers instant PDF Save / Print window</div>
            </div>
          </button>

          <button
            onClick={handleCsvExport}
            className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">CSV / Excel Multi-Table</div>
              <div className="text-[10px] text-slate-500">Full structured telemetry data export</div>
            </div>
          </button>

          <button
            onClick={handleEmailSummary}
            className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
          >
            <Mail className="h-4 w-4 text-purple-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Humanized Email Briefing</div>
              <div className="text-[10px] text-slate-500">Executive summary for stakeholders</div>
            </div>
          </button>
        </div>
      )}

      {/* Humanized Email Briefing Modal */}
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
                  <h3 className="text-sm font-bold text-white">Executive Weekly Email Briefing</h3>
                  <p className="text-[11px] text-slate-400">{domain}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-[rgba(255,255,255,0.06)] text-[11px]">
                  <button
                    onClick={() => setActiveTab('rich')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'rich' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Email Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('plain')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${activeTab === 'plain' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}
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
                  Generating humanized executive email briefing...
                </div>
              ) : activeTab === 'rich' ? (
                <div className="bg-slate-900 border border-[rgba(255,255,255,0.08)] rounded-xl p-6 text-xs text-slate-300 space-y-4 shadow-inner">
                  <div className="pb-3 border-b border-[rgba(255,255,255,0.06)] font-semibold text-purple-300 text-sm">
                    Subject: Executive Weekly SEO Briefing — {domain} ({new Date().toISOString().slice(0, 10)})
                  </div>
                  
                  <div className="whitespace-pre-line leading-relaxed text-slate-200 font-sans">
                    {emailContent}
                  </div>
                </div>
              ) : (
                <div className="p-4 font-mono text-xs text-slate-300 bg-slate-900 rounded-xl border border-[rgba(255,255,255,0.06)] whitespace-pre-wrap">
                  {emailContent}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(255,255,255,0.08)] bg-slate-900">
              <a
                href={`mailto:?subject=${encodeURIComponent(`Executive Weekly SEO Briefing — ${domain}`)}&body=${encodeURIComponent(emailContent.slice(0, 1500))}`}
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
