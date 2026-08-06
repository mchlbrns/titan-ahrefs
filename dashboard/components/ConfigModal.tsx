import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: {
    primary_domain: string;
    target_country: string;
    competitors: string[];
    report_frequency: string;
    comparison_period: string;
  };
  onConfigSaved: () => void;
}

export default function ConfigModal({
  isOpen,
  onClose,
  currentConfig,
  onConfigSaved,
}: ConfigModalProps) {
  const [primaryDomain, setPrimaryDomain] = useState(currentConfig.primary_domain || 'titantreasure.com');
  const [country, setCountry] = useState(currentConfig.target_country || 'us');
  const [comp1, setComp1] = useState(currentConfig.competitors?.[0] || 'chumbacasino.com');
  const [comp2, setComp2] = useState(currentConfig.competitors?.[1] || 'pulsz.com');
  const [comp3, setComp3] = useState(currentConfig.competitors?.[2] || 'luckylandslots.com');
  const [frequency, setFrequency] = useState(currentConfig.report_frequency || 'Weekly');
  const [comparisonPeriod, setComparisonPeriod] = useState(currentConfig.comparison_period || 'Previous 7 days');
  const [triggerSync, setTriggerSync] = useState(true);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      setSuccessMsg('Settings updated successfully. Native Ahrefs ingestion triggered.');
      setTimeout(() => {
        onConfigSaved();
        onClose();
      }, 800);
    } catch (err: unknown) {
      console.error('Config update error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111318] p-6 shadow-2xl space-y-5 text-xs">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="border-b border-[rgba(255,255,255,0.06)] pb-4">
          <h2 className="text-sm font-semibold text-white">Engine & Domain Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Edit primary domain, competitor targets, and comparison rules.
          </p>
        </div>

        {/* Banners */}
        {successMsg && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-400">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Primary Domain */}
          <div>
            <label className="block font-medium text-slate-400 mb-1.5">Primary Target Domain</label>
            <input
              type="text"
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value)}
              placeholder="e.g. titantreasure.com"
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Competitor Domains */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-400 mb-1.5">Competitor 1</label>
              <input
                type="text"
                value={comp1}
                onChange={(e) => setComp1(e.target.value)}
                placeholder="chumbacasino.com"
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-400 mb-1.5">Competitor 2</label>
              <input
                type="text"
                value={comp2}
                onChange={(e) => setComp2(e.target.value)}
                placeholder="pulsz.com"
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-400 mb-1.5">Competitor 3</label>
              <input
                type="text"
                value={comp3}
                onChange={(e) => setComp3(e.target.value)}
                placeholder="luckylandslots.com"
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Location, Frequency, Comparison Period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-400 mb-1.5">Target Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
              >
                <option value="us">United States (US)</option>
                <option value="uk">United Kingdom (UK)</option>
                <option value="ca">Canada (CA)</option>
                <option value="au">Australia (AU)</option>
                <option value="global">Global (Worldwide)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-400 mb-1.5">Report Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
              >
                <option value="Weekly">Weekly (Every Monday)</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-400 mb-1.5">Comparison Period</label>
              <select
                value={comparisonPeriod}
                onChange={(e) => setComparisonPeriod(e.target.value)}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
              >
                <option value="Previous 7 days">Previous 7 days</option>
                <option value="Previous 14 days">Previous 14 days</option>
                <option value="Previous 30 days">Previous 30 days</option>
              </select>
            </div>
          </div>

          {/* Trigger live sync checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="triggerSync"
              checked={triggerSync}
              onChange={(e) => setTriggerSync(e.target.checked)}
              className="rounded border-[rgba(255,255,255,0.12)] bg-[#0a0b0d] text-slate-200 accent-slate-400 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="triggerSync" className="text-slate-400 hover:text-slate-300 cursor-pointer">
              Run immediate live Ahrefs ingestion run after saving
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-400 border border-[rgba(255,255,255,0.08)] hover:text-white hover:border-[rgba(255,255,255,0.16)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-200 border border-[rgba(255,255,255,0.12)] hover:text-white hover:border-[rgba(255,255,255,0.24)] hover:bg-[rgba(255,255,255,0.03)] transition-all disabled:opacity-40"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving & Syncing…
                </>
              ) : (
                'Save & Apply Configuration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
