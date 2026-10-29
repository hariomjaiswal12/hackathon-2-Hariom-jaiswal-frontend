import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { apiClient } from '../../services/apiClient';
import { AIThread, AIMessage } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Sparkles,
  Send,
  Plus,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  AlertCircle,
  Building2,
  Info,
} from 'lucide-react';

export const AskCompanyIQPage: React.FC = () => {
  const navigate = useNavigate();
  const { careerDNA, openEvidenceDrawer, addHistoryItem, companies } = useApp();
  const [threads, setThreads] = useState<AIThread[]>(() => aiService.getThreads());
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id || 'thread-1');
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [providerStatus, setProviderStatus] = useState<{
    provider: string;
    configured: boolean;
    model: string;
    status: string;
    errorReason?: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    aiService.fetchThreads().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setThreads(loaded);
        setActiveThreadId(loaded[0].id);
      }
    });

    apiClient.getAIStatus().then((res) => {
      if (res.success && res.data) {
        setProviderStatus(res.data);
      }
    });
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || {
    id: 'thread-default',
    title: 'Research thread',
    companyContext: 'TCS',
    companyId: 'tcs',
    updatedAt: 'Just now',
    messages: [],
  };

  // Resolve matching company
  const selectedCompany = useMemo(() => {
    if (!companies || companies.length === 0) return null;
    const targetCtx = (activeThread.companyContext || activeThread.companyId || 'tcs').toLowerCase();
    return (
      companies.find(
        (c) =>
          c.id.toLowerCase() === targetCtx ||
          c.name.toLowerCase() === targetCtx ||
          c.shortName?.toLowerCase() === targetCtx
      ) || companies[0]
    );
  }, [companies, activeThread.companyContext, activeThread.companyId]);

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  const handleNewThread = () => {
    const comp = selectedCompany || companies[0];
    const newThread: AIThread = {
      id: `thread-${Date.now()}`,
      title: 'New research thread',
      companyContext: comp?.name || 'TCS',
      companyId: comp?.id || 'tcs',
      updatedAt: 'Just now',
      messages: [],
    };
    const updated = [newThread, ...threads];
    setThreads(updated);
    setActiveThreadId(newThread.id);
  };

  const handleCompanyChange = (newCompanyId: string) => {
    const comp = companies.find((c) => c.id === newCompanyId);
    if (!comp) return;
    const updatedThread: AIThread = {
      ...activeThread,
      companyContext: comp.name,
      companyId: comp.id,
    };
    setThreads((prev) => prev.map((t) => (t.id === activeThread.id ? updatedThread : t)));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputVal).trim();
    if (!q) return;

    setInputVal('');

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
    };

    const currentMessages = activeThread.messages || [];
    const updatedMessages = [...currentMessages, userMessage];

    const updatedThread: AIThread = {
      ...activeThread,
      title: currentMessages.length === 0 ? q.slice(0, 32) : activeThread.title,
      messages: updatedMessages,
      updatedAt: 'Just now',
    };

    setThreads((prev) => prev.map((t) => (t.id === activeThread.id ? updatedThread : t)));
    setIsTyping(true);

    const compSlug = selectedCompany?.id || (activeThread.companyContext || 'tcs').toLowerCase();
    const compName = selectedCompany?.name || activeThread.companyContext || 'General Research';

    addHistoryItem({
      activity: q,
      type: 'AI question',
      context: compName,
    });

    try {
      const validThreadId = activeThread.id && !activeThread.id.startsWith('thread-') ? activeThread.id : undefined;
      const res = await aiService.askAI(q, compSlug, validThreadId);

      let assistantResponse: AIMessage;
      if (res && res.message) {
        assistantResponse = res.message;
        if (res.threadId && res.threadId !== activeThread.id) {
          updatedThread.id = res.threadId;
          setActiveThreadId(res.threadId);
        }
      } else {
        assistantResponse = aiService.generateResponse(q, compSlug);
      }

      const threadWithAiResp: AIThread = {
        ...updatedThread,
        messages: [...updatedMessages, assistantResponse],
      };
      setThreads((prev) => prev.map((t) => (t.id === activeThread.id ? threadWithAiResp : t)));
    } catch {
      const fallbackResponse = aiService.generateResponse(q, compSlug);
      const threadWithAiResp: AIThread = {
        ...updatedThread,
        messages: [...updatedMessages, fallbackResponse],
      };
      setThreads((prev) => prev.map((t) => (t.id === activeThread.id ? threadWithAiResp : t)));
    } finally {
      setIsTyping(false);
    }
  };

  const compDisplayName = selectedCompany?.shortName || activeThread.companyContext || 'this company';
  const suggestedFollowUps = [
    `Is ${compDisplayName} good for freshers?`,
    `What do employees commonly praise at ${compDisplayName}?`,
    `What are the biggest concerns about work-life balance?`,
    `How is compensation and learning at ${compDisplayName}?`,
    `Why is my Career Fit matching with ${compDisplayName}?`,
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Notice with AI Provider Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] px-4 py-2.5 rounded-[6px] text-[11px]">
        <div className="flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8]">
          <ShieldCheck size={14} className="text-[#373D91] dark:text-[#818CF8]" />
          <span>Demo dataset · Illustrative research based on local MongoDB company profiles</span>
        </div>
        <div className="flex items-center gap-2">
          {providerStatus ? (
            providerStatus.status === 'ready' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-medium text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini {providerStatus.model} Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-medium text-[11px]">
                <Info size={11} />
                Grounding Engine (Deterministic) · Gemini key {providerStatus.status}
              </span>
            )
          ) : (
            <span className="text-[#94A3B8]">Checking AI status...</span>
          )}
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#14213D] dark:text-[#F8FAFC] tracking-tight">
          Ask CompanyIQ
        </h1>
        <p className="text-[13px] text-[#5A6A85] dark:text-[#94A3B8] mt-1">
          Explore any company. Question the evidence. Keep your priorities in context.
        </p>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Threads & Research Context */}
        <div className="lg:col-span-4 space-y-4">
          <Button
            variant="ai"
            size="md"
            icon={<Plus size={14} />}
            className="w-full justify-center"
            onClick={handleNewThread}
          >
            New research thread
          </Button>

          {/* Company Selector */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4 space-y-2">
            <label className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block flex items-center gap-1.5">
              <Building2 size={13} className="text-[#373D91] dark:text-[#818CF8]" />
              Select Target Company
            </label>
            <select
              value={selectedCompany?.id || 'tcs'}
              onChange={(e) => handleCompanyChange(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-[#131C31] border border-[#CBD5E1] dark:border-[#334155] rounded-[4px] px-3 py-2 text-[12px] font-semibold text-[#14213D] dark:text-[#F8FAFC] focus:outline-none focus:border-[#7547CB]"
            >
              {companies && companies.length > 0 ? (
                companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shortName})
                  </option>
                ))
              ) : (
                <option value="tcs">Tata Consultancy Services (TCS)</option>
              )}
            </select>
            <span className="text-[10px] text-[#94A3B8] block">
              Questions in this thread will be grounded in {selectedCompany?.name || 'this company'}'s MongoDB evidence.
            </span>
          </div>

          {/* Recent Threads List */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4 space-y-2">
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block mb-2">
              Recent threads
            </span>
            <div className="space-y-1">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  className={`w-full text-left p-2.5 rounded-[4px] text-[12px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                    thread.id === activeThreadId
                      ? 'bg-[#EEF0F9] dark:bg-[#1E293B] text-[#373D91] dark:text-[#818CF8] font-bold border border-[#D5DCF3] dark:border-[#384869]'
                      : 'text-[#5A6A85] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-[#131C31]'
                  }`}
                >
                  <span className="truncate flex-1">{thread.title}</span>
                  <span className="text-[10px] text-[#94A3B8] ml-2 shrink-0">
                    {thread.updatedAt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Research Context Card */}
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] p-4 space-y-3">
            <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
              Active Context
            </span>
            <div className="space-y-1 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Company:</span>
                <span className="font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  {selectedCompany?.name || activeThread.companyContext || 'TCS'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Target Role:</span>
                <span className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{careerDNA.targetRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Experience:</span>
                <span className="font-medium text-[#14213D] dark:text-[#F8FAFC]">{careerDNA.experience}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F5F9] dark:border-[#1E293B]">
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block mb-1 font-medium">Priorities in scope</span>
              <p className="text-[11px] text-[#7547CB] dark:text-[#A78BFA] font-medium">
                Learning {careerDNA.priorities.learning} · Growth {careerDNA.priorities.growth} · Stability {careerDNA.priorities.stability}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Conversation Pane */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] flex flex-col min-h-[580px] shadow-xs">
          {/* Messages list */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {activeThread.messages.length === 0 && (
              <div className="text-center py-12 text-[#64748B] dark:text-[#94A3B8] space-y-2">
                <Sparkles size={28} className="mx-auto text-[#7547CB] dark:text-[#A78BFA]" />
                <h3 className="text-[16px] font-bold text-[#14213D] dark:text-[#F8FAFC]">
                  Ask grounded questions about {selectedCompany?.name || 'the selected company'}
                </h3>
                <p className="text-[13px] max-w-md mx-auto text-[#5A6A85] dark:text-[#94A3B8]">
                  Query employee sentiment, compensation, learning culture, or compare with your personal Career DNA. Every answer cites real company sources.
                </p>
              </div>
            )}

            {activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.sender === 'user' ? (
                  <div className="bg-[#F1F5F9] dark:bg-[#1E293B] text-[#14213D] dark:text-[#F8FAFC] px-4 py-3 rounded-[6px] max-w-[85%] text-[13px] font-medium">
                    {msg.text}
                  </div>
                ) : (
                  <div className="bg-[#FAF9FD] dark:bg-[#131C31] border border-[#E9E4F5] dark:border-[#26324A] p-5 rounded-[6px] max-w-full space-y-4 text-[13px]">
                    {/* Assistant Header */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-[#7547CB] dark:text-[#A78BFA] font-bold text-[12px]">
                        <Sparkles size={15} /> CompanyIQ AI
                      </div>
                      <div className="flex items-center gap-2">
                        {msg.isFallback ? (
                          <span className="text-[10px] text-[#B45309] dark:text-[#FCD34D] bg-[#FEF3C7] dark:bg-[#78350F]/30 border border-[#FDE68A] dark:border-[#92400E] px-2 py-0.5 rounded font-medium">
                            Deterministic Grounding Engine
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#7547CB] dark:text-[#C4B5FD] bg-[#F4EFFD] dark:bg-[#7547CB]/20 px-2 py-0.5 rounded font-medium">
                            {msg.provider === 'gemini' ? (msg.model ? `Gemini (${msg.model})` : 'Gemini AI') : 'AI interpretation'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Fallback Reason Notice */}
                    {msg.fallbackReason && (
                      <div className="text-[11px] text-[#92400E] dark:text-[#FDE68A] bg-[#FEF3C7] dark:bg-[#78350F]/20 border border-[#FDE68A] dark:border-[#92400E]/40 px-3 py-1.5 rounded-[4px] flex items-start gap-1.5">
                        <AlertCircle size={13} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                        <span>{msg.fallbackReason}</span>
                      </div>
                    )}

                    {/* Claim Title */}
                    {msg.claim && (
                      <h4 className="text-[15px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-snug">
                        {msg.claim}
                      </h4>
                    )}

                    {/* Body Text */}
                    <div className="text-[#14213D] dark:text-[#E2E8F0] leading-relaxed whitespace-pre-line space-y-2">
                      {msg.text}
                    </div>

                    {/* Sources pills */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                          Company Sources Cited:
                        </span>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {msg.sources.map((src, i) => (
                            <span
                              key={i}
                              className="bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#26324A] text-[#373D91] dark:text-[#818CF8] px-2.5 py-0.5 rounded-[4px] font-medium"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evidence Card Block */}
                    {msg.evidenceRef && (
                      <div className="p-4 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] rounded-[6px] space-y-3">
                        <span className="text-[12px] font-bold text-[#14213D] dark:text-[#F8FAFC] block">
                          Evidence behind this answer
                        </span>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-[#177454] dark:text-[#34D399] font-medium">
                            <span>Mentions: {msg.evidenceRef.positive} positive / {msg.evidenceRef.mentions} related</span>
                          </div>
                          <div className="h-2 bg-[#E2E8F0] dark:bg-[#1E293B] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#177454] dark:bg-[#34D399] rounded-full"
                              style={{ width: `${Math.min(100, Math.round(((msg.evidenceRef.positive || 1) / Math.max(1, msg.evidenceRef.mentions || 1)) * 100))}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Badge
                            level={msg.confidence?.level || 'high'}
                            text={`${(msg.confidence?.level || 'high').toUpperCase()} CONFIDENCE · ${msg.confidence?.percentage || 82}%`}
                            size="sm"
                          />
                          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            {msg.evidenceRef.reviewsCount} reviews · {msg.evidenceRef.sourcesCount} sources
                          </span>
                          {msg.isDemoData && (
                            <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                              Demo Dataset
                            </span>
                          )}
                        </div>

                        {msg.caveats && (
                          <p className="text-[11px] text-[#94A3B8] leading-relaxed italic">
                            Limitations: {msg.caveats}
                          </p>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-[#F8FAFC] dark:border-[#1E293B]">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEvidenceDrawer(selectedCompany?.id || 'tcs', 'learning')}
                          >
                            Evidence
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/sources')}
                          >
                            Sources
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Thumbs Feedback */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#94A3B8]">
                      <div className="flex items-center gap-2">
                        <button className="hover:text-[#14213D] dark:hover:text-[#F8FAFC] p-1 rounded hover:bg-white dark:hover:bg-[#1E293B] cursor-pointer" title="Helpful answer">
                          <ThumbsUp size={13} />
                        </button>
                        <button className="hover:text-[#14213D] dark:hover:text-[#F8FAFC] p-1 rounded hover:bg-white dark:hover:bg-[#1E293B] cursor-pointer" title="Inaccurate or unhelpful">
                          <ThumbsDown size={13} />
                        </button>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          Supports your research. Does not decide for you.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="p-4 bg-[#FAF9FD] dark:bg-[#131C31] border border-[#E9E4F5] dark:border-[#26324A] rounded-[6px] max-w-sm space-y-2">
                <span className="text-[11px] font-bold text-[#7547CB] dark:text-[#A78BFA] flex items-center gap-1">
                  <Sparkles size={13} /> Grounding in {selectedCompany?.name || 'company'} evidence...
                </span>
                <div className="h-2 bg-[#EAE6F8] dark:bg-[#1E293B] rounded w-3/4 animate-pulse" />
              </div>
            )}
          </div>

          {/* Follow-up suggestions */}
          <div className="px-6 py-3 border-t border-[#F1F5F9] dark:border-[#1E293B] bg-[#FAFBFD] dark:bg-[#131C31] space-y-2">
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
              Explore a follow-up for {selectedCompany?.name || 'this company'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestedFollowUps.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[11px] bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#26324A] text-[#5A6A85] dark:text-[#CBD5E1] px-2.5 py-1 rounded-[4px] hover:border-[#373D91] hover:text-[#373D91] dark:hover:border-[#818CF8] dark:hover:text-[#818CF8] transition-colors cursor-pointer text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t border-[#E2E8F0] dark:border-[#26324A] bg-white dark:bg-[#0F172A] flex gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Ask a question about ${selectedCompany?.name || 'companies'}...`}
              className="flex-1 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-3.5 py-2.5 text-[13px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#7547CB] dark:focus:border-[#8B5CF6] focus:bg-white dark:focus:bg-[#080D1C]"
            />
            <Button variant="ai" size="md" type="submit" icon={<Send size={14} />}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
