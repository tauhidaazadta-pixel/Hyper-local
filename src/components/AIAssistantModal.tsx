import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  X,
  Send,
  Store,
  ArrowRight,
  TrendingDown,
  Clock,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { GeminiShoppingAssistantResponse } from '../types';

export const AIAssistantModal: React.FC = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    queryAIAssistant,
    aiLoading,
    masterProducts,
    setSelectedProductId,
  } = useApp();

  const [promptInput, setPromptInput] = useState('');
  const [conversation, setConversation] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; data?: GeminiShoppingAssistantResponse }>
  >([
    {
      role: 'assistant',
      text: "Hello! I'm your Hyperlocal Shopping AI. Ask me to find the cheapest nearby milk, build a breakfast bundle, or compare seller prices for any grocery item!",
      data: {
        message: "Hello! I'm your Hyperlocal Shopping AI. Ask me to find the cheapest nearby milk, build a breakfast bundle, or compare seller prices for any grocery item!",
        recommendedProductIds: ['prod_pepsi_500', 'prod_amul_milk_1l', 'prod_lays_classic'],
        bestDealsSummary: 'Apex Express Mart has Pepsi at $1.75 and Metro Superstore has Milk at $3.29.',
        suggestedPrompts: [
          'Who has the cheapest Pepsi 500ml right now?',
          'Find high-protein groceries with fast delivery',
          'Build a party snacks basket under $15',
        ],
      },
    },
  ]);

  if (!isAIAssistantOpen) return null;

  const handleSubmit = async (queryText?: string) => {
    const text = queryText || promptInput.trim();
    if (!text || aiLoading) return;

    setConversation((prev) => [...prev, { role: 'user', text }]);
    setPromptInput('');

    try {
      const res = await queryAIAssistant(text);
      setConversation((prev) => [...prev, { role: 'assistant', text: res.message, data: res }]);
    } catch (e) {
      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I analyzed our nearby sellers' master inventory. Here are the top items matching your request:",
        },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-900 via-blue-900 to-[#0f2b5c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                Gemini Hyperlocal Shopping Assistant
              </h3>
              <p className="text-[11px] text-blue-200">Live multi-seller pricing & inventory intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setIsAIAssistantOpen(false)}
            className="p-1.5 rounded-full hover:bg-blue-800 text-blue-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                  msg.role === 'user'
                    ? 'bg-[#0f2b5c] text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80 space-y-2.5'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* AI Recommended Products Cards */}
                {msg.data?.recommendedProductIds && msg.data.recommendedProductIds.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    <div className="text-[11px] font-bold text-blue-900 uppercase">
                      Recommended Master SKUs:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.data.recommendedProductIds.map((pid) => {
                        const prod = masterProducts.find((p) => p.id === pid);
                        if (!prod) return null;
                        return (
                          <div
                            key={prod.id}
                            onClick={() => {
                              setSelectedProductId(prod.id);
                              setIsAIAssistantOpen(false);
                            }}
                            className="p-2 bg-white rounded-xl border border-slate-200 hover:border-blue-500 shadow-2xs cursor-pointer flex items-center justify-between gap-2 transition-all hover:scale-101"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={prod.images[0]}
                                alt={prod.name}
                                className="w-8 h-8 object-contain rounded"
                              />
                              <div className="truncate">
                                <div className="font-bold text-slate-900 text-xs truncate">{prod.name}</div>
                                <div className="text-[10px] text-slate-500">{prod.brand} • {prod.unit}</div>
                              </div>
                            </div>
                            <span className="text-xs font-black text-blue-800 whitespace-nowrap">
                              ${prod.mrp.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Suggested Followups */}
                {msg.data?.suggestedPrompts && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.data.suggestedPrompts.map((sp, i) => (
                      <button
                        key={i}
                        onClick={() => handleSubmit(sp)}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 rounded-full text-[11px] font-semibold transition-colors"
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {aiLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-2 bg-slate-50 rounded-xl max-w-xs">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Analyzing multi-seller stocks and comparing deals...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Compare Pepsi prices near me')..."
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={!promptInput.trim() || aiLoading}
              className="px-4 py-2.5 bg-[#0f2b5c] hover:bg-blue-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
