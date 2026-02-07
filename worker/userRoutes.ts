import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/sessions', async (c) => {
        const controller = getAppController(c.env);
        return c.json({ success: true, data: await controller.listSessions() });
    });
    app.post('/api/sessions', async (c) => {
        const { title, sessionId: sid, firstMessage } = await c.req.json().catch(() => ({}));
        const sessionId = sid || crypto.randomUUID();
        await registerSession(c.env, sessionId, title || firstMessage?.slice(0, 30));
        return c.json({ success: true, data: { sessionId } });
    });
    // Public API for Astro
    app.get('/api/public/content/:slug', async (c) => {
        const controller = getAppController(c.env);
        const slug = c.req.param('slug');
        const collections = await controller.getCollections();
        const collection = collections.find(col => col.slug === slug);
        if (!collection) return c.json({ success: false, error: 'Collection not found' }, 404);
        const entries = await controller.getEntries(collection.id);
        const published = entries.filter(e => e.status === 'published');
        return c.json({ 
            success: true, 
            data: published.map(e => ({ id: e.id, ...e.data, updatedAt: e.updatedAt })) 
        });
    });
    // CMS Routes
    app.get('/api/cms/collections', async (c) => {
        const controller = getAppController(c.env);
        const data = await controller.getCollections();
        return c.json({ success: true, data });
    });
    app.post('/api/cms/collections', async (c) => {
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const collection = { ...body, id: crypto.randomUUID(), createdAt: Date.now() };
        await controller.createCollection(collection);
        return c.json({ success: true, data: collection });
    });
    app.get('/api/cms/entries/:collectionId', async (c) => {
        const controller = getAppController(c.env);
        const data = await controller.getEntries(c.req.param('collectionId'));
        return c.json({ success: true, data });
    });
    app.post('/api/cms/entries', async (c) => {
        const body = await c.req.json();
        const controller = getAppController(c.env);
        const entry = { 
            id: body.id || crypto.randomUUID(), 
            collectionId: body.collectionId,
            data: body.data,
            status: body.status,
            updatedAt: Date.now() 
        };
        await controller.createEntry(entry);
        return c.json({ success: true, data: entry });
    });
}