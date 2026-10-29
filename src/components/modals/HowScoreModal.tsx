import React from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { X, ShieldCheck, CheckCircle2, Scale, Layers } from 'lucide-react';

export const HowScoreModal: React.FC = () => {
  const { scoreModalOpen, closeScoreModal } = useApp();

  if (!scoreModalOpen) return null;

  const weights = [
    { name: 'Learning & Skill Velocity', weight: 20 },
    { name: 'Career Growth & Upward Mobility', weight: 20 },
    { name: 'Engineering Culture & Autonomy', weight: 15 },
    { name: 'Work-Life Balance & Sustainable Cadence', weight: 15 },
    { name: 'Compensation & Benefits Structure', weight: 15 },
    { name: 'Leadership & Engineering Management', weight: 15 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0F172A] rounded-[8px] border border-[#E2E8F0] dark:border-[#26324A] shadow-xl w-full max-w-xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={closeScoreModal}
          className="absolute top-4 right-4 text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC] p-1 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
            CompanyIQ Scoring & Confidence Methodology
          </h2>
        </div>
        <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] mb-5 leading-relaxed">
          Company Intelligence scores are synthesized from observable corporate registry filings, published technical offerings, client delivery audits, and verified employee feedback.
        </p>

        {/* 1. Overall Score Composite Weights */}
        <div className="space-y-3 mb-5 bg-[#F8FAFC] dark:bg-[#131C31] p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A]">
          <span className="text-[12px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-1.5 uppercase tracking-wider">
            <Scale size={14} className="text-[#7547CB] dark:text-[#A78BFA]" />
            Composite Intelligence Weights
          </span>
          <div className="space-y-2.5 pt-1">
            {weights.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-[12px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>{item.name}</span>
                  <span className="text-[#373D91] dark:text-[#8B5CF6] font-semibold">{item.weight}%</span>
                </div>
                <ProgressBar value={item.weight * 5} height={5} color="#7547CB" animated={false} />
              </div>
            ))}
          </div>
        </div>

        {/* 2. Mathematical Confidence Tripartite Standard */}
        <div className="space-y-3 mb-5 bg-[#FAFBFD] dark:bg-[#131C31] p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] text-[12px]">
          <span className="text-[12px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-1.5 uppercase tracking-wider">
            <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />
            Confidence Model (Max 100 Points)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 rounded bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="font-bold text-[#14213D] dark:text-[#F8FAFC] block">Source Reliability</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[13px] block">Up to 40 pts</span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">MCA Registry (16), Domain (12), B2B Directory (10)</span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="font-bold text-[#14213D] dark:text-[#F8FAFC] block">Category Completeness</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[13px] block">Up to 40 pts</span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">5 pts per verified workplace category (up to 8 categories)</span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155]">
              <span className="font-bold text-[#14213D] dark:text-[#F8FAFC] block">Data Recency</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[13px] block">Up to 20 pts</span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Verified within 90 days (20), 180 days (12)</span>
            </div>
          </div>
        </div>

        {/* 3. Principles & Integrity Standard */}
        <div className="space-y-2 text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed mb-6 border-t border-[#E2E8F0] dark:border-[#26324A] pt-4">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-[#10B981] mt-0.5 shrink-0" />
            <span><strong>Zero Hallucination:</strong> Missing categories are excluded rather than scored as zero. Confidence reflects verifiable source grounding, not certainty.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={14} className="text-[#10B981] mt-0.5 shrink-0" />
            <span><strong>Role Evidence Requirement:</strong> Personalized Career Fit scores require verified active employer requisitions or published skill benchmarks.</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="md" onClick={closeScoreModal}>
            Understood
          </Button>
        </div>
      </div>
    </div>
  );
};
