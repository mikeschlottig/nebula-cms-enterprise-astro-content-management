import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Globe, Terminal, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { intelligenceService } from '@/lib/intelligence';
import { motion, AnimatePresence } from 'framer-motion';
export function SearchEngine() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { data: results, isLoading } = useQuery({
    queryKey: ['search-docs', query],
    queryFn: () => intelligenceService.searchDocs(query),
    enabled: query.length > 2
  });
  const filteredResults = results?.filter(r =>
    activeTab === 'all' || r.category.toLowerCase() === activeTab
  );
  return (
    <AppLayout container={false} className="bg-[#0B0F1A] min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/20 text-primary mb-2 shadow-glow">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Nebula Knowledge Base</h1>
          <p className="text-slate-400 max-w-xl mx-auto">Semantic search across Astro, Cloudflare, and CMS internal documentation.</p>
        </div>
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation, API routes, or guides..."
            className="h-16 pl-12 pr-4 bg-white/5 border-white/10 rounded-2xl text-lg focus:ring-primary focus:border-primary placeholder:text-slate-600 shadow-2xl transition-all duration-300 focus:bg-white/10"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10">
            <Terminal className="h-3 w-3" /> <span className="font-mono">CMD+K</span>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          {['all', 'astro', 'cloudflare'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={`capitalize rounded-full px-6 transition-all ${
                activeTab === tab ? 'bg-primary shadow-primary/20 shadow-lg' : 'text-slate-400 hover:bg-white/5'
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>
        <div className="space-y-4 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-slate-500 font-mono text-xs">Querying Vector Index...</p>
            </div>
          ) : query.length > 2 && filteredResults?.length === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredResults?.map((result, i) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="glass-panel border-white/5 hover:border-primary/40 hover:bg-white/[0.07] transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`border-none ${
                              result.category === 'Astro' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                            }`}>
                              {result.category}
                            </Badge>
                            <span className="text-[10px] text-slate-500 font-mono tracking-tighter">Similarity Score: {(result.score * 100).toFixed(1)}%</span>
                          </div>
                          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">{result.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-sans">
                            {result.snippet}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-2">
                            <Globe className="h-3 w-3" /> {result.url}
                          </div>
                        </div>
                        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </AppLayout>
  );
}