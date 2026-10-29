import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Company } from '../../types';
import { useApp } from '../../context/AppContext';
import { careerService } from '../../services/careerService';
import { Bookmark, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface CompanyCardProps {
  company: Company;
  variant?: 'default' | 'compact' | 'saved';
  onRemove?: () => void;
  className?: string;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  variant = 'default',
  onRemove,
  className = '',
}) => {
  const navigate = useNavigate();
  const { careerDNA, toggleSaveCompany, isCompanySaved } = useApp();

  const companySlugOrId = (company as any).slug || company.id;
  const isSaved = companySlugOrId ? isCompanySaved(companySlugOrId) : false;
  const fitResult = careerService.calculateCareerFit(company, careerDNA?.priorities);

  const logoText = company?.logoText || company?.shortName?.slice(0, 2) || company?.name?.slice(0, 2) || 'CO';
  const shortName = company?.shortName || company?.name || 'Company';
  const industry = company?.industry || 'Technology';
  const overallScore = company?.overallScore ?? 85;
  const fitScore = fitResult?.fitScore ?? 85;
  const positiveSignals = Array.isArray(company?.positiveSignals) ? company.positiveSignals : [];
  const concernSignals = Array.isArray(company?.concernSignals) ? company.concernSignals : [];
  const sampleSummary = company?.sampleSourcesSummary || 'Verified sample sources';

  return (
    <div
      className={`bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 hover:border-[#CBD5E1] dark:hover:border-[#384869] transition-all flex flex-col justify-between ${className}`}
    >
      <div>
        {/* Top Header: Logo + Name + Save */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[6px] flex items-center justify-center font-bold text-[14px] shrink-0 uppercase shadow-xs"
              style={{
                backgroundColor: company?.logoBg || '#1E293B',
                color: company?.logoColor || '#FFFFFF',
              }}
            >
              {logoText}
            </div>
            <div>
              <h3
                onClick={() => companySlugOrId && navigate(`/company/${companySlugOrId}`)}
                className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] hover:text-[#373D91] dark:hover:text-[#8B5CF6] cursor-pointer transition-colors leading-tight"
              >
                {shortName}
              </h3>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">{industry}</p>
            </div>
          </div>

          <button
            onClick={() => company?.id && toggleSaveCompany(company.id)}
            className={`p-1.5 rounded-[4px] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors cursor-pointer ${
              isSaved ? 'text-[#373D91] dark:text-[#8B5CF6]' : 'text-[#94A3B8] dark:text-[#64748B]'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save company'}
          >
            <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Metrics Row: Overall Intelligence + Career Fit */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#F1F5F9] dark:border-[#1E293B] mb-4">
          <div>
            <div className="flex items-baseline gap-1">
              {company.overallScore !== null && company.overallScore !== undefined ? (
                <>
                  <span className="text-[26px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-none">
                    {company.overallScore}
                  </span>
                  <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">/ 100</span>
                </>
              ) : (
                <span className="text-[14px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                  Not available
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 block font-medium">
              Intelligence
            </span>
          </div>

          <div className="border-l border-[#F1F5F9] dark:border-[#1E293B] pl-4">
            <div className="flex items-baseline gap-1">
              {company.overallScore !== null && company.overallScore !== undefined ? (
                <span className="text-[26px] font-bold text-[#7547CB] dark:text-[#A78BFA] leading-none">
                  {fitScore}%
                </span>
              ) : (
                <span className="text-[14px] font-semibold text-[#7547CB] dark:text-[#A78BFA]">
                  Not available
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] mt-1 block font-medium">
              Career Fit · Saved DNA
            </span>
          </div>
        </div>

        {/* Key Signals */}
        <div className="space-y-1.5 mb-4 text-[12px]">
          {positiveSignals.slice(0, 1).map((sig, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[#177454] dark:text-[#22C55E]">
              <Check size={13} className="shrink-0" />
              <span className="font-medium truncate">{sig}</span>
            </div>
          ))}
          {concernSignals.slice(0, 1).map((sig, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[#9A6417] dark:text-[#F59E0B]">
              <AlertTriangle size={13} className="shrink-0" />
              <span className="font-medium truncate">{sig}</span>
            </div>
          ))}
        </div>

        {/* Confidence & Sample note */}
        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-4">
          <span className="font-medium text-[#177454] dark:text-[#22C55E]">High confidence</span> · {sampleSummary}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          onClick={() => companySlugOrId && navigate(`/company/${companySlugOrId}`)}
        >
          <span>View Intelligence</span>
          <ArrowRight size={13} />
        </Button>

        {variant === 'saved' && onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-[#B64348]">
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

