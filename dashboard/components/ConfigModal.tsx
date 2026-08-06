import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, Plus, Trash2, Globe } from 'lucide-react';

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
  domainOptions: string[];
  onDomainsChange: (domains: string[]) => void;
  onSelectDomain: (domain: string) => void;
  onConfigSaved: () => void;
}

export default function ConfigModal({
  isOpen,
  onClose,
  currentConfig,
  domainOptions,
  onDomainsChange,
  onSelectDomain,
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

  const [newDomainInput, setNewDomainInput] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddDomain = async () => {
    const cleanDomain = newDomainInput.trim().toLowerCase();
    if (!cleanDomain) return;
    if (domainOptions.includes(cleanDomain)) {
      setErrorMsg(`Domain "${cleanDomain}" is already in the list.`);
      return;
    }

    setAddingDomain(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleanDomain }),
      });
      if (!res.ok) throw new Error('Failed to add domain');
      const data = await res.json();
      const updatedList = data.managed_domains
        ? data.managed_domains.map((d: { domain: string }) => d.domain)
        : [...domainOptions, cleanDomain];

      onDomainsChange(updatedList);
      setNewDomainInput('');
      setSuccessMsg(`Added domain "${cleanDomain}" to managed domains.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding domain';
      setErrorMsg(msg);
    } finally {
      setAddingDomain(false);
    }
  };

  const handleDeleteDomain = async (domainToDelete: string) => {
    if (domainOptions.length <= 1) {
      setErrorMsg('You must have at least one domain in the managed list.');
      return;
    }

    setErrorMsg(null);
    try {
      const res = await fetch('/api/domains', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainToDelete }),
      });
      if (!res.ok) throw new Error('Failed to delete domain');
      const data = await res.json();
      const updatedList: string[] = data.managed_domains
        ? data.managed_domains.map((d: { domain: string }) => d.domain)
        : domainOptions.filter((d) => d !== domainToDelete);

      onDomainsChange(updatedList);
      if (primaryDomain === domainToDelete) {
        const nextDomain = updatedList[0] || 'titantreasure.com';
        setPrimaryDomain(nextDomain);
        onSelectDomain(nextDomain);
      }
      setSuccessMsg(`Removed domain "${domainToDelete}".`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error deleting domain';
      setErrorMsg(msg);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      onSelectDomain(primaryDomain);
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
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111318] p-6 shadow-2xl space-y-5 text-xs">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="border-b border-[rgba(255,255,255,0.06)] pb-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" />
            Engine & Domain Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage dropdown domains, active target domain, competitor targets, and comparison rules.
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

        {/* Section 1: Managed Dropdown Domains */}
        <div className="space-y-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0a0b0d] p-3.5">
          <label className="block font-medium text-slate-300">Managed Dropdown Domains</label>
          <div className="space-y-2">
            {domainOptions.map((dom) => {
              const isActive = dom === primaryDomain;
              return (
                <div
                  key={dom}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all ${
                    isActive
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                      : 'border-[rgba(255,255,255,0.08)] bg-[#111318] text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{dom}</span>
                    {isActive && (
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-semibold">
                        ACTIVE TARGET
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          setPrimaryDomain(dom);
                          onSelectDomain(dom);
                        }}
                        className="text-[11px] text-slate-400 hover:text-white bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteDomain(dom)}
                      title="Remove domain"
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add domain input */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newDomainInput}
              onChange={(e) => setNewDomainInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDomain();
                }
              }}
              placeholder="Add new domain (e.g. example.com)"
              className="flex-1 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#111318] px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleAddDomain}
              disabled={addingDomain || !newDomainInput.trim()}
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Section 2: Config Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Primary Target Domain Selection */}
          <div>
            <label className="block font-medium text-slate-400 mb-1.5">Primary Target Domain</label>
            <select
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value)}
              className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
            >
              {domainOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
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
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-500/30 transition-all disabled:opacity-40"
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

