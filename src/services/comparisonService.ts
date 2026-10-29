import { ComparisonResult, ComparisonScenario, WhatIfResult } from '../types';
import { apiClient } from './apiClient';
import { MOCK_COMPARISON_SCENARIOS } from '../data/mockData';

let cachedScenarios: ComparisonScenario[] = [...MOCK_COMPARISON_SCENARIOS];

export const comparisonService = {
  getSavedScenarios(): ComparisonScenario[] {
    return cachedScenarios;
  },

  setCachedScenarios(scenarios: ComparisonScenario[]): void {
    if (scenarios) {
      cachedScenarios = scenarios;
    }
  },

  async fetchSavedScenarios(): Promise<ComparisonScenario[]> {
    const res = await apiClient.getSavedComparisons();
    if (res.success && res.data) {
      this.setCachedScenarios(res.data);
      return res.data;
    }
    return cachedScenarios;
  },

  async calculateComparison(companyIds: string[], priorities?: any): Promise<ComparisonResult | null> {
    const res = await apiClient.calculateComparison(companyIds, priorities);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  },

  async saveScenario(scenario: any): Promise<ComparisonScenario | null> {
    const res = await apiClient.saveComparison(scenario);
    if (res.success && res.data) {
      const updated = [res.data, ...cachedScenarios.filter((s) => s.id !== res.data.id)];
      this.setCachedScenarios(updated);
      return res.data;
    }
    const fallback = {
      ...scenario,
      id: scenario.id || `scen-${Date.now()}`,
      createdAt: 'Just now',
    };
    this.setCachedScenarios([fallback, ...cachedScenarios]);
    return fallback;
  },

  async removeScenario(id: string): Promise<boolean> {
    const res = await apiClient.deleteComparison(id);
    const updated = cachedScenarios.filter((s) => s.id !== id);
    this.setCachedScenarios(updated);
    return res.success;
  },

  async calculateWhatIf(priorities: any, companyIds?: string[]): Promise<WhatIfResult | null> {
    const res = await apiClient.calculateWhatIf(priorities, companyIds);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  },
};
