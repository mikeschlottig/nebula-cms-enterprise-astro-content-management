import { toast } from "sonner";
export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  score: number;
  category: 'Astro' | 'Cloudflare' | 'General';
  provider?: 'Docs' | 'Exa' | 'Tavily';
}
export interface ExaSearchResult extends SearchResult {
  provider: 'Exa';
  relevance: number; // 0..1
  rawContent?: string;
}
export interface TavilySearchResult extends SearchResult {
  provider: 'Tavily';
  confidence: number; // 0..1
  answerSnippet?: string;
  rawContent?: string;
}
export interface VectorIndex {
  id: string;
  name: string;
  dimensions: number;
  metric: 'cosine' | 'euclidean' | 'dot-product';
  vectors: number;
  namespaces: number;
  status: 'ready' | 'initializing' | 'error';
}
class IntelligenceService {
  async getVectorIndexes(): Promise<VectorIndex[]> {
    return [
      { id: 'idx-1', name: 'astro-docs-embeddings', dimensions: 1536, metric: 'cosine', vectors: 42500, namespaces: 4, status: 'ready' },
      { id: 'idx-2', name: 'nebula-content-vectors', dimensions: 768, metric: 'dot-product', vectors: 12400, namespaces: 1, status: 'ready' },
      { id: 'idx-3', name: 'user-behavior-logs', dimensions: 384, metric: 'euclidean', vectors: 8900, namespaces: 12, status: 'initializing' },
    ];
  }
  async searchDocs(query: string): Promise<SearchResult[]> {
    if (!query) return [];
    await new Promise(r => setTimeout(r, 600));
    const results: SearchResult[] = [
      {
        id: 's1',
        title: 'Astro Content Collections',
        snippet: 'Content collections are the best way to manage content in any Astro project.',
        url: 'https://docs.astro.build/en/guides/content-collections/',
        score: 0.98,
        category: 'Astro',
        provider: 'Docs',
      },
      {
        id: 's2',
        title: 'Cloudflare Workers AI: Vectorize',
        snippet: 'Vectorize is Cloudflare’s vector database, which allows you to store and query embeddings.',
        url: 'https://developers.cloudflare.com/vectorize/',
        score: 0.92,
        category: 'Cloudflare',
        provider: 'Docs',
      },
      {
        id: 's3',
        title: 'Server-side Rendering (SSR) in Astro',
        snippet: 'By default, Astro is a static site generator. You can opt-in to SSR to render pages on demand.',
        url: 'https://docs.astro.build/en/guides/server-side-rendering/',
        score: 0.85,
        category: 'Astro',
        provider: 'Docs',
      }
    ];
    const q = query.toLowerCase();
    return results.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.snippet.toLowerCase().includes(q)
    );
  }
  async searchExa(query: string): Promise<ExaSearchResult[]> {
    if (!query) return [];
    await new Promise((r) => setTimeout(r, 800));
    // Mock behavior: Exa returns higher-quality web results with a relevance score + optional raw content.
    const results: ExaSearchResult[] = [
      {
        id: 'exa-1',
        title: `Astro + Cloudflare deployment checklist for "${query}"`,
        snippet: 'A curated checklist covering build settings, SSR adapter, caching, and edge runtime best practices.',
        url: 'https://example.com/astro-cloudflare-checklist',
        score: 0.93,
        relevance: 0.94,
        rawContent:
          'Key points: use @astrojs/cloudflare adapter for SSR, ensure headers/cache-control for static assets, and validate edge runtime limitations (no Node-only APIs).',
        category: 'General',
        provider: 'Exa',
      },
      {
        id: 'exa-2',
        title: 'Astro Content Collections patterns (real-world)',
        snippet: 'How agencies structure schemas for performance and editorial velocity.',
        url: 'https://example.com/astro-collections-patterns',
        score: 0.89,
        relevance: 0.87,
        rawContent:
          'Suggested fields: title, slug, excerpt, publishedAt. Use zod schema validation and keep frontmatter minimal; store large content as markdown bodies.',
        category: 'Astro',
        provider: 'Exa',
      },
      {
        id: 'exa-3',
        title: 'Cloudflare caching + SEO: edge strategy',
        snippet: 'Guide to edge caching, revalidation patterns, and SEO measurement across regions.',
        url: 'https://example.com/cloudflare-seo-edge',
        score: 0.84,
        relevance: 0.81,
        rawContent:
          'Measure TTFB by region, keep HTML cache dynamic with stale-while-revalidate, and use structured data to improve rich results.',
        category: 'Cloudflare',
        provider: 'Exa',
      }
    ];
    const q = query.toLowerCase();
    return results.filter((r) => (r.title + ' ' + r.snippet + ' ' + (r.rawContent ?? '')).toLowerCase().includes(q));
  }
  async searchTavily(query: string): Promise<TavilySearchResult[]> {
    if (!query) return [];
    await new Promise((r) => setTimeout(r, 850));
    // Mock behavior: Tavily often returns an "answer" plus sources.
    const answerSnippet =
      `For "${query}", prioritize: (1) fast TTFB via edge caching, (2) consistent canonical URLs, (3) structured data, and (4) region-aware performance monitoring (p50/p95).`;
    const results: TavilySearchResult[] = [
      {
        id: 'tavily-1',
        title: `Tavily summary: ${query}`,
        snippet: 'A synthesized answer with suggested next steps and sources.',
        url: 'https://tavily.com/search',
        score: 0.95,
        confidence: 0.9,
        answerSnippet,
        rawContent:
          'Action plan: Add performance budgets, track rankings by region, and audit cache headers + content freshness on edge.',
        category: 'General',
        provider: 'Tavily',
      },
      {
        id: 'tavily-2',
        title: 'Astro SEO basics (source)',
        snippet: 'Canonical URLs, sitemap generation, and metadata patterns for Astro projects.',
        url: 'https://docs.astro.build/en/guides/seo/',
        score: 0.88,
        confidence: 0.82,
        answerSnippet,
        category: 'Astro',
        provider: 'Tavily',
      },
      {
        id: 'tavily-3',
        title: 'Cloudflare performance measurement (source)',
        snippet: 'Observability and edge analytics patterns for global performance.',
        url: 'https://developers.cloudflare.com/analytics/',
        score: 0.86,
        confidence: 0.79,
        answerSnippet,
        category: 'Cloudflare',
        provider: 'Tavily',
      }
    ];
    const q = query.toLowerCase();
    return results.filter((r) => (r.title + ' ' + r.snippet + ' ' + (r.rawContent ?? '')).toLowerCase().includes(q));
  }
  async flushIndex(indexId: string): Promise<boolean> {
    toast.promise(new Promise(r => setTimeout(r, 2000)), {
      loading: `Flushing index ${indexId}...`,
      success: 'Index flushed and re-indexing started',
      error: 'Failed to flush index'
    });
    return true;
  }
}
export const intelligenceService = new IntelligenceService();