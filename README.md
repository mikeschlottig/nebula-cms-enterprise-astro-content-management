# Cloudflare AI Chat Agent

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/nebula-cms-enterprise-astro-content-management)

A production-ready full-stack AI chat application built with Cloudflare Workers, Durable Objects, and the Agents SDK. Features multi-session conversations, streaming responses, tool calling (weather, web search, MCP integration), and a modern React frontend.

## ✨ Key Features

- **Multi-Session Chat**: Persistent conversations stored in Durable Objects with full session management (list, create, delete, rename).
- **AI-Powered Responses**: Integrated with Cloudflare AI Gateway using models like Gemini 2.5 Flash/Pro.
- **Tool Calling**: Built-in tools for weather, web search (SerpAPI), and extensible MCP (Model Context Protocol) tools.
- **Streaming UI**: Real-time streaming responses with React frontend.
- **Modern UI**: Tailwind CSS + shadcn/ui components, dark mode, responsive design.
- **Production-Ready**: Type-safe TypeScript, error handling, CORS, logging, and client error reporting.
- **Session Control**: REST APIs for managing chats with automatic title generation.
- **Extensible**: Easy to add custom tools, routes, and AI models.

## 🛠️ Tech Stack

- **Backend**: Cloudflare Workers, Hono, Durable Objects, Agents SDK, OpenAI SDK
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Router
- **AI**: Cloudflare AI Gateway, Gemini models
- **Tools**: SerpAPI (search), MCP SDK (extensible tools)
- **Build**: Bun, TypeScript 5, Wrangler
- **UI Libraries**: Lucide icons, Sonner (toasts), Framer Motion

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) installed
- Cloudflare account with Workers enabled
- Cloudflare AI Gateway setup (for AI models)
- Optional: SerpAPI key for web search

### Installation

1. Clone or download the project.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Configure environment variables in `wrangler.jsonc`:
   ```json
   "vars": {
     "CF_AI_BASE_URL": "https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai",
     "CF_AI_API_KEY": "{your_ai_gateway_token}",
     "SERPAPI_KEY": "{your_serpapi_key}"  // Optional
   }
   ```
4. Generate types:
   ```bash
   bun run cf-typegen
   ```

## 💻 Local Development

1. Start the development server:
   ```bash
   bun run dev
   ```
   - Frontend: http://localhost:3000 (Vite HMR)
   - Worker: Proxies API routes

2. Open http://localhost:3000 in your browser.

3. **Hot Reload**: Frontend changes apply instantly. Worker changes require redeploy or `wrangler dev`.

### Scripts

- `bun run dev`: Development server (frontend + worker proxy)
- `bun run build`: Build for production
- `bun run preview`: Preview production build
- `bun run lint`: Lint code
- `bun run cf-typegen`: Update Worker types

## 🌐 Usage

### Chat Sessions

- **Create Session**: `POST /api/sessions` with `{ title?, firstMessage? }`
- **List Sessions**: `GET /api/sessions`
- **Delete Session**: `DELETE /api/sessions/:id`
- **Rename**: `PUT /api/sessions/:id/title` with `{ title }`

### Chat API

For a session `/api/chat/:sessionId`:

- **Send Message**: `POST /chat` `{ message, model?, stream? }`
- **Get State**: `GET /messages`
- **Clear Chat**: `DELETE /clear`
- **Change Model**: `POST /model` `{ model }`

### Frontend

- Responsive chat UI with session sidebar.
- Streaming messages, model selector, copy/share.
- Theme toggle (light/dark).

## 🚀 Deployment

Deploy to Cloudflare Workers in one command:

```bash
bun run deploy
```

This builds the frontend, bundles the Worker, and deploys via Wrangler.

### Production Configuration

1. Update `wrangler.jsonc`:
   - Set `name` to your project name.
   - Configure bindings and migrations.
   - Add secrets: `wrangler secret put SERPAPI_KEY`

2. Custom Domain:
   ```bash
   wrangler pages deploy --project-name=your-project
   ```

3. Environment Variables:
   ```bash
   wrangler secret put CF_AI_API_KEY
   wrangler secret put SERPAPI_KEY
   ```

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mikeschlottig/nebula-cms-enterprise-astro-content-management)

## 🔧 Extending the App

### Add Custom Tools

1. Edit `worker/tools.ts`: Add to `customTools` array.
2. Implement `executeTool` case for your tool.
3. AI will automatically use tools via function calling.

### Add MCP Servers

Edit `worker/mcp-client.ts` `MCP_SERVERS` array:
```ts
{
  name: 'my-server',
  sseUrl: 'https://your-mcp-server/sse'
}
```

### Custom Routes

Add to `worker/userRoutes.ts` `userRoutes(app)`.

### New AI Models

Update `src/lib/chat.ts` `MODELS` array and use in UI.

### Frontend Customization

- Edit `src/pages/HomePage.tsx` for main UI.
- Use shadcn/ui components from `src/components/ui/`.
- Hooks: `useTheme`, `useMobile`.

## 🐛 Troubleshooting

- **AI Gateway Errors**: Verify `CF_AI_BASE_URL` and token.
- **Types Missing**: Run `bun run cf-typegen`.
- **CORS Issues**: Routes auto-handle `/api/*`.
- **Sessions Not Persisting**: Check Durable Objects bindings.
- **Logs**: Use `wrangler tail` for Worker logs.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch.
3. Submit PR with clear description.

Built with ❤️ by Cloudflare Workers Templates. Questions? [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)