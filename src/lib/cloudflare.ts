import { toast } from "sonner";
export interface CloudflareApp {
  id: string;
  name: string;
  type: 'pages' | 'workers';
  status: 'active' | 'deploying' | 'failed';
  url: string;
  branch?: string;
  updatedAt: number;
}
export interface CloudflareWorker {
  id: string;
  name: string;
  routes: string[];
  usage: {
    cpu: string;
    memory: string;
    requests: number;
  };
  logs: string[];
}
export interface R2Bucket {
  name: string;
  region: string;
  objectsCount: number;
  size: string;
}
export interface D1Database {
  uuid: string;
  name: string;
  tables: string[];
  size: string;
}
class CloudflareService {
  async getDeployedApps(): Promise<CloudflareApp[]> {
    // Simulated fetch
    return [
      { id: '1', name: 'nebula-web', type: 'pages', status: 'active', url: 'https://nebula-web.pages.dev', branch: 'main', updatedAt: Date.now() },
      { id: '2', name: 'nebula-api', type: 'workers', status: 'active', url: 'https://api.nebula.com', updatedAt: Date.now() - 3600000 },
      { id: '3', name: 'astro-docs-sync', type: 'workers', status: 'deploying', url: 'https://docs-sync.nebula.workers.dev', updatedAt: Date.now() - 10000 },
    ];
  }
  async getWorkers(): Promise<CloudflareWorker[]> {
    return [
      {
        id: 'w1',
        name: 'chat-agent-handler',
        routes: ['api/chat/*'],
        usage: { cpu: '12ms', memory: '45MB', requests: 12400 },
        logs: ['[INFO] Request received', '[DEBUG] Parsing message', '[INFO] AI stream started']
      },
      {
        id: 'w2',
        name: 'image-optimizer',
        routes: ['cdn/images/*'],
        usage: { cpu: '8ms', memory: '120MB', requests: 89200 },
        logs: ['[INFO] Cache hit: /logo.png', '[INFO] Resizing: /hero.jpg']
      }
    ];
  }
  async getR2Buckets(): Promise<R2Bucket[]> {
    return [
      { name: 'nebula-assets', region: 'wnam', objectsCount: 1420, size: '4.2 GB' },
      { name: 'nebula-backups', region: 'eeur', objectsCount: 12, size: '120 GB' }
    ];
  }
  async getD1Databases(): Promise<D1Database[]> {
    return [
      { uuid: 'd1-001', name: 'nebula_cms_db', tables: ['collections', 'entries', 'users'], size: '150 MB' },
      { uuid: 'd1-002', name: 'analytics_logs', tables: ['events', 'metrics'], size: '1.2 GB' }
    ];
  }
  async runQuery(query: string): Promise<any[]> {
    toast.info("Executing D1 Query...");
    await new Promise(r => setTimeout(r, 6000));
    return [
      { id: 1, name: "Sample Item", status: "published", created_at: "2024-03-20" },
      { id: 2, name: "Astro Guide", status: "draft", created_at: "2024-03-21" }
    ];
  }
}
export const cloudflareService = new CloudflareService();