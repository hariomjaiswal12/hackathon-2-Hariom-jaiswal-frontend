import { ResearchHistoryItem } from '../types';
import { apiClient } from './apiClient';
import { MOCK_RESEARCH_HISTORY } from '../data/mockData';

let cachedHistory: ResearchHistoryItem[] = [...MOCK_RESEARCH_HISTORY];

export const historyService = {
  getHistory(): ResearchHistoryItem[] {
    return cachedHistory;
  },

  setCachedHistory(items: ResearchHistoryItem[]): void {
    if (items) {
      cachedHistory = items;
    }
  },

  async fetchHistory(type: string = 'all'): Promise<ResearchHistoryItem[]> {
    const res = await apiClient.getHistory(type);
    if (res.success && res.data) {
      this.setCachedHistory(res.data);
      return res.data;
    }
    return cachedHistory;
  },

  async addHistory(item: Partial<ResearchHistoryItem>): Promise<ResearchHistoryItem> {
    const res = await apiClient.addHistory(item);
    if (res.success && res.data) {
      const updated = [res.data, ...cachedHistory.filter((h) => h.id !== res.data.id)];
      this.setCachedHistory(updated);
      return res.data;
    }

    const fallback: ResearchHistoryItem = {
      id: `h-${Date.now()}`,
      activity: item.activity || 'Company viewed',
      type: (item.type as any) || 'Company',
      context: item.context || '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateGroup: 'TODAY / OCT 28, 2026',
      link: item.link,
    };
    this.setCachedHistory([fallback, ...cachedHistory]);
    return fallback;
  },

  async clearHistory(): Promise<boolean> {
    const res = await apiClient.clearHistory();
    this.setCachedHistory([]);
    return res.success;
  },
};
