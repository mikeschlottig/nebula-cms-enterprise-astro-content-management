import type { DurableObject, DurableObjectState } from '@cloudflare/workers-types';
import type { Env } from './core-utils';
import type { SessionInfo } from './types';
export interface CMSCollection {
  id: string;
  name: string;
  slug: string;
  fields: Array<{ name: string; type: string }>;
  createdAt: number;
}
export interface CMSEntry {
  id: string;
  collectionId: string;
  data: Record<string, any>;
  status: 'draft' | 'published';
  updatedAt: number;
}
/**
 * Durable Object acting as the CMS Controller / persistence layer.
 * Note: Implements DurableObject for proper Workers typing.
 */
export class AppController implements DurableObject {
  private sessions = new Map<string, SessionInfo>();
  private collections = new Map<string, CMSCollection>();
  private entries = new Map<string, CMSEntry>();
  private loaded = false;
  constructor(private state: DurableObjectState, private env: Env) {
    void this.env; // reserved for future use
  }
  // The runtime requires fetch() on DurableObject implementations.
  // This project uses RPC-style method calls from stubs; fetch is a safe fallback.
  async fetch(_request: Request): Promise<Response> {
    return new Response('Not Found', { status: 404 });
  }
  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    const storedSessions =
      (await this.state.storage.get<Record<string, SessionInfo>>('sessions')) ?? {};
    const storedCollections =
      (await this.state.storage.get<Record<string, CMSCollection>>('collections')) ?? {};
    const storedEntries =
      (await this.state.storage.get<Record<string, CMSEntry>>('entries')) ?? {};
    this.sessions = new Map(Object.entries(storedSessions));
    this.collections = new Map(Object.entries(storedCollections));
    this.entries = new Map(Object.entries(storedEntries));
    this.loaded = true;
  }
  private async persist(): Promise<void> {
    await this.state.storage.put({
      sessions: Object.fromEntries(this.sessions),
      collections: Object.fromEntries(this.collections),
      entries: Object.fromEntries(this.entries),
    });
  }
  // ---- Session management (public for RPC access) ----
  public async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now,
    });
    await this.persist();
  }
  public async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  public async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  public async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.lastActive = Date.now();
    await this.persist();
  }
  public async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    session.title = title;
    await this.persist();
    return true;
  }
  // ---- CMS Collections / Entries (public for RPC access) ----
  public async createCollection(collection: CMSCollection): Promise<void> {
    await this.ensureLoaded();
    this.collections.set(collection.id, collection);
    await this.persist();
  }
  public async getCollections(): Promise<CMSCollection[]> {
    await this.ensureLoaded();
    return Array.from(this.collections.values());
  }
  public async createEntry(entry: CMSEntry): Promise<void> {
    await this.ensureLoaded();
    this.entries.set(entry.id, entry);
    await this.persist();
  }
  public async getEntries(collectionId: string): Promise<CMSEntry[]> {
    await this.ensureLoaded();
    return Array.from(this.entries.values()).filter((e) => e.collectionId === collectionId);
  }
}