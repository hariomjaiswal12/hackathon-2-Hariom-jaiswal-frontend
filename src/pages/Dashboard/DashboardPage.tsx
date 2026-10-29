import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { DashboardData } from '../../types';
import { CompanyCard } from '../../components/common/CompanyCard';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import {
  Compass,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { careerDNA, companies, savedCompanyIds } = useApp();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await apiClient.getDashboard();
      if (isMounted && res.success && res.data) {
        setDashboardData(res.data);
      }
      if (isMounted) setLoading(false);
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [savedCompanyIds]);

  const activeDna = dashboardData?.careerDNA || careerDNA || {};
  const activePriorities = activeDna?.priorities || {
    learning: 95,
    growth: 90,
    stability: 85,
    culture: 80,
    wlb: 75,
    salary: 70,
  };

  const stats = dashboardData?.stats || {
    companiesResearched: 12,
    savedCompanies: (savedCompanyIds || []).length,
    comparisons: 4,
    careerFitProfile: activeDna?.isComplete ? 'Complete' : 'In progress',
    lastUpdated: activeDna?.updatedAt || 'Recent',
  };

  const recommended = dashboardData?.recommendedCompanies?.length
    ? dashboardData.recommendedCompanies
    : (companies || []).slice(0, 3);

  const recentResearchList = dashboardData?.recentResearch || [
    {
      company: 'TCS',
      companySlug: 'tcs',
      lastResearched: 'Today · 10:42 AM',
      careerFit: '87% Excellent Match',
      nextStep: 'Continue research',
    },
    {
      company: 'Accenture',
      companySlug: 'accenture',
      lastResearched: 'Oct 28, 2026',
      careerFit: '91% Excellent Match',
      nextStep: 'View company',
    },
    {
      company: 'Infosys',
      companySlug: 'infosys',
      lastResearched: 'Oct 25, 2026',
      careerFit: '83% Strong Match',
      nextStep: 'View company',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Notice */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#373D91] dark:text-[#8B5CF6]" />
          <span>Live API Data · Connected to CompanyIQ Backend Engine</span>
        </div>
        {loading && (
          <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] flex items-center gap-1 animate-pulse">
            <RotateCcw size={11} className="animate-spin" /> Syncing dashboard...
          </span>
        )}
      </div>

      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#5A6A85] dark:text-[#94A3B8]">
            Good morning, {activeDna.name || 'Engineer'} 👋
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            Your Career Intelligence
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#CBD5E1] mt-1">
            A clearer view of your next career move. Start with what matters to you.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Compass size={15} />}
          onClick={() => navigate('/explore')}
        >
          Research a company
        </Button>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4">
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Companies Researched</span>
          <span className="text-[32px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight mt-1">
            {stats.companiesResearched}
          </span>
          <span className="text-[11px] text-[#177454] dark:text-[#22C55E] font-medium">+3 this month</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4">
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Saved Companies</span>
          <span className="text-[32px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight mt-1">
            {stats.savedCompanies}
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Your active shortlist</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4">
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Comparisons</span>
          <span className="text-[32px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight mt-1">
            {stats.comparisons}
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Saved scenarios</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4">
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block font-medium">Career Fit Profile</span>
          <span className="text-[24px] font-bold text-[#7547CB] dark:text-[#A78BFA] block leading-tight mt-2">
            {stats.careerFitProfile}
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Updated {stats.lastUpdated}</span>
        </div>
      </div>

      {/* Career DNA Summary + Shortlist Context Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Your Career DNA */}
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase">
                Your Career DNA
              </span>
              <Link
                to="/career-dna"
                className="text-[12px] text-[#373D91] dark:text-[#8B5CF6] hover:underline flex items-center gap-1 font-medium"
              >
                View Career DNA <ArrowRight size={12} />
              </Link>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#EEF0F9] dark:bg-[#1E293B] text-[#373D91] dark:text-[#8B5CF6] flex items-center justify-center font-bold text-[12px]">
                DNA
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
                  {activeDna?.targetRole || 'Backend Developer'}
                </h3>
                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
                  {activeDna?.experience || 'Fresher'} · {activeDna?.workStyle || 'Hybrid'} · {activeDna?.preferredLocation || 'India'}
                </span>
              </div>
            </div>

            {/* Top Priorities Progress bars */}
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>Learning</span>
                  <span className="font-semibold text-[#373D91] dark:text-[#8B5CF6]">{activePriorities.learning}</span>
                </div>
                <ProgressBar value={activePriorities.learning} height={5} color="#7547CB" animated={false} />
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>Growth</span>
                  <span className="font-semibold text-[#373D91] dark:text-[#8B5CF6]">{activePriorities.growth}</span>
                </div>
                <ProgressBar value={activePriorities.growth} height={5} color="#7547CB" animated={false} />
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-medium text-[#14213D] dark:text-[#F8FAFC] mb-1">
                  <span>Stability</span>
                  <span className="font-semibold text-[#373D91] dark:text-[#8B5CF6]">{activePriorities.stability}</span>
                </div>
                <ProgressBar value={activePriorities.stability} height={5} color="#7547CB" animated={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Shortlist in context */}
        <div className="bg-[#FAFBFD] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block mb-2">
              Your shortlist, in context
            </span>
            <p className="text-[14px] font-medium text-[#14213D] dark:text-[#F8FAFC] leading-relaxed mb-4">
              A high company score is a starting point. Your priorities reveal the trade-offs.
            </p>
            <div className="p-3 bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] text-[12px] text-[#5A6A85] dark:text-[#CBD5E1] leading-relaxed mb-4">
              <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC]">Accenture</span> leads baseline score, but{' '}
              <span className="font-semibold text-[#14213D] dark:text-[#F8FAFC]">TCS</span> holds greater stability alignment for freshers.
            </div>
          </div>

          <Button
            variant="ai"
            size="md"
            className="w-full justify-center"
            onClick={() => navigate('/career-fit')}
          >
            Explore your Career Fit
          </Button>
        </div>
      </div>

      {/* Recommended for your research */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
              Recommended for your research
            </h2>
            <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              Based on your saved Career DNA · Grounded in verified employee feedback
            </p>
          </div>
          <Link
            to="/career-fit"
            className="text-[12px] text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium flex items-center gap-1"
          >
            View all matches <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommended.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>

      {/* Recent Research Table */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">Recent research</h2>
          <Link
            to="/history"
            className="text-[12px] text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium flex items-center gap-1"
          >
            View history <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] dark:border-[#26324A] text-[#64748B] dark:text-[#94A3B8] font-semibold text-[11px] uppercase tracking-wider">
                <th className="pb-2.5">Company</th>
                <th className="pb-2.5">Last Researched</th>
                <th className="pb-2.5">Career Fit · Saved DNA</th>
                <th className="pb-2.5 text-right">Next Step</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
              {recentResearchList.length > 0 ? (
                recentResearchList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] dark:hover:bg-[#131C31]">
                    <td className="py-3 font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                      <Link to={`/company/${item.companySlug}`} className="hover:text-[#373D91] dark:hover:text-[#8B5CF6]">
                        {item.company}
                      </Link>
                    </td>
                    <td className="py-3 text-[#64748B] dark:text-[#94A3B8]">{item.lastResearched}</td>
                    <td className="py-3 font-medium text-[#7547CB] dark:text-[#A78BFA]">{item.careerFit}</td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/company/${item.companySlug}`}
                        className="text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium inline-flex items-center gap-1"
                      >
                        {item.nextStep} <ExternalLink size={11} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8]">
                    No recent company research queries yet.{' '}
                    <Link to="/explore" className="text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium ml-1">
                      Explore companies
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom context notice */}
      <div className="p-3 bg-[#EEF0F9] dark:bg-[#161B30] border border-[#D5DCF3] dark:border-[#2A3258] rounded-[4px] text-[12px] text-[#373D91] dark:text-[#A78BFA] flex items-center gap-2">
        <Sparkles size={15} className="shrink-0" />
        <span>
          Research with context: all AI interpretations include confidence, evidence and sample source references.
        </span>
      </div>
    </div>
  );
};
