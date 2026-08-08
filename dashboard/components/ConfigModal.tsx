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
  onConfigSaved: (targetDomain?: string) => void;
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

  const [newDomainInput, setNewDomainInput] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (currentConfig.primary_domain) setPrimaryDomain(currentConfig.primary_domain);
      if (currentConfig.target_country) setCountry(currentConfig.target_country);
      if (currentConfig.competitors) {
        setComp1(currentConfig.competitors[0] || 'chumbacasino.com');
        setComp2(currentConfig.competitors[1] || 'pulsz.com');
        setComp3(currentConfig.competitors[2] || 'luckylandslots.com');
      }
      if (currentConfig.report_frequency) setFrequency(currentConfig.report_frequency);
      if (currentConfig.comparison_period) setComparisonPeriod(currentConfig.comparison_period);
      setSuccessMsg(null);
      setErrorMsg(null);
    }
  }, [isOpen, currentConfig]);

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
      setPrimaryDomain(cleanDomain);
      onSelectDomain(cleanDomain);
      setNewDomainInput('');
      setShowAddInput(false);
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
      // 1. Save domain to backend managed domains database/cookies
      await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: primaryDomain, target_country: country, competitors: [comp1, comp2, comp3].filter(Boolean) }),
      }).catch(() => null);

      // 2. Persist selected domain to parent state & localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('titan_ahrefs_selected_domain', primaryDomain);
      }
      onSelectDomain(primaryDomain);

      setSuccessMsg('Settings updated successfully.');
      setTimeout(() => {
        onConfigSaved(primaryDomain);
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
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-cyan-400" />
            ⚙️ Dashboard Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose which website to track and compare against competitors.
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

        {/* Section 2: Config Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Primary Target Domain Selection */}
          <div>
            <label className="block font-semibold text-slate-200 mb-0.5">Your Website</label>
            <p className="text-[11px] text-slate-400 mb-1.5">The main domain you want to track.</p>
            {!showAddInput ? (
              <div className="flex gap-2">
                <select
                  value={primaryDomain}
                  onChange={(e) => setPrimaryDomain(e.target.value)}
                  className="flex-1 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
                >
                  {domainOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddInput(true)}
                  title="Add new domain to dropdown"
                  className="inline-flex items-center gap-1 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] px-3 text-cyan-400 font-medium text-xs transition-colors shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
                {domainOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDomain(primaryDomain)}
                    title={`Remove "${primaryDomain}" from dropdown list`}
                    className="inline-flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 text-rose-400 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
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
                  placeholder="Enter new domain name (e.g. mysite.com)"
                  className="flex-1 rounded-lg border border-cyan-500/50 bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddDomain}
                  disabled={addingDomain || !newDomainInput.trim()}
                  className="rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-2 text-xs font-medium text-white transition-colors disabled:opacity-40 shrink-0"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddInput(false);
                    setNewDomainInput('');
                  }}
                  className="rounded-lg border border-[rgba(255,255,255,0.1)] px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Competitor Domains */}
          <div>
            <label className="block font-semibold text-slate-200 mb-0.5">Competitor Websites</label>
            <p className="text-[11px] text-slate-400 mb-1.5">Websites competing for the same Google search traffic.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  value={comp1}
                  onChange={(e) => setComp1(e.target.value)}
                  placeholder="chumbacasino.com"
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={comp2}
                  onChange={(e) => setComp2(e.target.value)}
                  placeholder="pulsz.com"
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={comp3}
                  onChange={(e) => setComp3(e.target.value)}
                  placeholder="luckylandslots.com"
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0a0b0d] px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:border-[rgba(255,255,255,0.2)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Location, Frequency, Comparison Period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Target Location</label>
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
              <label className="block font-medium text-slate-300 mb-1.5">Update Schedule</label>
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
              <label className="block font-medium text-slate-300 mb-1.5">Compare Progress Against</label>
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
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all disabled:opacity-40 shadow-lg shadow-cyan-500/20"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving & Syncing…
                </>
              ) : (
                '✓ Apply Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

