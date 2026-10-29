import { AIMessage, AIThread } from '../types';
import { apiClient } from './apiClient';

const DEFAULT_AI_THREADS: AIThread[] = [
  {
    id: 'thread-1',
    title: 'Fresher backend developer inquiry',
    companyContext: 'TCS',
    updatedAt: '12m ago',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        timestamp: '10:14 AM',
        text: 'For a fresher backend developer, what does the evidence indicate about TCS?',
      },
      {
        id: 'm2',
        sender: 'assistant',
        timestamp: '10:15 AM',
        claim: 'TCS may align with a learning-first fresher profile—with trade-offs worth checking.',
        text: "Available employee feedback frequently highlights comprehensive foundational training and organizational stability. In this sample, 86 learning-related mentions reflect 63 positive, 15 neutral and 8 negative signals.\n\nFor your saved Backend Developer DNA, learning and stability have high priority. That helps explain TCS's 87% Career Fit. This is personal alignment, not an absolute company rating.\n\nSalary progression is more mixed across sources. Ask about the specific team's backend stack, mentorship, promotion process and project allocation before drawing a conclusion.",
        confidence: {
          level: 'high',
          percentage: 82,
          label: 'High confidence · 82%',
          detail: '127 reviews · 3 sample sources · Checked 12 days ago',
        },
        evidenceRef: {
          mentions: 86,
          positive: 63,
          neutral: 15,
          negative: 8,
          sourcesCount: 3,
          reviewsCount: 127,
          checkedDaysAgo: 12,
        },
        sources: [
          'Sample Source A · 52 reviews',
          'Sample Source B · 44 reviews',
          'Sample Source C · 31 reviews',
        ],
        followUps: [
          'What do employees commonly praise?',
          'What are the biggest concerns?',
          'How is work-life balance?',
          'Which company has stronger learning opportunities?',
          'Why is my Career Fit 87%?',
        ],
        caveats: 'Illustrative demo evidence. Not verified external company statements.',
      },
    ],
  },
];

let cachedThreads: AIThread[] = [...DEFAULT_AI_THREADS];

export const aiService = {
  getThreads(): AIThread[] {
    return cachedThreads;
  },

  setCachedThreads(threads: AIThread[]): void {
    if (threads) cachedThreads = threads;
  },

  async fetchThreads(): Promise<AIThread[]> {
    const res = await apiClient.getAIThreads();
    if (res.success && res.data && res.data.length > 0) {
      this.setCachedThreads(res.data);
      return res.data;
    }
    return cachedThreads;
  },

  async askAI(question: string, companyId: string, threadId?: string): Promise<{ threadId: string; message: AIMessage; sources: any[]; companyContext?: any } | null> {
    const res = await apiClient.askAI(question, companyId, threadId);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  },

  // Fallback local grounded response synthesizer if backend is unreachable
  generateResponse(query: string, companyContext: string = 'the company'): AIMessage {
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      claim: `Analysis grounded in available workplace review samples for ${companyContext}.`,
      text: `Evidence indicates foundational organizational capabilities and project workflows for ${companyContext}. Specific outcomes depend on business practice allocation, client accounts, and internal mentorship. Keep objective company evidence and your personal priorities distinct when evaluating this step.`,
      confidence: {
        level: 'high',
        percentage: 82,
        label: 'High confidence · 82%',
      },
      sources: [`${companyContext} official profile`, `${companyContext} verified reviews`],
      followUps: [
        `What do employees commonly praise at ${companyContext}?`,
        `What are the biggest concerns at ${companyContext}?`,
        `How does work-life balance rate at ${companyContext}?`,
      ],
      caveats: `Illustrative demo dataset for ${companyContext}. Individual project and team allocations vary.`,
      isDemoData: true,
      provider: 'local_fallback',
      isFallback: true,
    };
  },
};
