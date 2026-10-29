import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Trash2, ShieldCheck, History } from 'lucide-react';

export const ResearchHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history, clearHistory } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'Company' | 'Comparison' | 'AI question'>('all');

  const filtered = history.filter((item) => {
    if (filterType === 'all') return true;
    return item.type?.toLowerCase().includes(filterType.toLowerCase());
  });

  // Group items by dateGroup dynamically
  const grouped = filtered.reduce((acc, item) => {
    const group = item.dateGroup || 'RECENT ACTIVITY';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, typeof filtered>);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#373D91] dark:text-[#818CF8]" />
        <span>Logged Activity History · Tracked per session and saved to MongoDB Atlas</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
            MY RESEARCH / ACTIVITY
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            Research history
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
            Pick up where you left off. Your company visits, comparisons and AI questions in one place.
          </p>
        </div>

        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={13} />}
            onClick={() => {
              if (window.confirm('Clear all research activity history? Saved companies and comparisons will be preserved.')) {
                clearHistory();
              }
            }}
            className="text-[#B64348] dark:text-[#F87171]"
          >
            Clear history
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-[12px]">
        {[
          { key: 'all', label: 'All activity' },
          { key: 'Company', label: 'Companies' },
          { key: 'Comparison', label: 'Comparisons' },
          { key: 'AI question', label: 'AI questions' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key as any)}
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

      {/* Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<History size={22} />}
          title="A fresh research start"
          description="Your company visits, comparisons and AI questions will appear here."
          actionText="Start researching"
          onAction={() => navigate('/explore')}
        />
      ) : (
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] overflow-hidden space-y-6 p-6">
          {Object.entries(grouped).map(([dateGroup, items], index) => (
            <div key={dateGroup} className={`space-y-3 ${index > 0 ? 'pt-4 border-t border-[#F1F5F9] dark:border-[#1E293B]' : ''}`}>
              <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                {dateGroup}
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-[#26324A] text-[#64748B] dark:text-[#94A3B8] font-semibold text-[11px] uppercase tracking-wider">
                      <th className="pb-2 w-2/5">Research Activity</th>
                      <th className="pb-2 w-1/5">Type</th>
                      <th className="pb-2 w-1/4">Context</th>
                      <th className="pb-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FAFBFD] dark:hover:bg-[#131C31]/50">
                        <td className="py-2.5 font-semibold text-[#14213D] dark:text-[#F8FAFC]">
                          {item.link ? (
                            <Link to={item.link} className="hover:text-[#373D91] dark:hover:text-[#818CF8]">
                              {item.activity}
                            </Link>
                          ) : (
                            item.activity
                          )}
                        </td>
                        <td className="py-2.5 text-[#5A6A85] dark:text-[#CBD5E1]">{item.type}</td>
                        <td className="py-2.5 text-[#64748B] dark:text-[#94A3B8]">{item.context}</td>
                        <td className="py-2.5 text-right text-[#64748B] dark:text-[#94A3B8] font-medium">{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Privacy Control Card (Bottom of Page 10) */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
            You control your research history
          </h4>
          <p className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] mt-0.5">
            Clear your history in this workspace or manage research activity retention in Settings. Clearing history does not remove saved companies or comparisons.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/settings')}
        >
          Privacy & data controls
        </Button>
      </div>
    </div>
  );
};

