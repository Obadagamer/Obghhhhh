/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Loader2, Trash2, Sparkles } from "lucide-react";
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, userMessage].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "أنت مساعد ذكي ودود ومفيد. أجب باللغة العربية بأسلوب مهذب وواضح.",
        }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || 'عذراً، لم أتمكن من معالجة طلبك.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling Gemini:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">مساعد جيميناي</h1>
              <p className="text-xs text-black/40 font-medium uppercase tracking-wider">الذكاء الاصطناعي العربي</p>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors text-black/40 hover:text-red-500"
            title="مسح المحادثة"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col gap-6">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6"
            >
              <Bot className="text-emerald-500 w-10 h-10" />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold mb-2"
            >
              كيف يمكنني مساعدتك اليوم؟
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-black/50 max-w-sm"
            >
              أنا هنا للإجابة على أسئلتك، مساعدتك في الكتابة، أو حتى مجرد الدردشة.
            </motion.p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-24">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    message.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-sm",
                    message.role === 'user' ? "bg-indigo-500" : "bg-emerald-500"
                  )}>
                    {message.role === 'user' ? (
                      <User className="text-white w-5 h-5" />
                    ) : (
                      <Bot className="text-white w-5 h-5" />
                    )}
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl shadow-sm",
                    message.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white text-[#1A1A1A] border border-black/5 rounded-tl-none"
                  )}>
                    <div className="markdown-body prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/5 prose-pre:text-black prose-code:text-indigo-600">
                      <Markdown>{message.text}</Markdown>
                    </div>
                    <div className={cn(
                      "text-[10px] mt-2 opacity-50",
                      message.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 ml-auto"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="text-white w-5 h-5" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-black/5 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span className="text-sm text-black/50 font-medium">جاري التفكير...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-black/5 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالتك هنا..."
              className="w-full bg-black/5 border-none rounded-2xl py-4 pr-6 pl-14 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-black/30 text-sm font-medium"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute left-2 p-2 rounded-xl transition-all",
                input.trim() && !isLoading 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95" 
                  : "bg-black/10 text-black/20 cursor-not-allowed"
              )}
            >
              <Send size={20} className="rotate-180" />
            </button>
          </div>
          <p className="text-[10px] text-center text-black/30 mt-3 font-medium">
            يعمل بواسطة نموذج جيميناي • قد يقدم الذكاء الاصطناعي معلومات غير دقيقة أحياناً
          </p>
        </div>
      </footer>
    </div>
  );
}
