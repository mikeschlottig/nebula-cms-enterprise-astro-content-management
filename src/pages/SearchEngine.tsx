import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Globe, Terminal, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { intelligenceService, type ExaSearchResult, type TavilySearchResult, type SearchResult } from '@/lib/intelligence';
import { motion, AnimatePresence } from 'framer-motion';
type ProviderTab = 'all' | 'astro' | 'cloudflare' | 'exa' | 'tavily';
function providerLabel(tab: ProviderTab): string {
  switch (tab) {
    case 'all':
      return 'All';
    case 'astro':
      return 'Astro';
    case 'cloudflare':
      return 'Cloudflare';
    case 'exa':
      return 'Exa';
    case 'tavily':
      return 'Tavily';
    default:
      return 'All';
  }
}
function isExa(result: SearchResult): result is ExaSearchResult {
  return (result as ExaSearchResult).provider === 'Exa';
}
function isTavily(result: SearchResult): result is TavilySearchResult {
  return (result as TavilySearchResult).provider === 'Tavily';
}
export function SearchEngine() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ProviderTab>('all');
  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['search', activeTab, query],
    queryFn: async () => {
      if (activeTab === 'exa') return intelligenceService.searchExa(query);
      if (activeTab === 'tavily') return intelligenceService.searchTavily(query);
      return intelligenceService.searchDocs(query);
    },
    enabled: query.length > 2,
    staleTime: 20_000,
  });
  const filteredResults = useMemo(() => {
    const base = results ?? [];
    if (activeTab === 'astro') return base.filter((r) => r.category === 'Astro');
    if (activeTab === 'cloudflare') return base.filter((r) => r.category === 'Cloudflare');
    // Exa / Tavily are already provider-scoped from the queryFn.
    return base;
  }, [activeTab, results]);
  const tavilyAnswer = useMemo(() => {
    if (activeTab !== 'tavily') return null;
    const first = (filteredResults?.[0] as TavilySearchResult | undefined) ?? undefined;
    return first?.answerSnippet?.trim() ? first.answerSnippet.trim() : null;
  }, [activeTab, filteredResults]);
  return (
    <AppLayout container={false} className="bg-[#0B0F1A] min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/20 text-primary mb-2 shadow-glow">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Nebula Knowledge Base</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Hybrid search across Astro/Cloudflare docs and external AI providers (Exa, Tavily).
          </p>
        </div>
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documentation, API routes, or guides..."
            className="h-16 pl-12 pr-4 bg-white/5 border-white/10 rounded-2xl text-lg focus:ring-primary focus:border-primary placeholder:text-slate-600 shadow-2xl transition-all duration-300 focus:bg-white/10"
            aria-label="Search query"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/10">
            <Terminal className="h-3 w-3" /> <span className="font-mono">CMD+K</span>
          </div>
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          {(['all', 'astro', 'cloudflare', 'exa', 'tavily'] as ProviderTab[]).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={`capitalize rounded-full px-6 transition-all ${
                activeTab === tab ? 'bg-primary shadow-primary/20 shadow-lg' : 'text-slate-400 hover:bg-white/5'
              }`}
              aria-pressed={activeTab === tab}
            >
              {providerLabel(tab)}
            </Button>
          ))}
        </div>
        <div className="space-y-4 min-h-[420px]">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-slate-500 font-mono text-xs">
                {activeTab === 'exa' || activeTab === 'tavily' ? 'Querying AI provider…' : 'Querying Vector Index…'}
              </p>
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-slate-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p>Search is temporarily unavailable.</p>
              <p className="text-xs mt-2">Try again in a moment.</p>
            </div>
          ) : query.length > 2 && (filteredResults?.length ?? 0) === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <>
              {activeTab === 'tavily' && tavilyAnswer && (
                <Card className="glass-panel border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="border-none bg-purple-500/10 text-purple-300">
                        Tavily Answer
                      </Badge>
                      <span className="text-[10px] text-slate-500 font-mono">Synthesized summary</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{tavilyAnswer}</p>
                  </CardContent>
                </Card>
              )}
              <AnimatePresence mode="popLayout">
                {filteredResults?.map((result, i) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="glass-panel border-white/5 hover:border-primary/40 hover:bg-white/[0.07] transition-all cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-3 min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge
                                variant="outline"
                                className={`border-none ${
                                  result.category === 'Astro'
                                    ? 'bg-orange-500/10 text-orange-500'
                                    : result.category === 'Cloudflare'
                                      ? 'bg-blue-500/10 text-blue-500'
                                      : 'bg-white/10 text-slate-300'
                                }`}
                              >
                                {result.category}
                              </Badge>
                              {isExa(result) && (
                                <Badge variant="outline" className="border-none bg-emerald-500/10 text-emerald-300">
                                  Exa • relevance {(result.relevance * 100).toFixed(0)}%
                                </Badge>
                              )}
                              {isTavily(result) && (
                                <Badge variant="outline" className="border-none bg-purple-500/10 text-purple-300">
                                  Tavily • confidence {(result.confidence * 100).toFixed(0)}%
                                </Badge>
                              )}
                              <span className="text-[10px] text-slate-500 font-mono tracking-tighter">
                                Similarity Score: {(result.score * 100).toFixed(1)}%
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300 truncate">
                              {result.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-sans">
                              {result.snippet}
                            </p>
                            {isExa(result) && result.rawContent ? (
                              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                                <p className="text-[11px] text-emerald-100/90 font-mono line-clamp-3">
                                  {result.rawContent}
                                </p>
                              </div>
                            ) : null}
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pt-2">
                              <Globe className="h-3 w-3" /> <span className="truncate">{result.url}</span>
                            </div>
                          </div>
                          <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300">
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}