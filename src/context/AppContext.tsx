import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CareerDNA,
  Company,
  ComparisonScenario,
  ResearchHistoryItem,
  User,
  WatchlistAlert,
} from '../types';
import { apiClient } from '../services/apiClient';
import { careerService } from '../services/careerService';
import { companyService } from '../services/companyService';
import { comparisonService } from '../services/comparisonService';
import { historyService } from '../services/historyService';
import { sourceService } from '../services/sourceService';
import { INITIAL_CAREER_DNA, MOCK_COMPANIES } from '../data/mockData';

interface AppContextType {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  isLoadingAuth: boolean;
  loadAppData: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => Promise<{ success: boolean; error?: string }>;
  loginGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalInitialError: string | null;
  openAuthModal: (error?: string | any) => void;
  closeAuthModal: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  reloadUserData: () => Promise<void>;

  // Career DNA
  careerDNA: CareerDNA;
  updateCareerDNA: (dna: CareerDNA) => Promise<void>;
  resetCareerDNA: () => Promise<void>;
  reloadCareerDNA: () => Promise<void>;

  // Companies
  companies: Company[];
  refreshCompanies: () => Promise<void>;
  savedCompanyIds: string[];
  toggleSaveCompany: (id: string) => Promise<{ success: boolean; isSaved: boolean; requiresAuth?: boolean }>;
  clearAllSavedCompanies: () => Promise<void>;
  isCompanySaved: (id: string) => boolean;

  // Comparisons
  comparisonCompanies: string[]; // 2 or 3 company ids
  setComparisonCompanies: (ids: string[]) => void;
  addCompanyToComparison: (id: string) => void;
  removeCompanyFromComparison: (id: string) => void;
  replaceCompanyInComparison: (oldId: string, newId: string) => void;
  clearComparisonCompanies: () => void;
  savedScenarios: ComparisonScenario[];
  saveScenario: (scenario: any) => Promise<void>;
  removeScenario: (id: string) => Promise<void>;

  // Research History
  history: ResearchHistoryItem[];
  addHistoryItem: (item: Partial<ResearchHistoryItem>) => Promise<void>;
  clearHistory: () => Promise<void>;

  // Alerts
  alerts: WatchlistAlert[];
  refreshAlerts: () => Promise<void>;

  // Global search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Modals & Drawers
  evidenceDrawer: {
    isOpen: boolean;
    companyId: string;
    categoryKey: string;
  };
  openEvidenceDrawer: (companyId: string, categoryKey?: string) => void;
  closeEvidenceDrawer: () => void;

  scoreModalOpen: boolean;
  openScoreModal: () => void;
  closeScoreModal: () => void;

