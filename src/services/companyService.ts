import { Company, EvidenceDetail, ReviewAggregateData, SourceItem } from '../types';
import { apiClient } from './apiClient';
import { MOCK_COMPANIES, MOCK_EVIDENCE_LEARNING } from '../data/mockData';

// In-memory cache to support fast synchronous fallbacks when needed
let cachedCompanies: Company[] = [...MOCK_COMPANIES];

export const companyService = {
  // Sync fallback getter
  getCompanies(): Company[] {
    return cachedCompanies;
  },

  // Set internal cache from API
  setCachedCompanies(companies: Company[]): void {
    if (companies && companies.length > 0) {
      cachedCompanies = companies.map((incoming) => {
        const existing = cachedCompanies.find((c) => c.id?.toLowerCase() === incoming.id?.toLowerCase());
        return existing ? { ...existing, ...incoming } : incoming;
      });
    }
  },

  // Async API fetcher
  async fetchCompanies(params: Record<string, string | number> = {}): Promise<{ companies: Company[]; pagination: any }> {
    const res = await apiClient.getCompanies(params);
    if (res.success && res.data?.companies) {
      this.setCachedCompanies(res.data.companies);
      return res.data;
    }
    return { companies: cachedCompanies, pagination: { total: cachedCompanies.length, page: 1, pages: 1, limit: 20 } };
  },

  // Sync lookup with fallback
  getCompanyById(id: string): Company | undefined {
    return cachedCompanies.find((c) => c.id?.toLowerCase() === id?.toLowerCase());
  },

  // Async fetch single company from API
  async fetchCompanyById(id: string): Promise<Company | undefined> {
    const res = await apiClient.getCompany(id);
    if (res.success && res.data) {
      // Update cache
      const existingIdx = cachedCompanies.findIndex((c) => c.id === res.data.id);
      if (existingIdx >= 0) {
        cachedCompanies[existingIdx] = res.data;
      } else {
        cachedCompanies.push(res.data);
      }
      return res.data;
    }
    return this.getCompanyById(id);
  },

  // Search companies via API
  async searchCompanies(query: string, filters?: {
    industry?: string;
    location?: string;
    minScore?: number;
    minGrowth?: number;
    minWlb?: number;
    confidenceLevel?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ companies: Company[]; pagination: any }> {
    const params: Record<string, string | number> = {};
    if (query) params.search = query;
    if (filters?.industry && filters.industry !== 'all') params.industry = filters.industry;
    if (filters?.location && filters.location !== 'all') params.location = filters.location;
    if (filters?.minScore) params.minScore = filters.minScore;
    if (filters?.minGrowth) params.minGrowth = filters.minGrowth;
    if (filters?.minWlb) params.minWlb = filters.minWlb;
    if (filters?.confidenceLevel && filters.confidenceLevel !== 'all') params.confidenceLevel = filters.confidenceLevel;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.page) params.page = filters.page;
    if (filters?.limit) params.limit = filters.limit;

    return this.fetchCompanies(params);
  },

  // Evidence
  async fetchEvidenceDetail(companyId: string, categoryKey: string = 'learning'): Promise<EvidenceDetail> {
    const res = await apiClient.getEvidence(companyId, categoryKey);
    if (res.success && res.data) {
      return res.data;
    }
    return this.getEvidenceDetail(companyId, categoryKey);
  },

  getEvidenceDetail(companyId: string, categoryKey: string): EvidenceDetail {
    if (companyId === 'tcs' && categoryKey === 'learning') {
      return MOCK_EVIDENCE_LEARNING;
    }
    const company = this.getCompanyById(companyId) || cachedCompanies[0];
    const cat = company.categories?.[categoryKey] || company.categories?.learning || {
      score: 80,
      summary: 'Broad employee feedback pattern.',
      evidenceCount: 60,
      confidence: { level: 'high', label: 'High confidence' },
    };

    return {
      id: `ev-${companyId}-${categoryKey}`,
      companyId: company.id,
      categoryKey,
      claim: `Available employee feedback provides structured signals on ${categoryKey}.`,
      reviewsAnalyzed: company.reviewCount || 120,
      relevantMentions: cat.evidenceCount || 60,
      sentimentBreakdown: {
        positive: Math.round((cat.evidenceCount || 60) * 0.72),
        neutral: Math.round((cat.evidenceCount || 60) * 0.18),
        negative: Math.round((cat.evidenceCount || 60) * 0.1),
      },
      sources: [
        { name: 'Sample Source A', reviewCount: 52, date: 'Oct 16, 2026', verified: true, statusText: 'Verified' },
        { name: 'Sample Source B', reviewCount: 44, date: 'Oct 14, 2026', verified: true, statusText: 'Verified' },
        { name: 'Sample Source C', reviewCount: 31, date: 'Oct 12, 2026', verified: false, statusText: 'Mixed' },
      ],
      confidence: cat.confidence || { level: 'high', label: 'High confidence' },
      limitations: [
        `Category scope: ${cat.summary || 'Illustrative sample'}`,
        'Sample boundary: Specific team allocation may vary from overall company signal.',
      ],
      contextNote: 'These findings represent synthesized review samples and not absolute corporate warranties.',
      userPreferenceNote: 'Reflects company intelligence independent of personal Career DNA weighting.',
    };
  },

  // Sources
  async fetchSources(companyId: string): Promise<SourceItem[]> {
    const res = await apiClient.getSources(companyId);
    if (res.success && res.data) {
      return res.data;
    }
    return [];
  },

  // Review Insights
  async fetchReviewInsights(companyId: string): Promise<ReviewAggregateData | null> {
    const res = await apiClient.getReviewInsights(companyId);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  },

  // Saved companies
  async fetchSavedCompanies(): Promise<Company[]> {
    const res = await apiClient.getSavedCompanies();
    if (res.success && res.data) {
      return res.data;
    }
    return [];
  },

  async saveCompany(id: string): Promise<boolean> {
    const res = await apiClient.saveCompany(id);
    return res.success;
  },

  async unsaveCompany(id: string): Promise<boolean> {
    const res = await apiClient.unsaveCompany(id);
    return res.success;
  },

  async getSuggestions(query: string, limit: number = 6) {
    const res = await apiClient.getCompanySuggestions(query, limit);
    return res.success && res.data?.suggestions ? res.data.suggestions : [];
  },

  async submitCompany(data: any) {
    return apiClient.submitCompany(data);
  },

  async getSubmissions(params: Record<string, string | number> = {}) {
    return apiClient.getCompanySubmissions(params);
  },

  async verifySubmission(id: string, decision: { status: 'approved' | 'rejected'; notes?: string }) {
    return apiClient.verifyCompanySubmission(id, decision);
  },
};
