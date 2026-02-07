import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { chatService } from '@/lib/chat';
import type { Message } from '../../worker/types';
import { Send, Sparkles, Terminal, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const load = async () => {
      const res = await chatService.getMessages();
      if (res.success && res.data) setMessages(res.data.messages);
    };
    load();
  }, []);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input;
    setInput('');
    setIsLoading(true);
    const tempId = crypto.randomUUID();
    const newUserMsg: Message = { id: tempId, role: 'user', content: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);
    try {
      let fullContent = "";
      await chatService.sendMessage(userText, undefined, (chunk) => {
        fullContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.id === 'streaming') {
            return [...prev.slice(0, -1), { ...last, content: fullContent }];
          }
          return [...prev, { id: 'streaming', role: 'assistant', content: fullContent, timestamp: Date.now() }];
        });
      });
      const finalRes = await chatService.getMessages();
      if (finalRes.success && finalRes.data) setMessages(finalRes.data.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AppLayout container={false} className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#0B0F1A]">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center pb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white">Nebula Assistant</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-none">Astro Expert</Badge>
              <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-none">Cloudflare Edge</Badge>
            </div>
          </div>
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-500 py-20 border-2 border-dashed border-white/5 rounded-3xl">
                <Terminal className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Ask me anything about Astro schemas, Cloudflare Workers, or content generation.</p>
              </motion.div>
            )}
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-primary text-white ml-12' : 'bg-white/5 border border-white/10 text-slate-200 mr-12'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  <span className="text-[10px] opacity-40 mt-2 block">{new Date(m.timestamp).toLocaleTimeString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </div>
      <div className="p-4 md:p-8 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A] to-transparent">
        <div className="max-w-4xl mx-auto relative">
          <Input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="h-14 bg-white/5 border-white/10 rounded-2xl pr-14 text-white focus:ring-primary focus:border-primary placeholder:text-slate-600"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading}
            size="icon" 
            className="absolute right-2 top-2 h-10 w-10 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
          <p className="text-[10px] text-center text-slate-600 mt-3 flex items-center justify-center gap-1">
            <Info className="h-3 w-3" /> Note: This project has AI capabilities. There is a request limit for cross-user AI access.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}