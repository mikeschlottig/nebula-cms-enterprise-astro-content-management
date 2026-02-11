import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession } from "./core-utils";
export function coreRoutes(app: Hono<any>) {
  app.all('/api/chat/:sessionId/*', async (c: any) => {
    try {
      const sessionId = c.req.param('sessionId');
      const agent = await getAgentByName((c.env as Env).CHAT_AGENT, sessionId);
      const url = new URL(c.req.url);
      url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
      return agent.fetch(
        new Request(url.toString(), {
          method: c.req.method,
          headers: c.req.header(),
          body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body,
        })
      );
    } catch (error) {
      console.error('[coreRoutes] Agent routing failed:', error);
      return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, 500);
    }
  });
}
export function userRoutes(app: Hono<any>) {
  app.get('/api/sessions', async (c: any) => {
    const controller = getAppController(c.env as Env);
    const sessions = await (controller as any).listSessions();
    return c.json({ success: true, data: sessions });
  });
  app.post('/api/sessions', async (c: any) => {
    const { title, sessionId: sid, firstMessage } = await c.req.json().catch(() => ({}));
    const sessionId = sid || crypto.randomUUID();
    await registerSession(c.env as Env, sessionId, title || firstMessage?.slice(0, 30));
    return c.json({ success: true, data: { sessionId } });
  });
  app.get('/api/public/content/:slug', async (c: any) => {
    const controller = getAppController(c.env as Env);
    const slug = c.req.param('slug');
    const collections = await (controller as any).getCollections();
    const collection = (collections as any[]).find((col) => col.slug === slug);
    if (!collection) return c.json({ success: false, error: 'Collection not found' }, 404);
    const entries = await (controller as any).getEntries(collection.id);
    const published = (entries as any[]).filter((e) => e.status === 'published');
    return c.json({
      success: true,
      data: published.map((e) => ({ id: e.id, ...e.data, updatedAt: e.updatedAt })),
    });
  });
  app.get('/api/cms/collections', async (c: any) => {
    const controller = getAppController(c.env as Env);
    const data = await (controller as any).getCollections();
    return c.json({ success: true, data });
  });
  app.post('/api/cms/collections', async (c: any) => {
    const body = await c.req.json();
    const controller = getAppController(c.env as Env);
    const collection = { ...body, id: crypto.randomUUID(), createdAt: Date.now() };
    await (controller as any).createCollection(collection);
    return c.json({ success: true, data: collection });
  });
  app.get('/api/cms/entries/:collectionId', async (c: any) => {
    const controller = getAppController(c.env as Env);
    const data = await (controller as any).getEntries(c.req.param('collectionId'));
    return c.json({ success: true, data });
  });
  app.post('/api/cms/entries', async (c: any) => {
    const body = await c.req.json();
    const controller = getAppController(c.env as Env);
    const entry = {
      id: body.id || crypto.randomUUID(),
      collectionId: body.collectionId,
      data: body.data,
      status: body.status,
      updatedAt: Date.now(),
    };
    await (controller as any).createEntry(entry);
    return c.json({ success: true, data: entry });
  });
}