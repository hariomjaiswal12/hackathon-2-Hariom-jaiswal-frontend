import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../services/apiClient';
import { Bell, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, refreshAlerts, savedCompanyIds, user } = useApp();

  const [evidenceUpdates, setEvidenceUpdates] = useState(user?.notificationPreferences?.evidenceUpdates ?? true);
  const [staleSourceAlerts, setStaleSourceAlerts] = useState(user?.notificationPreferences?.sourceConflictAlerts ?? true);
  const [emailDigest, setEmailDigest] = useState(user?.notificationPreferences?.emailDigest ?? false);

  const handleTogglePref = async (key: 'evidenceUpdates' | 'sourceConflictAlerts' | 'emailDigest', value: boolean) => {
    if (key === 'evidenceUpdates') setEvidenceUpdates(value);
    if (key === 'sourceConflictAlerts') setStaleSourceAlerts(value);
    if (key === 'emailDigest') setEmailDigest(value);

    try {
      await apiClient.updateSettings({
        notificationPreferences: {
          evidenceUpdates: key === 'evidenceUpdates' ? value : evidenceUpdates,
          sourceConflictAlerts: key === 'sourceConflictAlerts' ? value : staleSourceAlerts,
          emailDigest: key === 'emailDigest' ? value : emailDigest,
          digestFrequency: user?.notificationPreferences?.digestFrequency || 'Weekly',
        },
      });
      refreshAlerts();
    } catch (_) {}
  };

  const newAlertsCount = alerts.filter((a) => a.isNew).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer */}
      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-[#373D91] dark:text-[#818CF8]" />
          <span>Live Intelligence Watchlist · Scoped by research preferences</span>
        </div>
        <span className="text-[11px] text-[#10B981] font-medium flex items-center gap-1">
          ● Active Monitoring
        </span>
      </div>

      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
          SYSTEM / NOTIFICATIONS
        </span>
        <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
          Company Watchlist
        </h1>
        <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
          Stay aware of changes to your research—not promises about what happens next.
        </p>
      </div>

      {/* 2 Stat Cards (Page 12 in Figma) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] block">Research updates</span>
          <span className="text-[32px] font-bold text-[#14213D] dark:text-[#F8FAFC] block leading-tight mt-1">
            {newAlertsCount} new
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Illustrative watchlist notifications</span>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5">
          <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] block">Watching</span>
          <span className="text-[32px] font-bold text-[#373D91] dark:text-[#818CF8] block leading-tight mt-1">
            {savedCompanyIds.length} companies
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">From your saved research shortlist</span>
        </div>
      </div>

      {/* Notification Cards */}
      {alerts.map((alert) => (
        <div key={alert.id} className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
              {alert.title}
            </h3>
            {alert.previousScore && alert.newScore ? (
              <Badge
                level="high"
                text={`${alert.newScore - alert.previousScore >= 0 ? '+' : ''}${alert.newScore - alert.previousScore} points`}
              />
            ) : alert.isNew ? (
              <span className="text-[10px] font-bold bg-[#373D91] text-white px-2 py-0.5 rounded-[4px]">
                NEW
              </span>
            ) : null}
          </div>

          {alert.previousScore && alert.newScore ? (
            <div className="flex items-center gap-6 py-2">
              <div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider block">
                  Previous Score
                </span>
                <span className="text-[36px] font-bold text-[#64748B] dark:text-[#94A3B8] leading-none">
                  {alert.previousScore}
                </span>
              </div>
              <span className="text-[20px] text-[#CBD5E1] dark:text-[#475569]">→</span>
              <div>
                <span className="text-[10px] text-[#177454] dark:text-[#34D399] font-bold uppercase tracking-wider block">
                  Watchlist Update · {alert.date || 'Oct 28, 2026'}
                </span>
                <span className="text-[36px] font-bold text-[#177454] dark:text-[#34D399] leading-none">
                  {alert.newScore}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[12px] text-[#9A6417] dark:text-[#F59E0B] font-medium">
              <AlertTriangle size={14} /> Recheck supporting dataset
            </div>
          )}

          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
            {alert.description}
          </p>

          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
            Source data update · High confidence · Verified signals
          </span>

          <div className="pt-2 flex items-center gap-3">
            <Button
              variant={alert.type === 'score_update' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                if (alert.companyId) {
                  navigate(`/company/${alert.companyId}`);
                } else {
                  navigate('/sources');
                }
              }}
            >
              {alert.actionText || 'Review changes'}
            </Button>
            {alert.isNew && (
              <button
                onClick={async () => {
                  await apiClient.markAlertRead(alert.id);
                  refreshAlerts();
                }}
                className="text-[12px] text-[#5A6A85] dark:text-[#94A3B8] hover:text-[#373D91] dark:hover:text-[#818CF8] underline cursor-pointer"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Watchlist Preferences */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-6 space-y-4">
        <h3 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
          Watchlist preferences
        </h3>

        <div className="space-y-3 text-[13px] text-[#14213D] dark:text-[#F8FAFC]">
          <label className="flex items-center gap-2.5 p-3 rounded-[4px] border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer">
            <input
              type="checkbox"
              checked={evidenceUpdates}
              onChange={(e) => handleTogglePref('evidenceUpdates', e.target.checked)}
              className="accent-[#373D91] w-4 h-4 rounded"
            />
            <span className="font-medium">Evidence and intelligence updates on tracked companies</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-[4px] border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer">
            <input
              type="checkbox"
              checked={staleSourceAlerts}
              onChange={(e) => handleTogglePref('sourceConflictAlerts', e.target.checked)}
              className="accent-[#373D91] w-4 h-4 rounded"
            />
            <span className="font-medium">Stale data or source conflict alerts</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-[4px] border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer">
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => handleTogglePref('emailDigest', e.target.checked)}
              className="accent-[#373D91] w-4 h-4 rounded"
            />
            <span className="font-medium">Email digest updates ({user?.notificationPreferences?.digestFrequency || 'Weekly'})</span>
          </label>
        </div>

        <p className="text-[11px] text-[#94A3B8]">
          Preferences are saved to your profile and filter in-app watchlist alerts in real-time.
        </p>
      </div>
    </div>
  );
};

