import { toast } from "sonner";
export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  score: number;
  category: 'Astro' | 'Cloudflare' | 'General';
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
        category: 'Astro' as const
      },
      {
        id: 's2',
        title: 'Cloudflare Workers AI: Vectorize',
        snippet: 'Vectorize is Cloudflare’s vector database, which allows you to store and query embeddings.',
        url: 'https://developers.cloudflare.com/vectorize/',
        score: 0.92,
        category: 'Cloudflare' as const
      },
      {
        id: 's3',
        title: 'Server-side Rendering (SSR) in Astro',
        snippet: 'By default, Astro is a static site generator. You can opt-in to SSR to render pages on demand.',
        url: 'https://docs.astro.build/en/guides/server-side-rendering/',
        score: 0.85,
        category: 'Astro' as const
      }
    ];
    return results.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.snippet.toLowerCase().includes(query.toLowerCase())
    );
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