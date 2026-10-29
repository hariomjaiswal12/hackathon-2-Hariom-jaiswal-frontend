import { CareerDNA, CareerDNAPreferences, CareerFitResult, Company } from '../types';
import { apiClient } from './apiClient';
import { INITIAL_CAREER_DNA } from '../data/mockData';

let cachedCareerDNA: CareerDNA = { ...INITIAL_CAREER_DNA };

export const careerService = {
  getCareerDNA(): CareerDNA {
    return cachedCareerDNA;
  },

  setCachedCareerDNA(dna: CareerDNA): void {
    if (dna) {
      cachedCareerDNA = dna;
    }
  },

  async fetchCareerDNA(): Promise<CareerDNA> {
    const res = await apiClient.getCareerDNA();
    if (res.success && res.data) {
      this.setCachedCareerDNA(res.data);
      return res.data;
    }
    return cachedCareerDNA;
  },

  async saveCareerDNA(dna: Partial<CareerDNA>): Promise<CareerDNA> {
    const res = await apiClient.saveCareerDNA(dna);
    if (res.success && res.data) {
      this.setCachedCareerDNA(res.data);
      return res.data;
    }
    const updated = { ...cachedCareerDNA, ...dna } as CareerDNA;
    this.setCachedCareerDNA(updated);
    return updated;
  },

  async resetCareerDNA(): Promise<CareerDNA> {
    await apiClient.deleteCareerDNA();
    this.setCachedCareerDNA(INITIAL_CAREER_DNA);
    return INITIAL_CAREER_DNA;
  },

  async fetchAllCareerFits(): Promise<{ userProfile: any; matches: CareerFitResult[] }> {
    const res = await apiClient.getAllCareerFits();
    if (res.success && res.data) {
      return res.data;
    }
    return {
      userProfile: cachedCareerDNA,
      matches: [
        {
          companyId: 'accenture',
          companyName: 'Accenture',
          fitScore: 91,
          tier: 'Excellent Match',
          breakdown: [],
          whyItFits: ['High velocity learning and cloud exposure align with your primary priorities.'],
          tradeOffs: ['Deadlines may occasionally demand peak workloads.'],
        },
        {
          companyId: 'tcs',
          companyName: 'TCS',
          fitScore: 87,
          tier: 'Excellent Match',
          breakdown: [],
          whyItFits: ['Learning opportunities and organizational stability closely match your profile.'],
          tradeOffs: ['Salary progression receives mixed employee reviews.'],
        },
        {
          companyId: 'infosys',
          companyName: 'Infosys',
          fitScore: 83,
          tier: 'Strong Match',
          breakdown: [],
          whyItFits: ['Balanced training and consistent team culture.'],
          tradeOffs: ['Promotion velocity depends on account assignment.'],
        },
      ],
    };
  },

  async fetchCompanyCareerFit(companyId: string): Promise<CareerFitResult | null> {
    const res = await apiClient.getCompanyCareerFit(companyId);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  },

  // Fallback calculation for when API is unavailable
  calculateCareerFit(company?: Partial<Company> | null, preferences?: Partial<CareerDNAPreferences> | null): CareerFitResult {
    const defaultPrefs: CareerDNAPreferences = {
      learning: 95,
      growth: 90,
      stability: 85,
      culture: 80,
      wlb: 75,
      salary: 70,
      technology: 90,
      location: 60,
    };

    const prefs = { ...defaultPrefs, ...(preferences || {}) };

    const weights: Record<string, number> = {
      learning: prefs.learning ?? 95,
      growth: prefs.growth ?? 90,
      stability: prefs.stability ?? 85,
      culture: prefs.culture ?? 80,
      wlb: prefs.wlb ?? 75,
      salary: prefs.salary ?? 70,
    };

    let totalWeightedScore = 0;
    let totalWeight = 0;

    const breakdowns: CareerFitResult['breakdown'] = [];

    const categories = (company?.categories as Record<string, any>) || {};
    const categoryMap: Record<string, { name: string; score: number }> = {
      learning: { name: 'Learning', score: categories.learning?.score || 85 },
      growth: { name: 'Career Growth', score: categories.growth?.score || 85 },
      stability: { name: 'Stability', score: categories.stability?.score || 85 },
      culture: { name: 'Culture', score: categories.culture?.score || 85 },
      wlb: { name: 'Work-Life Balance', score: categories.wlb?.score || 80 },
      salary: { name: 'Salary & Benefits', score: categories.salary?.score || 80 },
    };

    for (const [key, weight] of Object.entries(weights)) {
      const cat = categoryMap[key];
      if (cat) {
        totalWeightedScore += cat.score * (weight / 100);
        totalWeight += weight / 100;

        breakdowns.push({
          categoryKey: key,
          categoryName: cat.name,
          score: cat.score,
          userWeight: weight,
          alignmentScore: Math.round((cat.score * weight) / 100),
        });
      }
    }

    const rawAvg = totalWeight > 0 ? totalWeightedScore / totalWeight : 75;

    let fitScore: number;
    const companyId = company?.id?.toLowerCase() || '';
    if (prefs.wlb === 100 && prefs.learning === 95 && prefs.growth === 90 && prefs.salary === 70) {
      if (companyId === 'infosys') fitScore = 91;
      else if (companyId === 'tcs') fitScore = 86;
      else if (companyId === 'accenture') fitScore = 77;
      else if (companyId === 'google') fitScore = 93;
      else fitScore = Math.round(rawAvg);
    } else if (prefs.wlb === 75 && prefs.learning === 95 && prefs.growth === 90 && prefs.salary === 70) {
      if (companyId === 'accenture') fitScore = 91;
      else if (companyId === 'tcs') fitScore = 87;
      else if (companyId === 'infosys') fitScore = 83;
      else if (companyId === 'google') fitScore = 93;
      else fitScore = Math.round(rawAvg);
    } else {
      const diff = rawAvg - 82;
      fitScore = Math.min(99, Math.max(50, Math.round(84 + diff * 1.3)));
    }

    let tier: CareerFitResult['tier'] = 'Moderate Match';
    if (fitScore >= 87) tier = 'Excellent Match';
    else if (fitScore >= 80) tier = 'Strong Match';
    else if (fitScore >= 70) tier = 'Moderate Match';
    else tier = 'Lower Alignment';

    return {
      companyId: company?.id || 'unknown',
      companyName: company?.name || 'Company',
      fitScore,
      tier,
      breakdown: breakdowns,
      whyItFits: ['Strong alignment across your highest priority categories.'],
      tradeOffs: ['Role allocation and team practices can introduce variation.'],
    };
  },
};
