import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/apiClient';
import {
  ShieldCheck,
  Check,
  AlertCircle,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Bell,
  Lock,
  Layers,
  Sliders,
  User as UserIcon,
  HelpCircle,
} from 'lucide-react';

type SettingsTab = 'profile' | 'preferences' | 'privacy' | 'notifications';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[10px] shadow-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-full ${
              isDestructive
                ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
            }`}
          >
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 id="confirm-modal-title" className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
              {title}
            </h3>
            <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#26324A]">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const {
    careerDNA,
    updateCareerDNA,
    clearHistory,
    resetCareerDNA,
    clearAllSavedCompanies,
    user,
    updateUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [careerStage, setCareerStage] = useState('Fresher');
  const [targetRole, setTargetRole] = useState('Backend Developer');
  const [defaultLocation, setDefaultLocation] = useState('India');
  const [preferredWorkStyle, setPreferredWorkStyle] = useState<'Remote' | 'Hybrid' | 'On-site'>('Hybrid');

  const [showMetadata, setShowMetadata] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [useSavedDNA, setUseSavedDNA] = useState(true);

  const [evidenceUpdates, setEvidenceUpdates] = useState(true);
  const [sourceConflictAlerts, setSourceConflictAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [digestFreq, setDigestFreq] = useState('Weekly');

  // Baseline loaded values for dirty checking
  const [initialState, setInitialState] = useState<any>(null);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Status feedback states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    action: async () => {},
  });

  // Load canonical settings from backend API
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await apiClient.getSettings();
        if (res.success && res.data && isMounted) {
          const { profile, researchPreferences, notificationPreferences } = res.data;

          const loaded = {
            name: profile?.name || user?.name || '',
            email: profile?.email || user?.email || '',
            careerStage: profile?.careerStage || user?.careerStage || 'Fresher',
            targetRole: profile?.targetRole || user?.targetRole || 'Backend Developer',
            defaultLocation: researchPreferences?.defaultLocation || user?.defaultLocation || 'India',
            preferredWorkStyle: (researchPreferences?.preferredWorkStyle || user?.preferredWorkStyle || 'Hybrid') as any,
            showMetadata: researchPreferences?.showSourceMetadata ?? true,
            showConfidence: researchPreferences?.showConfidence ?? true,
            useSavedDNA: researchPreferences?.useCareerDNAForRecommendations ?? true,
            evidenceUpdates: notificationPreferences?.evidenceUpdates ?? true,
            sourceConflictAlerts: notificationPreferences?.sourceConflictAlerts ?? true,
            emailDigest: notificationPreferences?.emailDigest ?? false,
            digestFreq: notificationPreferences?.digestFrequency || 'Weekly',
          };

          setName(loaded.name);
          setEmail(loaded.email);
          setCareerStage(loaded.careerStage);
          setTargetRole(loaded.targetRole);
          setDefaultLocation(loaded.defaultLocation);
          setPreferredWorkStyle(loaded.preferredWorkStyle);
          setShowMetadata(loaded.showMetadata);
          setShowConfidence(loaded.showConfidence);
          setUseSavedDNA(loaded.useSavedDNA);
          setEvidenceUpdates(loaded.evidenceUpdates);
          setSourceConflictAlerts(loaded.sourceConflictAlerts);
          setEmailDigest(loaded.emailDigest);
          setDigestFreq(loaded.digestFreq);
          setIsDemoUser(!!profile?.isDemoUser || !!user?.isDemoUser);

          setInitialState(loaded);
        } else if (!res.success && isMounted) {
          setErrorMessage(res.error?.message || 'Failed to load settings from server.');
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Connection error while loading settings.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Track if current form state has unsaved changes
  const isDirty = useMemo(() => {
    if (!initialState) return false;
    return (
      name !== initialState.name ||
      email !== initialState.email ||
      careerStage !== initialState.careerStage ||
      targetRole !== initialState.targetRole ||
      defaultLocation !== initialState.defaultLocation ||
      preferredWorkStyle !== initialState.preferredWorkStyle ||
      showMetadata !== initialState.showMetadata ||
      showConfidence !== initialState.showConfidence ||
      useSavedDNA !== initialState.useSavedDNA ||
      evidenceUpdates !== initialState.evidenceUpdates ||
      sourceConflictAlerts !== initialState.sourceConflictAlerts ||
      emailDigest !== initialState.emailDigest ||
      digestFreq !== initialState.digestFreq
    );
  }, [
    initialState,
    name,
    email,
    careerStage,
    targetRole,
    defaultLocation,
    preferredWorkStyle,
    showMetadata,
    showConfidence,
    useSavedDNA,
    evidenceUpdates,
    sourceConflictAlerts,
    emailDigest,
    digestFreq,
  ]);

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Name is required.';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    } else if (name.trim().length > 100) {
      errors.name = 'Name cannot exceed 100 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!targetRole.trim()) {
      errors.targetRole = 'Target role is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setErrorMessage(null);
    setSaveSuccess(false);

    if (!validateForm()) {
      setActiveTab('profile'); // Switch to profile if validation failed there
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        profile: {
          name: name.trim(),
          email: email.trim(),
          careerStage,
          targetRole: targetRole.trim(),
        },
        researchPreferences: {
          defaultLocation: defaultLocation.trim(),
          preferredWorkStyle,
          showSourceMetadata: showMetadata,
          showConfidence,
          useCareerDNAForRecommendations: useSavedDNA,
        },
        notificationPreferences: {
          evidenceUpdates,
          sourceConflictAlerts,
          emailDigest,
          digestFrequency: digestFreq,
        },
      };

      const res = await apiClient.updateSettings(payload);

      if (res.success && res.data) {
        // Sync React context user state
        updateUser({
          name: name.trim(),
          email: email.trim(),
          careerStage,
          targetRole: targetRole.trim(),
          defaultLocation: defaultLocation.trim(),
          preferredWorkStyle,
          researchPreferences: {
            showSourceMetadata: showMetadata,
            showConfidence,
            useCareerDNAForRecommendations: useSavedDNA,
          },
          notificationPreferences: {
            evidenceUpdates,
            sourceConflictAlerts,
            emailDigest,
            digestFrequency: digestFreq,
          },
        });

        // Sync Career DNA
        await updateCareerDNA({
          ...careerDNA,
          name: name.trim(),
          experience: careerStage as any,
          targetRole: targetRole.trim(),
          workStyle: preferredWorkStyle,
          preferredLocation: defaultLocation.trim(),
        });

        const newInitial = {
          name: name.trim(),
          email: email.trim(),
          careerStage,
          targetRole: targetRole.trim(),
          defaultLocation: defaultLocation.trim(),
          preferredWorkStyle,
          showMetadata,
          showConfidence,
          useSavedDNA,
          evidenceUpdates,
          sourceConflictAlerts,
          emailDigest,
          digestFreq,
        };
        setInitialState(newInitial);
        setFieldErrors({});
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(res.error?.message || 'Failed to save settings. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await apiClient.exportUserData();
      const exportPayload = res.success && res.data ? res.data : {
        exportedAt: new Date().toISOString(),
        application: 'CompanyIQ',
        user: { name, email, careerStage, targetRole },
        careerDNA,
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CompanyIQ-Data-Export-${(name || 'User').replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setActionNotice('Research data archive successfully downloaded.');
      setTimeout(() => setActionNotice(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate data export.');
    } finally {
      setIsExporting(false);
    }
  };

  const triggerClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Research History',
      message:
        'Are you sure you want to clear your activity and lookup history? This action permanently removes your past company views and queries. Your profile, Career DNA, and saved companies will not be affected.',
      confirmLabel: 'Clear History',
      action: async () => {
        await apiClient.clearSettingsHistory();
        await clearHistory();
        setActionNotice('Research activity history has been cleared.');
        setTimeout(() => setActionNotice(null), 3500);
      },
    });
  };

  const triggerResetCareerDNA = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Career DNA',
      message:
        'Reset Career DNA to defaults? This will restore your skill priorities, category weights, and target preferences back to the initial starter baseline.',
      confirmLabel: 'Reset Career DNA',
      action: async () => {
        await apiClient.resetSettingsCareerDNA();
        await resetCareerDNA();
        setActionNotice('Career DNA has been reset to defaults.');
        setTimeout(() => setActionNotice(null), 3500);
      },
    });
  };

  const triggerClearSavedCompanies = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Clear Saved Companies',
      message:
        'Are you sure you want to remove all companies from your saved watchlist? You will need to save them again individually if needed.',
      confirmLabel: 'Clear Watchlist',
      action: async () => {
        await clearAllSavedCompanies();
        setActionNotice('Saved company watchlist has been cleared.');
        setTimeout(() => setActionNotice(null), 3500);
      },
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={async () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await confirmModal.action();
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Top Banner & Status Feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8]">
          <ShieldCheck size={14} className="text-[#373D91] dark:text-[#818CF8]" />
          <span>
            {isDemoUser
              ? 'Demo Session · Isolated sandbox account (Demo Guest)'
              : 'Authenticated Session · Settings saved to MongoDB Atlas'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span
              role="status"
              className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-[6px] flex items-center gap-1.5 animate-in fade-in"
            >
              <Check size={14} /> Settings saved successfully!
            </span>
          )}
          {actionNotice && (
            <span
              role="status"
              className="font-semibold text-[#373D91] dark:text-[#818CF8] bg-[#EEF0F9] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] px-3 py-1 rounded-[6px] flex items-center gap-1.5 animate-in fade-in"
            >
              <Check size={14} /> {actionNotice}
            </span>
          )}
          {isDirty && !saveSuccess && (
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
              ● Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Global Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-[8px] flex items-start gap-2.5 text-[13px] text-red-700 dark:text-red-300"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">Unable to save settings</p>
            <p className="text-[12px] mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Header & Global Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#E2E8F0] dark:border-[#26324A]">
        <div>
          <span className="text-[11px] font-bold text-[#5A6A85] dark:text-[#94A3B8] tracking-wider uppercase block">
            SYSTEM / CONFIGURATION
          </span>
          <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight mt-0.5">
            Settings
          </h1>
          <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
            Manage your personal profile, research parameters, privacy controls, and notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="shadow-sm"
          >
            {isSaving ? 'Saving changes...' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* Four Functional Tabs */}
      <nav
        role="tablist"
        aria-label="Settings configuration tabs"
        className="flex items-center gap-1 sm:gap-2 border-b border-[#E2E8F0] dark:border-[#26324A] text-[13px] overflow-x-auto no-scrollbar"
      >
        {[
          { key: 'profile', label: 'Profile', icon: UserIcon },
          { key: 'preferences', label: 'Preferences', icon: Sliders },
          { key: 'privacy', label: 'Privacy & Data', icon: ShieldCheck },
          { key: 'notifications', label: 'Notifications', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.key}`}
              onClick={() => setActiveTab(tab.key as SettingsTab)}
              className={`flex items-center gap-2 px-3.5 py-3 border-b-2 font-medium transition-colors cursor-pointer whitespace-nowrap text-[13px] ${
                isActive
                  ? 'border-[#373D91] dark:border-[#818CF8] text-[#373D91] dark:text-[#818CF8] font-bold bg-[#F8FAFC]/50 dark:bg-[#131C31]/50'
                  : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: Profile Tab */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <section
            role="tabpanel"
            id="tabpanel-profile"
            aria-labelledby="tab-profile"
            className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-6 shadow-xs animate-in fade-in duration-150"
          >
            <div>
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Personal Profile
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Manage your identity and career target. These values personalize your company fit scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[13px]">
              {/* Name Field */}
              <div>
                <label htmlFor="settings-name" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="settings-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  disabled={isLoading}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border rounded-[6px] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none transition-colors ${
                    fieldErrors.name
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-[#E2E8F0] dark:border-[#26324A] focus:border-[#373D91] dark:focus:border-[#818CF8]'
                  }`}
                />
                {fieldErrors.name ? (
                  <p className="text-[11px] text-red-500 mt-1">{fieldErrors.name}</p>
                ) : (
                  <p className="text-[11px] text-[#94A3B8] mt-1">Displayed in your header and research exports.</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="settings-email" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  {isDemoUser && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                      <Lock size={10} /> Demo Protected
                    </span>
                  )}
                </div>
                <input
                  id="settings-email"
                  type="email"
                  value={email}
                  disabled={isDemoUser || isLoading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border rounded-[6px] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none transition-colors ${
                    isDemoUser
                      ? 'opacity-70 cursor-not-allowed border-[#E2E8F0] dark:border-[#26324A]'
                      : fieldErrors.email
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-[#E2E8F0] dark:border-[#26324A] focus:border-[#373D91] dark:focus:border-[#818CF8]'
                  }`}
                />
                {fieldErrors.email ? (
                  <p className="text-[11px] text-red-500 mt-1">{fieldErrors.email}</p>
                ) : isDemoUser ? (
                  <p className="text-[11px] text-[#94A3B8] mt-1">
                    Demo guest login email is reserved and locked for testing.
                  </p>
                ) : (
                  <p className="text-[11px] text-[#94A3B8] mt-1">
                    Your authenticated account email used for sign in.
                  </p>
                )}
              </div>

              {/* Career Stage Dropdown */}
              <div>
                <label htmlFor="settings-career-stage" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1.5">
                  Career Stage
                </label>
                <select
                  id="settings-career-stage"
                  value={careerStage}
                  onChange={(e) => setCareerStage(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#818CF8]"
                >
                  <option value="Student">Student (Pre-graduate)</option>
                  <option value="Fresher">Fresher (0-1 yrs)</option>
                  <option value="1-2 years">Early Career (1-2 yrs)</option>
                  <option value="3+ years">Mid-Senior (3+ yrs)</option>
                </select>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Calibrates mentorship, learning curves, and promotion expectations.
                </p>
              </div>

              {/* Target Role Dropdown / Input */}
              <div>
                <label htmlFor="settings-target-role" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1.5">
                  Target Role
                </label>
                <select
                  id="settings-target-role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#818CF8]"
                >
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="Data Science">Data Science</option>
                  <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
                </select>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Primary engineering focus used for job matching.
                </p>
              </div>
            </div>

            {/* Career DNA Card Link */}
            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#26324A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#131C31] p-4 rounded-[6px]">
              <div>
                <span className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#373D91] dark:text-[#818CF8]" />
                  Fine-tune Career DNA Priorities
                </span>
                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  Adjust sliders for Learning, Work-Life Balance, Compensation, and Team Culture.
                </p>
              </div>
              <Link
                to="/career-dna/build"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-[6px] text-[12px] font-semibold text-[#373D91] dark:text-[#818CF8] hover:bg-[#EEF0F9] dark:hover:bg-[#1E293B] transition-colors"
              >
                <span>Edit Career DNA</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 2: Preferences Tab */}
        {/* ========================================================= */}
        {activeTab === 'preferences' && (
          <section
            role="tabpanel"
            id="tabpanel-preferences"
            aria-labelledby="tab-preferences"
            className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-6 shadow-xs animate-in fade-in duration-150"
          >
            <div>
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Research & Working Preferences
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Customize how CompanyIQ derives recommendations and renders evidence metadata.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[13px]">
              {/* Default Location */}
              <div>
                <label htmlFor="settings-location" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1.5">
                  Default Location
                </label>
                <select
                  id="settings-location"
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#818CF8]"
                >
                  <option value="India">India (Pan-India)</option>
                  <option value="Bangalore, India">Bangalore, India</option>
                  <option value="Hyderabad, India">Hyderabad, India</option>
                  <option value="Pune / Mumbai, India">Pune / Mumbai, India</option>
                  <option value="United States">United States</option>
                  <option value="Global">Global / Worldwide</option>
                </select>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Default geographical filter for company intelligence and open job discoveries.
                </p>
              </div>

              {/* Preferred Work Style */}
              <div>
                <label htmlFor="settings-workstyle" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1.5">
                  Preferred Work Style
                </label>
                <select
                  id="settings-workstyle"
                  value={preferredWorkStyle}
                  onChange={(e) => setPreferredWorkStyle(e.target.value as any)}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#373D91] dark:focus:border-[#818CF8]"
                >
                  <option value="Hybrid">Hybrid (Flexible in-office + remote)</option>
                  <option value="Remote">Remote (Full work from home)</option>
                  <option value="On-site">On-site (Full office presence)</option>
                </select>
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Calibrates work arrangement alignment scores in Battle Mode and Career Fit.
                </p>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#26324A]">
              <h3 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Display & Interpretation Controls
              </h3>

              <label className="flex items-start gap-3 p-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showMetadata}
                  onChange={(e) => setShowMetadata(e.target.checked)}
                  className="accent-[#373D91] w-4 h-4 rounded mt-0.5"
                />
                <div className="text-[12px]">
                  <span className="text-[#14213D] dark:text-[#F8FAFC] font-semibold block">
                    Show source and freshness metadata
                  </span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                    Display external source badges, sample counts, and last-verified dates across Company Intelligence views.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showConfidence}
                  onChange={(e) => setShowConfidence(e.target.checked)}
                  className="accent-[#373D91] w-4 h-4 rounded mt-0.5"
                />
                <div className="text-[12px]">
                  <span className="text-[#14213D] dark:text-[#F8FAFC] font-semibold block">
                    Show confidence with every AI Insight
                  </span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                    Render explainable confidence indicators (High / Medium / Verified) derived from data density and source agreement.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={useSavedDNA}
                  onChange={(e) => setUseSavedDNA(e.target.checked)}
                  className="accent-[#373D91] w-4 h-4 rounded mt-0.5"
                />
                <div className="text-[12px]">
                  <span className="text-[#14213D] dark:text-[#F8FAFC] font-semibold block">
                    Use saved Career DNA for recommendations
                  </span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                    When enabled, recommendations use your customized priorities. When disabled, recommendations default to balanced objective benchmarks.
                  </span>
                </div>
              </label>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 3: Privacy & Data Tab */}
        {/* ========================================================= */}
        {activeTab === 'privacy' && (
          <section
            role="tabpanel"
            id="tabpanel-privacy"
            aria-labelledby="tab-privacy"
            className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-6 shadow-xs animate-in fade-in duration-150"
          >
            <div>
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Privacy, Data Ownership & Retention
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Your priorities and activity belong to you. Manage exports, clear history, or reset preferences at any time.
              </p>
            </div>

            {/* Data Export Card */}
            <div className="p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] bg-[#F8FAFC] dark:bg-[#131C31] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[14px] font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <Download size={15} className="text-[#373D91] dark:text-[#818CF8]" />
                    Export Full Research Archive
                  </h3>
                  <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                    Download a standardized JSON package containing your authenticated profile, saved Career DNA, watchlist companies, comparison scenarios, and lookup logs. Zero secrets or credentials are included.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={isExporting}
                className="cursor-pointer"
              >
                {isExporting ? 'Generating export...' : 'Export my research data (.json)'}
              </Button>
            </div>

            {/* Destructive History & Watchlist Operations */}
            <div className="space-y-4 pt-2">
              <h3 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Data Management & Deletion Actions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Clear Research History */}
                <div className="p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] space-y-2 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                      Research History
                    </h4>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Removes recent company views and AI inquiries. Does not delete saved companies.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerClearHistory}
                    className="w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                  >
                    <Trash2 size={13} className="mr-1" /> Clear history
                  </Button>
                </div>

                {/* Reset Career DNA */}
                <div className="p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] space-y-2 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                      Reset Career DNA
                    </h4>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Restores your customized category priority weights to default baseline levels.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerResetCareerDNA}
                    className="w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                  >
                    <RotateCcw size={13} className="mr-1" /> Reset Career DNA
                  </Button>
                </div>

                {/* Clear Saved Companies */}
                <div className="p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] space-y-2 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                      Saved Companies
                    </h4>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Clears your personal pinned companies and watchlist items.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={triggerClearSavedCompanies}
                    className="w-full justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                  >
                    <Trash2 size={13} className="mr-1" /> Clear saved companies
                  </Button>
                </div>
              </div>
            </div>

            {/* Architecture Transparency Card */}
            <div className="p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] bg-[#FAFBFD] dark:bg-[#131C31] text-[12px] space-y-2">
              <h4 className="font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <HelpCircle size={14} className="text-[#373D91] dark:text-[#818CF8]" />
                Data Storage & Session Isolation
              </h4>
              <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                <strong className="text-[#14213D] dark:text-[#F8FAFC]">Backend Persistence:</strong> Profiles, settings, and research histories are scoped by authenticated MongoDB user IDs on Atlas.
              </p>
              <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                <strong className="text-[#14213D] dark:text-[#F8FAFC]">Demo Account Boundary:</strong> Demo Guest data is strictly flagged with <code className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-[11px]">isDemoUser: true</code>. Privacy actions executed in this session never alter registered user records.
              </p>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 4: Notifications Tab */}
        {/* ========================================================= */}
        {activeTab === 'notifications' && (
          <section
            role="tabpanel"
            id="tabpanel-notifications"
            aria-labelledby="tab-notifications"
            className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[8px] p-6 space-y-6 shadow-xs animate-in fade-in duration-150"
          >
            <div>
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                Notification & Alert Preferences
              </h2>
              <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Control in-app alerts and digest notifications for companies on your watchlist.
              </p>
            </div>

            <div className="space-y-3">
              {/* Evidence Updates */}
              <label className="flex items-start gap-3 p-3.5 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={evidenceUpdates}
                  onChange={(e) => setEvidenceUpdates(e.target.checked)}
                  className="accent-[#373D91] w-4 h-4 rounded mt-0.5"
                />
                <div className="text-[12px]">
                  <span className="text-[#14213D] dark:text-[#F8FAFC] font-semibold block">
                    Evidence updates for watched companies
                  </span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                    Receive in-app alerts when scores, salary insights, or interview feedback change for companies you track.
                  </span>
                </div>
              </label>

              {/* Source Conflict & Freshness Alerts */}
              <label className="flex items-start gap-3 p-3.5 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={sourceConflictAlerts}
                  onChange={(e) => setSourceConflictAlerts(e.target.checked)}
                  className="accent-[#373D91] w-4 h-4 rounded mt-0.5"
                />
                <div className="text-[12px]">
                  <span className="text-[#14213D] dark:text-[#F8FAFC] font-semibold block">
                    Source conflict and freshness alerts
                  </span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                    Get alerted when disparate platforms (e.g. Glassdoor vs AmbitionBox) disagree significantly or data passes freshness thresholds.
                  </span>
                </div>
              </label>

              {/* Email Research Digest */}
              <label className="flex items-start gap-3 p-3.5 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31] cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="accent-[#373D91] w-4 h-4 rounded mt-0.5"
                />
                <div className="text-[12px]">
                  <span className="text-[#14213D] dark:text-[#F8FAFC] font-semibold block">
                    Email research digest preference
                  </span>
                  <span className="text-[#64748B] dark:text-[#94A3B8] block mt-0.5">
                    Store preference to receive periodic digests of executive movements and score changes.
                  </span>
                </div>
              </label>
            </div>

            {/* Digest Frequency Dropdown */}
            <div className="pt-2 max-w-xs text-[13px]">
              <label htmlFor="settings-digest-freq" className="block text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1.5">
                Digest Frequency
              </label>
              <select
                id="settings-digest-freq"
                value={digestFreq}
                onChange={(e) => setDigestFreq(e.target.value)}
                disabled={isLoading || !emailDigest}
                className={`w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#131C31] border rounded-[6px] text-[#14213D] dark:text-[#F8FAFC] focus:outline-none transition-colors ${
                  !emailDigest ? 'opacity-50 cursor-not-allowed border-[#E2E8F0] dark:border-[#26324A]' : 'border-[#E2E8F0] dark:border-[#26324A] focus:border-[#373D91] dark:focus:border-[#818CF8]'
                }`}
              >
                <option value="Daily">Daily Summary</option>
                <option value="Weekly">Weekly Summary</option>
                <option value="Monthly">Monthly Roundup</option>
              </select>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Active only when email digest preference is enabled.
              </p>
            </div>

            {/* Channel Capabilities Note */}
            <div className="p-4 rounded-[6px] border border-[#E2E8F0] dark:border-[#26324A] bg-[#FAFBFD] dark:bg-[#131C31] text-[12px] space-y-1">
              <h4 className="font-bold text-[#14213D] dark:text-[#F8FAFC] flex items-center gap-1.5">
                <Bell size={14} className="text-[#373D91] dark:text-[#818CF8]" />
                Delivery Channels & Alert Dispatch
              </h4>
              <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                In-app watchlist alerts are active and rendered directly in your top navigation header and Alerts dashboard. External SMTP email delivery is simulated in development environments and dispatched via background workers in production clusters.
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Account Safety Disclaimer */}
      <div className="bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-5 space-y-1 text-[12px]">
        <h4 className="font-bold text-[#14213D] dark:text-[#F8FAFC]">Security & Privacy Integrity</h4>
        <p className="text-[#5A6A85] dark:text-[#94A3B8] leading-relaxed">
          CompanyIQ strictly isolates user preferences. Changing default location or work style does not alter real company registry records or external employee evidence.
        </p>
      </div>
    </div>
  );
};
