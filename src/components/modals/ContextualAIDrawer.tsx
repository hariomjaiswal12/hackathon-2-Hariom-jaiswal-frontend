import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { apiClient } from '../../services/apiClient';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { X, Sparkles, Send, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  claim?: string;
  confidence?: any;
  sources?: (string | any)[];
}

export const ContextualAIDrawer: React.FC = () => {
  const { contextualAI, closeContextualAI, openEvidenceDrawer, companies } = useApp();
  const [activeCompany, setActiveCompany] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!contextualAI.isOpen) return;

    let isMounted = true;
    const cid = contextualAI.companyId || 'vkaps-it-solutions';

    const found = companies.find(
      (c) => c.slug?.toLowerCase() === cid.toLowerCase() || c.id?.toLowerCase() === cid.toLowerCase()
    );

    if (found) {
      setActiveCompany(found);
      setMessages([
        {
          sender: 'assistant',
          claim: `Verified Intelligence Assistant for ${found.shortName || found.name}`,
          text: `Ask me anything about **${found.name}**—including core services, verified MCA directors, engineering tech stack, delivery hubs, or career compatibility.`,
          confidence: found.confidence,
        },
      ]);
    } else {
      apiClient.getCompany(cid).then((res) => {
        if (isMounted && res.success && res.data) {
          setActiveCompany(res.data);
          setMessages([
            {
              sender: 'assistant',
              claim: `Verified Intelligence Assistant for ${res.data.shortName || res.data.name}`,
              text: `Ask me anything about **${res.data.name}**—including core services, verified MCA directors, engineering tech stack, delivery hubs, or career compatibility.`,
              confidence: res.data.confidence,
            },
          ]);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [contextualAI.isOpen, contextualAI.companyId, companies]);

  if (!contextualAI.isOpen) return null;

  const companyName = activeCompany?.name || 'Company';
  const shortName = activeCompany?.shortName || activeCompany?.name || 'Company';
  const targetId = activeCompany?.slug || contextualAI.companyId || 'company';

  const suggestedPrompts = [
    `What services does ${shortName} specialize in?`,
    `Who are the official registered directors?`,
    `What tech stack is used in engineering?`,
    `How is client feedback on Clutch?`,
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isSending) return;

    const userQ = inputVal.trim();
    setInputVal('');
    setSendError(null);

    setMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setIsSending(true);

    try {
      const res = await apiClient.askAI(userQ, targetId);
      if (res.success && res.data?.message) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            claim: res.data.message.claim,
            text: res.data.message.text,
            sources: res.data.sources,
            confidence: res.data.confidence || activeCompany?.confidence,
          },
        ]);
      } else {
        setSendError(res.error?.message || 'Could not retrieve AI response. Please try again.');
      }
    } catch (err: any) {
      setSendError(err.message || 'Error connecting to CompanyIQ AI assistant.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] h-full shadow-2xl flex flex-col border-l border-[#E2E8F0] dark:border-[#26324A] overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#26324A] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#7547CB] dark:text-[#8B5CF6]" />
            <div>
              <h2 className="text-[17px] font-bold text-[#14213D] dark:text-[#F8FAFC] leading-tight">
                Ask anything about {shortName}
              </h2>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Grounded context · {companyName}
              </span>
            </div>
          </div>
          <button
            onClick={closeContextualAI}
            className="p-1.5 text-[#64748B] dark:text-[#94A3B8] hover:text-[#14213D] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-[4px] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message stream */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.sender === 'user' ? (
                <div className="bg-[#373D91] text-white dark:bg-[#7C3AED] p-3.5 rounded-[6px] max-w-[85%] text-[13px] font-medium leading-relaxed shadow-xs">
                  {msg.text}
                </div>
              ) : (
                <div className="bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] p-4 rounded-[6px] max-w-full text-[13px] leading-relaxed space-y-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#7547CB] dark:text-[#A78BFA] bg-[#F4EFFD] dark:bg-[#7547CB]/20 px-1.5 py-0.5 rounded-[4px]">
                      Grounded AI
                    </span>
                    <Badge
                      level={msg.confidence?.level || activeCompany?.confidence?.level || 'high'}
                      text={msg.confidence?.label || activeCompany?.confidence?.label || 'Verified Grounding'}
                      size="sm"
                    />
                  </div>

                  {msg.claim && (
                    <div className="font-semibold text-[#14213D] dark:text-[#F8FAFC] text-[13px] border-l-2 border-[#7547CB] pl-2.5">
                      {msg.claim}
                    </div>
                  )}

                  <p className="text-[#334155] dark:text-[#E2E8F0] whitespace-pre-line text-[12.5px] leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Sources if present */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#26324A] text-[11px] text-[#64748B] dark:text-[#94A3B8] space-y-1">
                      <span className="font-semibold block text-[#475569] dark:text-[#CBD5E1]">
                        Evidence Sources:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((s, si) => (
                          <span
                            key={si}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-[#64748B] dark:text-[#94A3B8]"
                          >
                            {typeof s === 'string' ? s : ((s as any)?.name || (s as any)?.provider || 'Evidence Source')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#26324A] flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => openEvidenceDrawer(targetId, 'learning')}
                      className="text-[#373D91] dark:text-[#8B5CF6] hover:underline font-medium cursor-pointer flex items-center gap-1"
                    >
                      Inspect category evidence <ExternalLink size={10} />
                    </button>
                    <span className="text-[#94A3B8] dark:text-[#64748B]">Zero hallucination policy</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="p-4 rounded-[6px] bg-[#FAFBFD] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] flex items-center gap-2.5 text-[12px] text-[#64748B] dark:text-[#94A3B8]">
              <Loader2 size={16} className="animate-spin text-[#7547CB] dark:text-[#A78BFA]" />
              <span>Analyzing verified company evidence and generating grounded response...</span>
            </div>
          )}

          {sendError && (
            <div className="p-3 rounded-[6px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[12px] text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{sendError}</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="px-6 py-2.5 border-t border-[#F1F5F9] dark:border-[#1E293B] flex flex-wrap gap-1.5 bg-[#FAFBFD] dark:bg-[#080D1C]">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              disabled={isSending}
              onClick={() => setInputVal(prompt)}
              className="text-[11px] bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] text-[#5A6A85] dark:text-[#CBD5E1] px-2.5 py-1 rounded-[4px] hover:border-[#373D91] dark:hover:border-[#8B5CF6] hover:text-[#373D91] dark:hover:text-[#8B5CF6] transition-colors cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#E2E8F0] dark:border-[#26324A] bg-white dark:bg-[#0F172A] flex gap-2">
          <input
            type="text"
            value={inputVal}
            disabled={isSending}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Ask a question about ${shortName}...`}
            className="flex-1 bg-[#F8FAFC] dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#26324A] rounded-[4px] px-3 py-2 text-[13px] text-[#14213D] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#7547CB] dark:focus:border-[#8B5CF6] disabled:opacity-50"
          />
          <Button variant="ai" size="md" type="submit" disabled={isSending || !inputVal.trim()} icon={<Send size={14} />}>
            {isSending ? 'Asking...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
};