  contextualAI: {
    isOpen: boolean;
    companyId: string;
  };
  openContextualAI: (companyId: string) => void;
  closeContextualAI: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // Sidebar
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialError, setAuthModalInitialError] = useState<string | null>(null);

  // App data state
  const [careerDNA, setCareerDNAState] = useState<CareerDNA>(INITIAL_CAREER_DNA);
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [savedCompanyIds, setSavedCompanyIds] = useState<string[]>([]);
  const [comparisonCompanies, setComparisonCompanies] = useState<string[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<ComparisonScenario[]>([]);
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);
  const [alerts, setAlerts] = useState<WatchlistAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Theme state
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('companyiq-theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('companyiq-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
  };

  // Modals state
  const [evidenceDrawer, setEvidenceDrawer] = useState<{
    isOpen: boolean;
    companyId: string;
    categoryKey: string;
  }>({
    isOpen: false,
    companyId: 'tcs',
    categoryKey: 'learning',
  });

  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [contextualAI, setContextualAI] = useState<{
    isOpen: boolean;
    companyId: string;
  }>({
    isOpen: false,
    companyId: 'tcs',
  });

  // Centralized data hydrator
  const loadAppData = useCallback(async () => {
    try {
      // 1. Fetch Companies (hydrate full dataset for selectors)
      const compRes = await apiClient.getCompanies({ limit: 100 });
      if (compRes.success && compRes.data?.companies) {
        setCompanies(compRes.data.companies);
        companyService.setCachedCompanies(compRes.data.companies);
      }

      // 2. Fetch Career DNA (if authenticated)
      if (apiClient.isAuthenticated()) {
        const dnaRes = await apiClient.getCareerDNA();
        if (dnaRes.success && dnaRes.data) {
          setCareerDNAState(dnaRes.data);
          careerService.setCachedCareerDNA(dnaRes.data);
        }

        // 3. Fetch Saved Companies
        const savedRes = await apiClient.getSavedCompanies();
        if (savedRes.success && Array.isArray(savedRes.data)) {
          const ids = savedRes.data.map((c: any) => c.slug || c.id || c._id);
          setSavedCompanyIds(ids);
        }

        // 4. Fetch Comparisons
        const scenRes = await apiClient.getSavedComparisons();
        if (scenRes.success && Array.isArray(scenRes.data)) {
          setSavedScenarios(scenRes.data);
          comparisonService.setCachedScenarios(scenRes.data);
        }

        // 5. Fetch Research History
        const histRes = await apiClient.getHistory();
        if (histRes.success && Array.isArray(histRes.data)) {
          setHistory(histRes.data);
          historyService.setCachedHistory(histRes.data);
        }
      }

      // 6. Fetch Alerts (public/optionalAuth)
      const alertsRes = await apiClient.getAlerts();
      if (alertsRes.success && Array.isArray(alertsRes.data)) {
        setAlerts(alertsRes.data);
        sourceService.setCachedAlerts(alertsRes.data);
      }
    } catch (err) {
      console.warn('Data hydration notice:', err);
    }
  }, []);

  // Initialize auth session
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      setIsLoadingAuth(true);
      const token = apiClient.getToken();
      if (token) {
        const meRes = await apiClient.getMe();
        if (meRes.success && meRes.data) {
          if (isMounted) {
            setUser(meRes.data);
            setIsAuthenticated(true);
          }
        } else {
          // Token expired or invalid, try refresh or clear
          const refRes = await apiClient.refresh();
          if (refRes.success) {
            const meRes2 = await apiClient.getMe();
            if (meRes2.success && meRes2.data) {
              if (isMounted) {
                setUser(meRes2.data);
                setIsAuthenticated(true);
              }
            } else {
              apiClient.clearToken();
              if (isMounted) {
                setUser(null);
                setIsAuthenticated(false);
              }
            }
          } else {
            apiClient.clearToken();
            if (isMounted) {
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }

      if (isMounted) {
        await loadAppData();
        setIsLoadingAuth(false);
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, [loadAppData]);

  // Auth actions
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.login(email, pass);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        await loadAppData();
        return { success: true };
      }
      const errMsg = res.error ? (typeof res.error === 'string' ? res.error : res.error.message) : 'Invalid email or password';
      return { success: false, error: errMsg };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to server' };
    }
  };

  const loginDemo = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.loginDemo();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        await loadAppData();
        return { success: true };
      }
      const errMsg = res.error ? (typeof res.error === 'string' ? res.error : res.error.message) : 'Failed to initialize demo session';
      return { success: false, error: errMsg };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to server' };
    }
  };

  const loginGoogle = async (credential: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.loginWithGoogle(credential);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        await loadAppData();
        return { success: true };
      }
      const errMsg = res.error
        ? typeof res.error === 'string'
          ? res.error
          : res.error.message
        : 'Google authentication failed';
      return { success: false, error: errMsg };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to server' };
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.register(userData);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        await loadAppData();
        return { success: true };
      }
      const errMsg = res.error ? (typeof res.error === 'string' ? res.error : res.error.message) : 'Registration failed';
      return { success: false, error: errMsg };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unable to connect to server' };
    }
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
    setIsAuthenticated(false);
    // Reset to defaults
    setCareerDNAState(INITIAL_CAREER_DNA);
    setSavedCompanyIds([]);
    setSavedScenarios([]);
    setHistory([]);
  };

  const openAuthModal = (errorOrEvent?: string | any) => {
    const err = typeof errorOrEvent === 'string' ? errorOrEvent : null;
    setAuthModalInitialError(err);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalInitialError(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  const reloadUserData = async () => {
    if (apiClient.isAuthenticated()) {
      const res = await apiClient.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        setIsAuthenticated(true);
      }
      await loadAppData();
    }
  };

  // Career DNA actions
  const updateCareerDNA = async (dna: CareerDNA) => {
    setCareerDNAState(dna);
    careerService.setCachedCareerDNA(dna);
    if (apiClient.isAuthenticated()) {
      await apiClient.saveCareerDNA(dna);
    }
  };

  const resetCareerDNA = async () => {
    setCareerDNAState(INITIAL_CAREER_DNA);
    careerService.setCachedCareerDNA(INITIAL_CAREER_DNA);
    if (apiClient.isAuthenticated()) {
      await apiClient.deleteCareerDNA();
    }
  };

  const reloadCareerDNA = async () => {
    if (apiClient.isAuthenticated()) {
      const res = await apiClient.getCareerDNA();
      if (res.success && res.data) {
        setCareerDNAState(res.data);
        careerService.setCachedCareerDNA(res.data);
      }
    }
  };

  // Company and Saved actions
  const refreshCompanies = async () => {
    const res = await apiClient.getCompanies({ limit: 100 });
    if (res.success && res.data?.companies) {
      setCompanies(res.data.companies);
      companyService.setCachedCompanies(res.data.companies);
    }
  };

  const toggleSaveCompany = async (id: string): Promise<{ success: boolean; isSaved: boolean; requiresAuth?: boolean }> => {
    if (!id) return { success: false, isSaved: false };
    const normId = id.toLowerCase().trim();

    if (!apiClient.isAuthenticated()) {
      openAuthModal('Please sign in to save companies to your research portfolio.');
      return { success: false, isSaved: false, requiresAuth: true };
    }

    const currentlySaved = isCompanySaved(normId);

    if (currentlySaved) {
      setSavedCompanyIds((prev) => prev.filter((c) => c.toLowerCase() !== normId));
      try {
        const res = await apiClient.unsaveCompany(normId);
        if (res.success) {
          return { success: true, isSaved: false };
        } else {
          setSavedCompanyIds((prev) => [...prev, normId]);
          return { success: false, isSaved: true };
        }
      } catch {
        setSavedCompanyIds((prev) => [...prev, normId]);
        return { success: false, isSaved: true };
      }
    } else {
      setSavedCompanyIds((prev) => [...prev, normId]);
      try {
        const res = await apiClient.saveCompany(normId);
        if (res.success) {
          return { success: true, isSaved: true };
        } else {
          setSavedCompanyIds((prev) => prev.filter((c) => c.toLowerCase() !== normId));
          return { success: false, isSaved: false };
        }
      } catch {
        setSavedCompanyIds((prev) => prev.filter((c) => c.toLowerCase() !== normId));
        return { success: false, isSaved: false };
      }
    }
  };

  const clearAllSavedCompanies = async () => {
    if (apiClient.isAuthenticated()) {
      await apiClient.clearSavedCompaniesList();
    }
    setSavedCompanyIds([]);
  };

  const isCompanySaved = (id: string) => {
    if (!id) return false;
    const norm = id.toLowerCase().trim();
    return savedCompanyIds.some((s) => s.toLowerCase() === norm);
  };

  // Comparison actions
  const addCompanyToComparison = (id: string) => {
    if (!id) return;
    const normalized = id.toLowerCase().trim();
    setComparisonCompanies((prev) => {
      if (prev.some((c) => c.toLowerCase() === normalized) || prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const removeCompanyFromComparison = (id: string) => {
    const normalized = id.toLowerCase().trim();
    setComparisonCompanies((prev) => prev.filter((c) => c.toLowerCase() !== normalized));
  };

  const replaceCompanyInComparison = (oldId: string, newId: string) => {
    if (!newId) return;
    const oldNorm = oldId.toLowerCase().trim();
    const newNorm = newId.toLowerCase().trim();
    setComparisonCompanies((prev) =>
      prev.map((c) => (c.toLowerCase() === oldNorm ? newId : c))
    );
  };

  const clearComparisonCompanies = () => {
    setComparisonCompanies([]);
  };

  const handleSaveScenario = async (scenario: any) => {
    const saved = await comparisonService.saveScenario(scenario);
    if (saved) {
      setSavedScenarios((prev) => [saved, ...prev.filter((s) => s.id !== saved.id)]);
    }
  };

  const handleRemoveScenario = async (id: string) => {
    await comparisonService.removeScenario(id);
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  // History actions
  const addHistoryItem = async (item: Partial<ResearchHistoryItem>) => {
    const created = await historyService.addHistory(item);
    if (created) {
      setHistory((prev) => [created, ...prev.filter((h) => h.id !== created.id)]);
    }
  };

  const clearHistory = async () => {
    await historyService.clearHistory();
    setHistory([]);
  };

  const refreshAlerts = async () => {
    const res = await apiClient.getAlerts();
    if (res.success && res.data) {
      setAlerts(res.data);
    }
  };

  // Drawer / Modals
  const openEvidenceDrawer = (companyId: string, categoryKey: string = 'learning') => {
    setEvidenceDrawer({
      isOpen: true,
      companyId,
      categoryKey,
    });
    addHistoryItem({
      activity: 'Evidence viewed',
      type: 'Evidence',
      context: `${companyId.toUpperCase()} · ${categoryKey}`,
    });
  };

  const closeEvidenceDrawer = () => {
    setEvidenceDrawer((prev) => ({ ...prev, isOpen: false }));
  };

  const openScoreModal = () => setScoreModalOpen(true);
  const closeScoreModal = () => setScoreModalOpen(false);

  const openContextualAI = (companyId: string) => {
    setContextualAI({
      isOpen: true,
      companyId,
    });
  };

  const closeContextualAI = () => {
    setContextualAI((prev) => ({ ...prev, isOpen: false }));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        isLoadingAuth,
        loadAppData,
        login,
        loginDemo,
        loginGoogle,
        register,
        logout,
        isAuthModalOpen,
        authModalInitialError,
        openAuthModal,
        closeAuthModal,
        updateUser,
        reloadUserData,
        careerDNA,
        updateCareerDNA,
        resetCareerDNA,
        reloadCareerDNA,
        companies,
        refreshCompanies,
        savedCompanyIds,
        toggleSaveCompany,
        clearAllSavedCompanies,
        isCompanySaved,
        comparisonCompanies,
        setComparisonCompanies,
        addCompanyToComparison,
        removeCompanyFromComparison,
        replaceCompanyInComparison,
        clearComparisonCompanies,
        savedScenarios,
        saveScenario: handleSaveScenario,
        removeScenario: handleRemoveScenario,
        history,
        addHistoryItem,
        clearHistory,
        alerts,
        refreshAlerts,
        searchQuery,
        setSearchQuery,
        evidenceDrawer,
        openEvidenceDrawer,
        closeEvidenceDrawer,
        scoreModalOpen,
        openScoreModal,
        closeScoreModal,
        contextualAI,
        openContextualAI,
        closeContextualAI,
        theme,
        toggleTheme,
        setTheme,
        isSidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
