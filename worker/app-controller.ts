import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo } from './types';
import type { Env } from './core-utils';
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
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private collections = new Map<string, CMSCollection>();
  private entries = new Map<string, CMSEntry>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const storedSessions = await this.ctx.storage.get<Record<string, SessionInfo>>('sessions') || {};
      const storedCollections = await this.ctx.storage.get<Record<string, CMSCollection>>('collections') || {};
      const storedEntries = await this.ctx.storage.get<Record<string, CMSEntry>>('entries') || {};
      this.sessions = new Map(Object.entries(storedSessions));
      this.collections = new Map(Object.entries(storedCollections));
      this.entries = new Map(Object.entries(storedEntries));
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put({
      sessions: Object.fromEntries(this.sessions),
      collections: Object.fromEntries(this.collections),
      entries: Object.fromEntries(this.entries)
    });
  }
  // Session Methods
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, { id: sessionId, title: title || `Chat ${new Date(now).toLocaleDateString()}`, createdAt: now, lastActive: now });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) { session.lastActive = Date.now(); await this.persist(); }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) { session.title = title; await this.persist(); return true; }
    return false;
  }
  async getSessionCount(): Promise<number> { await this.ensureLoaded(); return this.sessions.size; }
  async clearAllSessions(): Promise<number> { await this.ensureLoaded(); const count = this.sessions.size; this.sessions.clear(); await this.persist(); return count; }
  // CMS Methods
  async createCollection(collection: CMSCollection): Promise<void> {
    await this.ensureLoaded();
    this.collections.set(collection.id, collection);
    await this.persist();
  }
  async getCollections(): Promise<CMSCollection[]> {
    await this.ensureLoaded();
    return Array.from(this.collections.values());
  }
  async createEntry(entry: CMSEntry): Promise<void> {
    await this.ensureLoaded();
    this.entries.set(entry.id, entry);
    await this.persist();
  }
  async getEntries(collectionId: string): Promise<CMSEntry[]> {
    await this.ensureLoaded();
    return Array.from(this.entries.values()).filter(e => e.collectionId === collectionId);
  }
}