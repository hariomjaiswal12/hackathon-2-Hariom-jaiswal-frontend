import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sourceService } from '../../services/sourceService';
import { apiClient } from '../../services/apiClient';
import { SourceItem } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Database, Sparkles, UserCheck, ShieldCheck, ExternalLink, AlertTriangle, X } from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  const { openEvidenceDrawer, companies } = useApp();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('vkaps-it-solutions');
  const [filterType, setFilterType] = useState<string>('all');
  const [inspectedSource, setInspectedSource] = useState<SourceItem | null>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiClient.getSources(selectedCompanyId).then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setSources(res.data);
        } else {
          setSources(sourceService.getSources());
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCompanyId]);

  const filtered = sources.filter((s) => {
    if (filterType === 'all') return true;
    return s.type === filterType;
  });

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId || c.slug === selectedCompanyId) || {
    name: 'VKAPS IT Solutions',
    shortName: 'VKAPS',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-16">
      {/* Disclaimer */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#373D91] dark:text-[#818CF8]" />
          <span>Official Corporate Registry & Evidence Provenance</span>
        </div>
        {loading && (
          <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] animate-pulse">
            Loading company sources...
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
            SYSTEM / TRANSPARENCY
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            Data & Sources
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
            Original inputs, official regulatory filings, and field provenance for {selectedCompany.name || selectedCompany.shortName}.
          </p>
        </div>

        {/* Company Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium">Select Company:</span>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-3 py-1.5 text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]"
          >
            {companies.map((c) => (
              <option key={c.id || c.slug} value={c.slug || c.id}>
                {c.name || c.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Pillar Cards (Page 11 in Figma) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-1.5">
          <div className="flex items-center gap-2 text-[#373D91] dark:text-[#818CF8] font-bold text-[14px]">
            <Database size={16} /> Source data
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Original inputs</span>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
            Company information, sample employee reviews and public research datasets.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-1.5">
          <div className="flex items-center gap-2 text-[#7547CB] dark:text-[#A78BFA] font-bold text-[14px]">
            <Sparkles size={16} /> AI interpretation
          </div>
          <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] block font-medium">Generated synthesis</span>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
            Themes, summaries and explanations linked to their evidence and limitations.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-1.5">
          <div className="flex items-center gap-2 text-[#14213D] dark:text-[#F8FAFC] font-bold text-[14px]">
            <UserCheck size={16} /> User preference
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Personal context</span>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
            Your priorities influence fit—not the underlying company evidence.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        {[
          { key: 'all', label: 'All sources' },
          { key: 'Official Company', label: 'Official Company' },
          { key: 'Employee Review', label: 'Employee Review' },
          { key: 'Public Dataset', label: 'Public Dataset' },
          { key: 'AI interpretation', label: 'AI interpretation' },
          { key: 'User Preference', label: 'User Preference' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition-colors cursor-pointer ${
              filterType === tab.key
                ? 'bg-[#373D91] text-white'
                : 'bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] text-[#14213D] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Registry Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#26324A] bg-[#F8FAFC] dark:bg-[#131C31] text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                <th className="p-3.5">Source Type</th>
                <th className="p-3.5">Sample Name</th>
                <th className="p-3.5">Sample Metrics & Freshness</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAFBFD] dark:hover:bg-[#131C31]/50">
                  <td className="p-3.5 font-semibold text-[#5A6A85] dark:text-[#CBD5E1]">{item.type}</td>
                  <td className="p-3.5 font-bold text-[#14213D] dark:text-[#F8FAFC]">{item.name}</td>
                  <td className="p-3.5 text-[#64748B] dark:text-[#94A3B8]">
                    <span>{item.sampleSize}</span> · <span>{item.date}</span> ({item.freshness})
                  </td>
                  <td className="p-3.5 text-center">
                    <Badge variant="status" text={item.status} size="sm" />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => setInspectedSource(item)}
                        className="text-[#5A6A85] dark:text-[#94A3B8] hover:underline font-medium cursor-pointer"
                      >
                        Inspect
                      </button>
                      {item.isAvailable !== false && item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open external destination for ${item.name}`}
                          className="text-[#373D91] dark:text-[#818CF8] hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          Visit Source <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                          {item.availabilityNotice || 'Link unavailable'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Integrity Section (Page 18 in Figma) */}
      <div className="space-y-4 pt-4 border-t border-[#E2E8F0] dark:border-[#26324A]">
        <div>
          <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
            Evidence integrity · Missing, conflicting, stale
          </h2>
          <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
            Absence of evidence is not a low score. Uncertainty is a visible product state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Missing */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#B64348] dark:text-[#F87171] uppercase tracking-wider block mb-1">
                INSUFFICIENT DATA
              </span>
              <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-2">Promotion timeline</h3>
              <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed mb-4">
                We don't have enough reliable information to evaluate this category. No score, fit contribution or trend is invented.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEvidenceDrawer(selectedCompanyId, 'learning')}
            >
              View coverage
            </Button>
          </div>

          {/* Conflicting */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#9A6417] dark:text-[#F59E0B] uppercase tracking-wider flex items-center gap-1 mb-1">
                <AlertTriangle size={12} /> Conflicting sources
              </span>
              <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-2">Salary progression</h3>
              <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed mb-4">
                Available sources provide different signals. Sample A trends positive; Sample B and C include more concerns. Preserve the disagreement.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEvidenceDrawer(selectedCompanyId, 'salary')}
            >
              Compare source evidence
            </Button>
          </div>

          {/* Stale */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#9A6417] dark:text-[#F59E0B] uppercase tracking-wider block mb-1">
                Stale · Last checked 8 months ago
              </span>
              <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] mb-2">Supporting public dataset</h3>
              <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed mb-4">
                This source may no longer describe the current workplace. Refresh before using it in a decision.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInspectedSource(sources[0] || null)}
            >
              View source details
            </Button>
          </div>
        </div>

        {/* Reusable confidence pattern bar */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4 space-y-2">
          <span className="text-[12px] font-bold text-[#14213D] dark:text-[#F8FAFC] block">
            Reusable confidence pattern
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Badge level="high" text="High confidence · 82%" />
            <Badge level="mixed" text="Mixed · Source conflict" />
            <Badge level="insufficient" text="Insufficient evidence · No score" />
            <Badge level="stale" text="Stale · Recheck source" />
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-1">
            Pair every major AI claim with a confidence label, Evidence and Sources. Confidence describes the quality and coverage of inputs—not an objective truth guarantee.
          </p>
        </div>
      </div>

      {/* Responsible Use Notice (Bottom of Page 11) */}
      <div className="bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-2">
        <h4 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          Responsible use of the sample corpus
        </h4>
        <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
          These are explicit sample source labels, not invented real citations. "Verified" describes consistency checks within the demo, not externally verified facts about an employer.
        </p>
        <span className="text-[11px] text-[#94A3B8] block">
          Conflicting salary signals differ across the sample. Missing: reliable promotion timelines. Stale: the illustrative public dataset was last checked 8 months ago.
        </span>
      </div>

      {/* Source Detail Modal */}
      {inspectedSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 max-w-lg w-full space-y-4 shadow-xl relative">
            <button
              onClick={() => setInspectedSource(null)}
              className="absolute top-4 right-4 text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC] p-1 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-2">
              <Badge level={inspectedSource.statusType === 'verified' ? 'high' : 'mixed'} text={inspectedSource.status} />
              <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">{inspectedSource.type}</span>
            </div>
            <h3 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">{inspectedSource.name}</h3>
            <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
              {inspectedSource.description}
            </p>
            <div className="bg-[#F8FAFC] dark:bg-[#131C31] p-3 rounded-[4px] text-[12px] text-[#14213D] dark:text-[#F8FAFC] space-y-1">
              <div><span className="text-[#64748B] dark:text-[#94A3B8]">Sample:</span> {inspectedSource.sampleSize}</div>
              <div><span className="text-[#64748B] dark:text-[#94A3B8]">Recorded:</span> {inspectedSource.date}</div>
              <div><span className="text-[#64748B] dark:text-[#94A3B8]">Consensus:</span> {inspectedSource.agreement || 'Verified'}</div>
              {inspectedSource.url && (
                <div className="pt-1 truncate">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Destination: </span>
                  <span className="font-mono text-[#373D91] dark:text-[#818CF8] text-[11px]">{inspectedSource.url}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-2">
              {inspectedSource.isAvailable !== false && inspectedSource.url ? (
                <a
                  href={inspectedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open external destination for ${inspectedSource.name}`}
                  className="px-3.5 py-1.5 rounded-[4px] bg-[#373D91] hover:bg-[#2F347C] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-xs"
                >
                  Visit Destination <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-[12px] text-slate-400 dark:text-slate-500 italic">
                  {inspectedSource.availabilityNotice || 'External destination unavailable'}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => setInspectedSource(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

