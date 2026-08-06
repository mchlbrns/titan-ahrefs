import React, { useState } from 'react';
import { Settings, Save, X, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  webAppUrl: string;
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
  webAppUrl,
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
      const params = new URLSearchParams({
        action: 'updateConfig',
        primaryDomain,
        country,
        competitor1: comp1,
        competitor2: comp2,
        competitor3: comp3,
        frequency,
        comparisonPeriod,
        triggerSync: triggerSync ? 'true' : 'false',
      });

      const res = await fetch(`${webAppUrl}?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update config`);
      
      const json = await res.json();
      if (json.status === 'success') {
        setSuccessMsg('✅ Settings updated successfully! Live Ahrefs ingestion triggered.');
        setTimeout(() => {
          onConfigSaved();
          onClose();
        }, 1200);
      } else {
        throw new Error(json.message || 'Error updating configuration');
      }
    } catch (err: unknown) {
      console.error('Config update error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400 border border-cyan-500/20">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Engine & Domain Configuration</h2>
            <p className="text-xs text-slate-400">Edit primary domain, competitor targets, and comparison rules.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Primary Domain */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Primary Target Domain</label>
            <input
              type="text"
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value)}
              placeholder="e.g. titantreasure.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-cyan-500 focus:outline-none"
              required
            />
          </div>

          {/* Competitor Domains */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Competitor 1</label>
              <input
                type="text"
                value={comp1}
                onChange={(e) => setComp1(e.target.value)}
                placeholder="chumbacasino.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Competitor 2</label>
              <input
                type="text"
                value={comp2}
                onChange={(e) => setComp2(e.target.value)}
                placeholder="pulsz.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Competitor 3</label>
              <input
                type="text"
                value={comp3}
                onChange={(e) => setComp3(e.target.value)}
                placeholder="luckylandslots.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location, Frequency, Comparison Period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="us">United States (US)</option>
                <option value="uk">United Kingdom (UK)</option>
                <option value="ca">Canada (CA)</option>
                <option value="au">Australia (AU)</option>
                <option value="global">Global (Worldwide)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Report Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Weekly">Weekly (Every Monday)</option>
                <option value="Bi-Weekly">Bi-Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Comparison Period</label>
              <select
                value={comparisonPeriod}
                onChange={(e) => setComparisonPeriod(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Previous 7 days">Previous 7 days</option>
                <option value="Previous 14 days">Previous 14 days</option>
                <option value="Previous 30 days">Previous 30 days</option>
              </select>
            </div>
          </div>

          {/* Trigger live sync checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="triggerSync"
              checked={triggerSync}
              onChange={(e) => setTriggerSync(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <label htmlFor="triggerSync" className="text-slate-300">
              Run immediate live Ahrefs ingestion run after saving
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-800 px-4 py-2 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white shadow-md hover:bg-cyan-500 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving & Syncing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save & Apply Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
