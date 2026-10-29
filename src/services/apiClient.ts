/**
 * API Client for CompanyIQ Backend.
 * VITE_API_URL is the full API base, including /api/v1.
 * Local development falls back to the local API only. Production builds do not.
 */

import {
  AuthData,
  CareerDNA,
  CareerFitResult,
  CareersSummary,
  Company,
  ComparisonResult,
  ComparisonScenario,
  DashboardData,
  EvidenceDetail,
  JobFilterParams,
  JobPosting,
  ResearchHistoryItem,
  ReviewAggregateData,
  SettingsData,
  SourceItem,
  User,
  WatchlistAlert,
  WhatIfResult,
} from '../types';

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, '');
  if (configured) return configured;
  if (import.meta.env.DEV) return 'http://localhost:5000/api/v1';
  return '';
}

const API_BASE_URL = resolveApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

class ApiClient {
  private token: string | null = null;
  private refreshTokenVal: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('companyiq_auth_token');
      this.refreshTokenVal = localStorage.getItem('companyiq_refresh_token');
    }
  }

  setToken(token: string, refreshToken?: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('companyiq_auth_token', token);
      if (refreshToken) {
        this.refreshTokenVal = refreshToken;
        localStorage.setItem('companyiq_refresh_token', refreshToken);
      }
    }
  }

  clearToken() {
    this.token = null;
    this.refreshTokenVal = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('companyiq_auth_token');
      localStorage.removeItem('companyiq_refresh_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getRefreshToken(): string | null {
    return this.refreshTokenVal;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (!API_BASE_URL) {
      return {
        success: false,
        data: null as T,
        error: {
          code: 'API_URL_MISSING',
          message: 'VITE_API_URL is not configured for this build.',
        },
      };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      let response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized with token refresh
      if (response.status === 401 && this.refreshTokenVal && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: this.refreshTokenVal }),
            });
            const refreshData = await refreshRes.json();
            if (refreshData.success && refreshData.data?.accessToken) {
              this.setToken(refreshData.data.accessToken, refreshData.data.refreshToken);
              this.isRefreshing = false;
              this.onRefreshed(refreshData.data.accessToken);

              // Retry original request with new token
              headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
              response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
              });
            } else {
              this.isRefreshing = false;
              this.clearToken();
            }
          } catch {
            this.isRefreshing = false;
            this.clearToken();
          }
        } else {
          // Wait for active refresh
          const retryPromise = new Promise<ApiResponse<T>>((resolve) => {
            this.addRefreshSubscriber(async (newToken) => {
              headers['Authorization'] = `Bearer ${newToken}`;
              const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
              });
              const json = await retryRes.json();
              resolve(json);
            });
          });
          return await retryPromise;
        }
      }

      const json = await response.json();
      return json;
    } catch (err: any) {
      const raw = typeof err?.message === 'string' ? err.message : '';
      const unreachable = raw === 'Failed to fetch' || raw.includes('NetworkError') || raw.includes('Load failed');
      return {
        success: false,
        data: null as any,
        error: {
          code: 'NETWORK_ERROR',
          message: unreachable
            ? 'Unable to reach the CompanyIQ API. Please try again shortly.'
            : raw || 'Failed to connect to CompanyIQ backend API',
        },
      };
    }
  }

  // Generic HTTP helpers
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // --- 1. Authentication ---
  async login(email: string, password: string): Promise<ApiResponse<AuthData>> {
    const res = await this.post<AuthData>('/auth/login', { email, password });
    if (res.success && res.data?.tokens?.accessToken) {
      this.setToken(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res;
  }

  async loginDemo(): Promise<ApiResponse<AuthData>> {
    const res = await this.post<AuthData>('/auth/demo');
    if (res.success && res.data?.tokens?.accessToken) {
      this.setToken(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res;
  }

  async loginWithGoogle(credential: string): Promise<ApiResponse<AuthData>> {
    const res = await this.post<AuthData>('/auth/google', { credential });
    if (res.success && res.data?.tokens?.accessToken) {
      this.setToken(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res;
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string; resetToken?: string }>> {
    return this.post<{ message: string; resetToken?: string }>('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<{ message: string }>> {
    return this.post<{ message: string }>('/auth/reset-password', { token, password });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    careerStage?: string;
    targetRole?: string;
    defaultLocation?: string;
    preferredWorkStyle?: string;
  }): Promise<ApiResponse<AuthData>> {
    const res = await this.post<AuthData>('/auth/register', userData);
    if (res.success && res.data?.tokens?.accessToken) {
      this.setToken(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res;
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.get<User>('/auth/me');
  }

  async refresh(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    if (!this.refreshTokenVal) {
      return { success: false, data: null as any, error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token' } };
    }
    const res = await this.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken: this.refreshTokenVal,
    });
    if (res.success && res.data?.accessToken) {
      this.setToken(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  }

  async logout(): Promise<ApiResponse<null>> {
    const res = await this.post<null>('/auth/logout', { refreshToken: this.refreshTokenVal });
    this.clearToken();
    return res;
  }

  // --- 2. Dashboard ---
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.get<DashboardData>('/dashboard');
  }

  // --- 3. Companies ---
  async getCompanies(params: Record<string, string | number> = {}): Promise<ApiResponse<{ companies: Company[]; pagination: any }>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.get<{ companies: Company[]; pagination: any }>(`/companies${qs}`);
  }

  async getCompany(idOrSlug: string): Promise<ApiResponse<Company>> {
    return this.get<Company>(`/companies/${idOrSlug}`);
  }

  async getCompanySuggestions(q: string, limit: number = 6): Promise<ApiResponse<{ suggestions: any[] }>> {
    return this.get<{ suggestions: any[] }>(`/companies/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`);
  }

  async submitCompany(data: any): Promise<ApiResponse<any>> {
    return this.post<any>('/companies/submit', data);
  }

  async getCompanySubmissions(params: Record<string, string | number> = {}): Promise<ApiResponse<{ submissions: any[]; pagination: any }>> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.get<{ submissions: any[]; pagination: any }>(`/companies/admin/submissions${qs}`);
  }

  async verifyCompanySubmission(id: string, decision: { status: 'approved' | 'rejected'; notes?: string }): Promise<ApiResponse<any>> {
    return this.patch<any>(`/companies/admin/submissions/${id}/verify`, decision);
  }

  async getEvidence(companyId: string, categoryKey: string = 'learning'): Promise<ApiResponse<EvidenceDetail>> {
    return this.get<EvidenceDetail>(`/companies/${companyId}/evidence?categoryKey=${encodeURIComponent(categoryKey)}`);
  }

  async getSources(companyId: string): Promise<ApiResponse<SourceItem[]>> {
    return this.get<SourceItem[]>(`/companies/${companyId}/sources`);
  }

  async getReviewInsights(companyId: string): Promise<ApiResponse<ReviewAggregateData>> {
    return this.get<ReviewAggregateData>(`/companies/${companyId}/review-insights`);
  }

  // --- 4. Career DNA ---
  async getCareerDNA(): Promise<ApiResponse<CareerDNA>> {
    return this.get<CareerDNA>('/career-dna');
  }

  async saveCareerDNA(dna: Partial<CareerDNA>): Promise<ApiResponse<CareerDNA>> {
    return this.put<CareerDNA>('/career-dna', dna);
  }

  async deleteCareerDNA(): Promise<ApiResponse<null>> {
    return this.delete<null>('/career-dna');
  }

  // --- 5. Career Fit ---
  async getAllCareerFits(): Promise<ApiResponse<{ userProfile: any; matches: CareerFitResult[] }>> {
    return this.get<{ userProfile: any; matches: CareerFitResult[] }>('/career-fit');
  }

  async getCompanyCareerFit(companyId: string, params?: { role?: string; experience?: string }): Promise<ApiResponse<CareerFitResult>> {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.get<CareerFitResult>(`/career-fit/${companyId}${qs}`);
  }

  // --- 6. What-If Simulator ---
  async calculateWhatIf(priorities: any, companyIds?: string[]): Promise<ApiResponse<WhatIfResult>> {
    return this.post<WhatIfResult>('/scenarios/calculate', { priorities, companyIds });
  }

  async getScenarios(): Promise<ApiResponse<ComparisonScenario[]>> {
    return this.get<ComparisonScenario[]>('/scenarios');
  }

  async saveScenario(scenarioData: any): Promise<ApiResponse<ComparisonScenario>> {
    return this.post<ComparisonScenario>('/scenarios/save', scenarioData);
  }

  async deleteScenario(id: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`/scenarios/${id}`);
  }

  // --- 7. Company Comparisons ---
  async calculateComparison(companyIds: string[], priorities?: any): Promise<ApiResponse<ComparisonResult>> {
    return this.post<ComparisonResult>('/comparisons/calculate', { companyIds, priorities });
  }

  async getSavedComparisons(): Promise<ApiResponse<ComparisonScenario[]>> {
    return this.get<ComparisonScenario[]>('/comparisons');
  }

  async getComparisonById(id: string): Promise<ApiResponse<ComparisonScenario>> {
    return this.get<ComparisonScenario>(`/comparisons/${id}`);
  }

  async saveComparison(scenarioData: any): Promise<ApiResponse<ComparisonScenario>> {
    return this.post<ComparisonScenario>('/comparisons', scenarioData);
  }

  async deleteComparison(id: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`/comparisons/${id}`);
  }

  // --- 8. Saved Companies ---
  async getSavedCompanies(): Promise<ApiResponse<Company[]>> {
    return this.get<Company[]>('/saved-companies');
  }

  async saveCompany(companyId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/saved-companies/${companyId}`);
  }

  async unsaveCompany(companyId: string): Promise<ApiResponse<any>> {
    return this.delete<any>(`/saved-companies/${companyId}`);
  }

  // --- 9. Research History ---
  async getHistory(type: string = 'all'): Promise<ApiResponse<ResearchHistoryItem[]>> {
    return this.get<ResearchHistoryItem[]>(`/history?type=${encodeURIComponent(type)}`);
  }

  async addHistory(item: Partial<ResearchHistoryItem>): Promise<ApiResponse<ResearchHistoryItem>> {
    return this.post<ResearchHistoryItem>('/history', item);
  }

  async clearHistory(): Promise<ApiResponse<null>> {
    return this.delete<null>('/history');
  }

  // --- 10. AI Q&A ---
  async getAIStatus(): Promise<ApiResponse<{ provider: string; configured: boolean; model: string; status: string; errorReason?: string; message: string }>> {
    return this.get<{ provider: string; configured: boolean; model: string; status: string; errorReason?: string; message: string }>('/ai/status');
  }

  async askAI(question: string, companyId?: string, threadId?: string): Promise<ApiResponse<any>> {
    return this.post<any>('/ai/ask', { question, companyId, threadId });
  }

  async getAIThreads(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>('/ai/threads');
  }

  async getAIThreadById(id: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/ai/threads/${id}`);
  }

  // --- 11. Alerts ---
  async getAlerts(): Promise<ApiResponse<WatchlistAlert[]>> {
    return this.get<WatchlistAlert[]>('/alerts');
  }

  async markAlertRead(id: string): Promise<ApiResponse<any>> {
    return this.patch<any>(`/alerts/${id}/read`);
  }

  // --- 12. Watchlist ---
  async getWatchlist(): Promise<ApiResponse<Company[]>> {
    return this.get<Company[]>('/watchlist');
  }

  async addToWatchlist(companyId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/watchlist/${companyId}`);
  }

  async removeFromWatchlist(companyId: string): Promise<ApiResponse<any>> {
    return this.delete<any>(`/watchlist/${companyId}`);
  }

  // --- 13. Settings ---
  async getSettings(): Promise<ApiResponse<SettingsData>> {
    return this.get<SettingsData>('/settings');
  }

  async updateSettings(data: Partial<SettingsData>): Promise<ApiResponse<SettingsData>> {
    return this.put<SettingsData>('/settings', data);
  }

  async clearSettingsHistory(): Promise<ApiResponse<null>> {
    return this.delete<null>('/settings/history');
  }

  async resetSettingsCareerDNA(): Promise<ApiResponse<null>> {
    return this.delete<null>('/settings/career-dna');
  }

  async exportUserData(): Promise<ApiResponse<any>> {
    return this.get<any>('/settings/export');
  }

  async clearSavedCompaniesList(): Promise<ApiResponse<null>> {
    return this.delete<null>('/settings/saved-companies');
  }

  // --- 14. Real-Time Verified Careers & Job Discovery ---
  async getCompanyJobs(
    companyIdOrSlug: string,
    params: JobFilterParams = {}
  ): Promise<ApiResponse<{
    jobs: JobPosting[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
    summary: CareersSummary;
    filterOptions: {
      departments: string[];
      workArrangements: string[];
      employmentTypes: string[];
    };
  }>> {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.workArrangement) query.append('workArrangement', params.workArrangement);
    if (params.employmentType) query.append('employmentType', params.employmentType);
    if (params.department) query.append('department', params.department);
    if (params.dateRange) query.append('dateRange', params.dateRange);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.get(`/companies/${companyIdOrSlug}/jobs${qs}`);
  }

  async getCompanyCareers(companyIdOrSlug: string): Promise<ApiResponse<CareersSummary>> {
    return this.get<CareersSummary>(`/companies/${companyIdOrSlug}/careers`);
  }

  async refreshCompanyJobs(
    companyIdOrSlug: string,
    force = false
  ): Promise<ApiResponse<{
    refreshed: boolean;
    rateLimited: boolean;
    message?: string;
    summary: CareersSummary;
  }>> {
    return this.post(`/companies/${companyIdOrSlug}/jobs/refresh${force ? '?force=true' : ''}`);
  }

  async getJobById(jobId: string): Promise<ApiResponse<JobPosting>> {
    return this.get<JobPosting>(`/jobs/${jobId}`);
  }
}

export const apiClient = new ApiClient();
