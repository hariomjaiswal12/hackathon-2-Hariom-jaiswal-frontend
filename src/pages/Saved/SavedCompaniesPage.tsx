import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { companyService } from '../../services/companyService';
import { careerService } from '../../services/careerService';
import { Company } from '../../types';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, Bookmark, ExternalLink, ShieldCheck, Trash2 } from 'lucide-react';

export const SavedCompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const { savedCompanyIds, toggleSaveCompany, careerDNA, addCompanyToComparison, savedScenarios, user } = useApp();
  const [search, setSearch] = useState('');
  const [savedCompanies, setSavedCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    apiClient.getSavedCompanies().then((res) => {
      if (isMounted) {
        if (res.success && res.data) {
          setSavedCompanies(res.data);
        } else {
          setSavedCompanies(companyService.getCompanies().filter((c) => savedCompanyIds.includes(c.id)));
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [savedCompanyIds]);

  const handleRemove = async (id: string) => {
    setSavedCompanies((prev) => prev.filter((c) => c.id !== id && (c as any).slug !== id));
    await toggleSaveCompany(id);
  };

  const filtered = savedCompanies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#373D91] dark:text-[#818CF8]" />
        <span>
          {user
            ? 'Personal Shortlist · Scoped to your authenticated account'
            : 'Interactive Shortlist · Sign in to preserve saved companies'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
            MY RESEARCH / SHORTLIST
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            Your company shortlist
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
            Keep the evidence and your priorities close while you explore your next move.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/explore')}
        >
          + Explore companies
        </Button>
      </div>

      {/* Navigation Tabs (Saved Companies vs Saved Comparisons) */}
      <div className="flex items-center gap-4 border-b border-[#E2E8F0] dark:border-[#26324A] text-[13px] font-medium">
        <Link
          to="/saved"
          className="pb-2.5 font-bold text-[#373D91] dark:text-[#818CF8] border-b-2 border-[#373D91] dark:border-[#818CF8]"
        >
          Saved Companies · {savedCompanies.length}
        </Link>
        <Link
          to="/saved-comparisons"
          className="pb-2.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC]"
        >
          Saved Comparisons · {savedScenarios.length}
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your saved companies..."
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] text-[12px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#373D91] dark:focus:border-[#818CF8]"
        />
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={22} />}
          title="Your shortlist starts here"
          description="Save companies while researching them to compare trade-offs against your Career DNA."
          actionText="Explore Companies"
          onAction={() => navigate('/explore')}
        />
      ) : (
        /* Saved Table View (Page 38 in Figma) */
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-[#26324A] bg-[#F8FAFC] dark:bg-[#131C31] text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                  <th className="p-3.5">Company</th>
                  <th className="p-3.5">Company Intelligence</th>
                  <th className="p-3.5">Career Fit · Saved DNA</th>
                  <th className="p-3.5">Updated</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                {filtered.map((company) => {
                  const fit = careerService.calculateCareerFit(company, careerDNA.priorities);

                  return (
                    <tr key={company.id} className="hover:bg-[#FAFBFD] dark:hover:bg-[#131C31]/50">
                      <td className="p-3.5 font-bold text-[#14213D] dark:text-[#F8FAFC]">
                        <Link to={`/company/${company.id}`} className="hover:text-[#373D91] dark:hover:text-[#818CF8]">
                          {company.shortName} · {company.industry}
                        </Link>
                      </td>
                      <td className="p-3.5 font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                        {company.overallScore !== null && company.overallScore !== undefined ? `${company.overallScore} / 100` : 'Not available'}
                      </td>
                      <td className="p-3.5 font-bold text-[#7547CB] dark:text-[#A78BFA]">
                        {company.overallScore !== null && company.overallScore !== undefined ? `${fit.fitScore}% · ${fit.tier}` : 'Evidence pending'}
                      </td>
                      <td className="p-3.5 text-[#64748B] dark:text-[#94A3B8]">{company.lastUpdated ? company.lastUpdated.split('·')[0] : 'Recent'}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          to={`/company/${company.id}`}
                          className="text-[#373D91] dark:text-[#818CF8] hover:underline font-medium"
                        >
                          Open
                        </Link>
                        <span className="text-[#CBD5E1] dark:text-[#475569]">/</span>
                        <button
                          onClick={() => {
                            addCompanyToComparison(company.id);
                            navigate('/compare');
                          }}
                          className="text-[#373D91] dark:text-[#818CF8] hover:underline font-medium cursor-pointer"
                        >
                          Compare
                        </button>
                        <span className="text-[#CBD5E1] dark:text-[#475569]">/</span>
                        <button
                          onClick={() => toggleSaveCompany(company.id)}
                          className="text-[#B64348] dark:text-[#F87171] hover:underline font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid Cards (Page 38 in Figma) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedCompanies.slice(0, 2).map((comp) => {
          const fit = careerService.calculateCareerFit(comp, careerDNA.priorities);

          return (
            <div key={comp.id} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-[4px] flex items-center justify-center font-bold text-[12px] text-white"
                  style={{ backgroundColor: comp.logoBg || '#1E293B' }}
                >
                  {comp.logoText}
                </div>
                <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">{comp.shortName}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-y border-[#F1F5F9] dark:border-[#1E293B]">
                <div>
                  <span className="text-[26px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-none block">
                    {comp.overallScore !== null && comp.overallScore !== undefined ? `${comp.overallScore}/100` : 'Not available'}
                  </span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 block">
                    {comp.overallScore !== null ? (comp.positiveSignals?.[0] || 'Verified signals') : 'Evidence pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[26px] font-bold text-[#7547CB] dark:text-[#A78BFA] leading-none block">
                    {comp.overallScore !== null ? `${fit.fitScore}% fit` : 'Not available'}
                  </span>
                  <span className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] mt-0.5 block">
                    {comp.overallScore !== null ? 'Saved DNA match' : 'Evidence required'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[12px]">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/company/${comp.id}`)}
                >
                  Open
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addCompanyToComparison(comp.id);
                    navigate('/compare');
                  }}
                >
                  Compare
                </Button>
                <button
                  onClick={() => toggleSaveCompany(comp.id)}
                  className="text-[#B64348] dark:text-[#F87171] hover:underline ml-auto cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[11px] text-[#94A3B8] leading-relaxed">
        Saved-profile fit uses your Career DNA. Demo comparison scenarios may use different priority contexts.
      </div>
    </div>
  );
};

