import { SourceItem, WatchlistAlert } from '../types';
import { apiClient } from './apiClient';
import { MOCK_SOURCES, MOCK_WATCHLIST_ALERTS } from '../data/mockData';

let cachedSources: SourceItem[] = [...MOCK_SOURCES];
let cachedAlerts: WatchlistAlert[] = [...MOCK_WATCHLIST_ALERTS];

export const sourceService = {
  getSources(): SourceItem[] {
    return cachedSources;
  },

  getAlerts(): WatchlistAlert[] {
    return cachedAlerts;
  },

  setCachedSources(sources: SourceItem[]): void {
    if (sources) cachedSources = sources;
  },

  setCachedAlerts(alerts: WatchlistAlert[]): void {
    if (alerts) cachedAlerts = alerts;
  },

  async fetchSources(companyId: string = 'tcs'): Promise<SourceItem[]> {
    const res = await apiClient.getSources(companyId);
    if (res.success && res.data) {
      this.setCachedSources(res.data);
      return res.data;
    }
    return cachedSources;
  },

  async fetchAlerts(): Promise<WatchlistAlert[]> {
    const res = await apiClient.getAlerts();
    if (res.success && res.data) {
      this.setCachedAlerts(res.data);
      return res.data;
    }
    return cachedAlerts;
  },

  async markAlertRead(id: string): Promise<boolean> {
    const res = await apiClient.markAlertRead(id);
    const updated = cachedAlerts.map((a) => (a.id === id ? { ...a, isNew: false } : a));
    this.setCachedAlerts(updated);
    return res.success;
  },
};
