import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Mail, ChevronDown, Check } from 'lucide-react';

interface ExportMenuProps {
  domain: string;
}

export default function ExportMenu({ domain }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
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
    window.open(`/api/report?format=html&domain=${encodeURIComponent(domain)}`, '_blank');
  };

  const handleCsvExport = () => {
    setIsOpen(false);
    window.open(`/api/report?format=csv&domain=${encodeURIComponent(domain)}`, '_blank');
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
      setEmailContent(`Weekly SEO Report for ${domain}\n\nUnable to generate full markdown summary.`);
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
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-[rgba(255,255,255,0.12)] shadow-2xl z-50 overflow-hidden py-1">
          <div className="px-3 py-1.5 border-b border-[rgba(255,255,255,0.06)] text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Export Formats
          </div>

          <button
            onClick={handlePdfExport}
            className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
          >
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <div>
              <div className="font-medium">PDF / Executive Report</div>
              <div className="text-[10px] text-slate-500">Printable HTML & PDF document</div>
            </div>
          </button>

          <button
            onClick={handleCsvExport}
            className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <div>
              <div className="font-medium">CSV / Excel Spreadsheet</div>
              <div className="text-[10px] text-slate-500">Raw SEO metrics & tables</div>
            </div>
          </button>

          <button
            onClick={handleEmailSummary}
            className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-purple-400" />
            <div>
              <div className="font-medium">Email Summary</div>
              <div className="text-[10px] text-slate-500">Formatted email markdown</div>
            </div>
          </button>
        </div>
      )}

      {/* Email Summary Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-[rgba(255,255,255,0.12)] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Email Summary Report — {domain}</h3>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="text-slate-500 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950/50 rounded-lg m-4 border border-[rgba(255,255,255,0.05)] whitespace-pre-wrap">
              {loadingEmail ? (
                <div className="py-12 text-center text-slate-500">Generating email summary report...</div>
              ) : (
                emailContent
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(255,255,255,0.08)] bg-slate-900/80">
              <a
                href={`mailto:?subject=${encodeURIComponent(`Weekly SEO Report — ${domain}`)}&body=${encodeURIComponent(emailContent.slice(0, 1500))}`}
                className="text-xs text-purple-400 hover:text-purple-300 underline"
              >
                Open in Email Client ↗
              </a>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-[rgba(255,255,255,0.1)] rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={handleCopyEmail}
                  className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-purple-400 hover:bg-purple-300 rounded-lg inline-flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Summary'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
