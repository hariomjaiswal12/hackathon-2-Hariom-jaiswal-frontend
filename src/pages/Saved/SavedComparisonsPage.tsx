import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Plus, ArrowRight, ShieldCheck, GitCompare } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export const SavedComparisonsPage: React.FC = () => {
  const navigate = useNavigate();
  const { savedScenarios, removeScenario, setComparisonCompanies, savedCompanyIds } = useApp();

  const handleOpenScenario = (scen: any) => {
    const comps = scen.companies || scen.companyIds || [];
    setComparisonCompanies(comps);
    if (scen.scenarioType === 'battle' || scen.title?.toLowerCase().includes('battle') || String(scen.id).includes('battle')) {
      navigate('/compare/battle');
    } else {
      navigate('/compare');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#373D91] dark:text-[#818CF8]" />
        <span>Personal Research Scenarios · Scoped to your authenticated account</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
            MY RESEARCH / SCENARIOS
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            Saved comparisons
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
            Return to the trade-offs and priority scenarios you want to investigate.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={13} />}
          onClick={() => navigate('/compare')}
        >
          New comparison
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-[#E2E8F0] dark:border-[#26324A] text-[13px] font-medium">
        <Link
          to="/saved"
          className="pb-2.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC]"
        >
          Saved Companies · {savedCompanyIds.length}
        </Link>
        <Link
          to="/saved-comparisons"
          className="pb-2.5 font-bold text-[#373D91] dark:text-[#818CF8] border-b-2 border-[#373D91] dark:border-[#818CF8]"
        >
          Saved Comparisons · {savedScenarios.length}
        </Link>
      </div>

      {/* Scenarios Cards List (Page 9 in Figma) */}
      {savedScenarios.length === 0 ? (
        <EmptyState
          icon={<GitCompare size={22} />}
          title="No saved comparisons yet"
          description="Compare 2 or 3 companies side-by-side and save the results for quick reference."
          actionText="Create comparison"
          onAction={() => navigate('/compare')}
        />
      ) : (
        <div className="space-y-4">
          {savedScenarios.map((scen) => (
            <div
              key={scen.id}
              className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#CBD5E1] dark:hover:border-[#384869] transition-all"
            >
              <div>
                <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
                  {scen.title}
                </h3>
                <p className="text-[14px] font-semibold text-[#7547CB] dark:text-[#A78BFA] mt-1">
                  {scen.description}
                </p>
                <span className="text-[11px] text-[#94A3B8] block mt-1">
                  {scen.createdAt}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowRight size={13} />}
                  onClick={() => handleOpenScenario(scen)}
                >
                  Open comparison
                </Button>
                <button
                  onClick={() => removeScenario(scen.id)}
                  className="text-[12px] text-[#B64348] dark:text-[#F87171] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

