import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { companyService } from '../../services/companyService';
import { EvidenceDetail } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { X, ExternalLink, AlertTriangle, UserCheck, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { key: 'learning', label: 'Learning' },
  { key: 'growth', label: 'Growth' },
  { key: 'stability', label: 'Stability' },
  { key: 'culture', label: 'Culture' },
  { key: 'wlb', label: 'Work-Life Balance' },
  { key: 'salary', label: 'Salary & Benefits' },
  { key: 'management', label: 'Management' },
];

export const EvidenceDrawer: React.FC = () => {
  const { evidenceDrawer, closeEvidenceDrawer, openContextualAI, openEvidenceDrawer } = useApp();
  const navigate = useNavigate();

  const [evidence, setEvidence] = useState<EvidenceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!evidenceDrawer.isOpen) return;

    let isMounted = true;
    setLoading(true);

    apiClient.getEvidence(evidenceDrawer.companyId, evidenceDrawer.categoryKey).then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setEvidence(res.data);
        } else {
          setEvidence(companyService.getEvidenceDetail(evidenceDrawer.companyId, evidenceDrawer.categoryKey));
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [evidenceDrawer.isOpen, evidenceDrawer.companyId, evidenceDrawer.categoryKey]);

  if (!evidenceDrawer.isOpen) return null;

  const company = companyService.getCompanyById(evidenceDrawer.companyId);

  const handleAskAboutEvidence = () => {
    closeEvidenceDrawer();
    openContextualAI(evidenceDrawer.companyId);
  };

  const getStatusBadge = (status?: string) => {
    const s = status ? status.toUpperCase() : 'SUPPORTED';
    if (s === 'SUPPORTED') return <Badge level="high" text="SUPPORTED" />;
    if (s === 'CONFLICTING') return <Badge level="conflict" text="CONFLICTING" />;
    if (s === 'STALE') return <Badge level="stale" text="STALE" />;
    if (s === 'MISSING') return <Badge level="insufficient" text="MISSING" />;
    return <Badge variant="status" text={s} />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] h-full shadow-2xl flex flex-col border-l border-[#E2E8F0] dark:border-[#26324A] overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Top bar */}
        <div className="sticky top-0 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#26324A] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
              Why does CompanyIQ think this?
            </h2>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
              {company?.shortName || evidenceDrawer.companyId.toUpperCase()} / {evidenceDrawer.categoryKey.charAt(0).toUpperCase() + evidenceDrawer.categoryKey.slice(1)} evidence
            </p>
          </div>
          <button
            onClick={closeEvidenceDrawer}
            className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-[4px] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category switcher pills */}
        <div className="px-6 py-2.5 bg-[#F8FAFC] dark:bg-[#131C31] border-b border-[#E2E8F0] dark:border-[#26324A] flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => openEvidenceDrawer(evidenceDrawer.companyId, cat.key)}
              className={`px-2.5 py-1 rounded-[4px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                evidenceDrawer.categoryKey === cat.key
                  ? 'bg-[#373D91] dark:bg-[#6D4AFF] text-white'
                  : 'bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#26324A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading || !evidence ? (
          <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
            <RotateCcw size={24} className="animate-spin text-[#7547CB] mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-[#14213D] dark:text-[#F8FAFC]">Loading evidence...</p>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1">Connecting to GET /companies/{evidenceDrawer.companyId}/evidence</p>
          </div>
        ) : (
          <div className="p-6 space-y-6 flex-1">
            {/* AI interpretation banner */}
            <div className="p-4 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-[#7547CB] dark:text-[#A78BFA] bg-[#F4EFFD] dark:bg-[#7547CB]/20 px-2 py-0.5 rounded-[4px]">
                  AI interpretation
                </span>
                {getStatusBadge((evidence as any).status)}
              </div>
              <p className="text-[14px] font-medium text-[#14213D] dark:text-[#F8FAFC] leading-snug mb-3">
                {evidence.claim}
              </p>
              <Badge level={evidence.confidence?.level || 'high'} text={evidence.confidence?.label || 'Verified confidence'} />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px]">
                <span className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-none">
                  {evidence.reviewsAnalyzed ?? '—'}
                </span>
                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1.5 block">reviews analyzed</span>
              </div>
              <div className="p-4 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px]">
                <span className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-none">
                  {evidence.relevantMentions ?? '—'}
                </span>
                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1.5 block">
                  {evidence.categoryKey}-related mentions
                </span>
              </div>
            </div>

            {/* Sentiment distribution */}
            {evidence.sentimentBreakdown && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[12px] font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                    Source data · Sentiment distribution
                  </span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div>
                    <div className="flex justify-between text-[#177454] dark:text-[#22C55E] font-medium mb-1">
                      <span>Positive</span>
                      <span>{evidence.sentimentBreakdown.positive} mentions</span>
                    </div>
                    <div className="h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#177454] dark:bg-[#22C55E] rounded-full"
                        style={{
                          width: evidence.relevantMentions > 0
                            ? `${(evidence.sentimentBreakdown.positive / evidence.relevantMentions) * 100}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#5A6A85] dark:text-[#94A3B8] font-medium mb-1">
                      <span>Neutral</span>
                      <span>{evidence.sentimentBreakdown.neutral} mentions</span>
                    </div>
                    <div className="h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5A6A85] dark:bg-[#94A3B8] rounded-full"
                        style={{
                          width: evidence.relevantMentions > 0
                            ? `${(evidence.sentimentBreakdown.neutral / evidence.relevantMentions) * 100}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#9A6417] dark:text-[#F59E0B] font-medium mb-1">
                      <span>Negative</span>
                      <span>{evidence.sentimentBreakdown.negative} mentions</span>
                    </div>
                    <div className="h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#9A6417] dark:bg-[#F59E0B] rounded-full"
                        style={{
                          width: evidence.relevantMentions > 0
                            ? `${(evidence.sentimentBreakdown.negative / evidence.relevantMentions) * 100}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Original sample sources */}
            {evidence.sources && evidence.sources.length > 0 && (
              <div>
                <h4 className="text-[13px] font-semibold text-[#14213D] dark:text-[#F8FAFC] mb-2">
                  Original sample sources
                </h4>
                <div className="space-y-2">
                  {evidence.sources.map((src, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] flex items-center justify-between hover:border-[#CBD5E1] dark:hover:border-[#384869] transition-colors"
                    >
                      <div>
                        <span className="text-[13px] font-medium text-[#14213D] dark:text-[#F8FAFC] block">
                          {src.name}
                        </span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {src.reviewCount} reviews · {src.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge level={src.verified ? 'high' : 'mixed'} text={src.statusText || 'Verified'} size="sm" />
                        {(src as any).url ? (
                          <a
                            href={(src as any).url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open external destination for ${src.name}`}
                            className="text-[11px] text-[#373D91] dark:text-[#8B5CF6] hover:underline flex items-center gap-0.5 font-medium"
                          >
                            Open Source <ExternalLink size={10} />
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              closeEvidenceDrawer();
                              navigate('/sources');
                            }}
                            className="text-[11px] text-[#373D91] dark:text-[#8B5CF6] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                          >
                            View Registry
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context & Limitations */}
            <div className="p-4 bg-[#FEF7EE] dark:bg-[#221708] border border-[#F7E1C5] dark:border-[#4B3012] rounded-[6px] space-y-3">
              <h4 className="text-[12px] font-bold text-[#9A6417] dark:text-[#FBBF24] uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle size={14} /> Context & limitations
              </h4>
              <p className="text-[12px] text-[#9A6417] dark:text-[#FDE68A] leading-relaxed">
                {evidence.contextNote || 'Category signals reflect sample employee reviews and not corporate warranties.'}
              </p>
              {evidence.limitations && evidence.limitations.length > 0 && (
                <ul className="list-disc pl-4 text-[11px] text-[#9A6417] dark:text-[#FDE68A] space-y-1">
                  {evidence.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              )}
              <div className="pt-2 border-t border-[#F7E1C5]/60 dark:border-[#4B3012]">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#CBD5E1] flex items-center gap-1 mb-1">
                  <UserCheck size={12} /> User preference context
                </span>
                <p className="text-[12px] text-[#64748B] dark:text-[#CBD5E1] leading-relaxed">
                  {evidence.userPreferenceNote || 'Your priorities shape your Career Fit match, not this evidence distribution.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white dark:bg-[#0F172A] border-t border-[#E2E8F0] dark:border-[#26324A] p-4 flex gap-3">
          <Button variant="ai" className="w-full justify-center" onClick={handleAskAboutEvidence}>
            + Ask about this evidence
          </Button>
        </div>
      </div>
    </div>
  );
};
