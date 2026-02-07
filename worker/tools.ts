import type { WeatherResult, ErrorResult } from './types';
import { mcpManager } from './mcp-client';
export type ToolResult = WeatherResult | { content: string } | ErrorResult | { data: any[] };
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string', description: 'The city or location name' } },
        required: ['location']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the web using Google or fetch content from a specific URL',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query for Google search' },
          url: { type: 'string', description: 'Specific URL to fetch content from (alternative to search)' }
        },
        required: []
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_cms_collections',
      description: 'List all content collections (schemas) defined in the CMS',
      parameters: { type: 'object', properties: {} }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_collection_entries',
      description: 'Get all content entries for a specific collection',
      parameters: {
        type: 'object',
        properties: { 
          collectionId: { type: 'string', description: 'The UUID of the collection' } 
        },
        required: ['collectionId']
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
export async function executeTool(name: string, args: Record<string, unknown>, controller?: any): Promise<ToolResult> {
  try {
    switch (name) {
      case 'get_weather':
        return {
          location: args.location as string,
          temperature: Math.floor(Math.random() * 40) - 10,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 100)
        };
      case 'web_search': {
        const { query } = args;
        return { content: `Search result for ${query}: This is a placeholder for web search functionality.` };
      }
      case 'list_cms_collections': {
        if (!controller) return { error: 'Controller not available' };
        const data = await controller.getCollections();
        return { data };
      }
      case 'get_collection_entries': {
        if (!controller) return { error: 'Controller not available' };
        const data = await controller.getEntries(args.collectionId as string);
        return { data };
      }
      default: {
        const content = await mcpManager.executeTool(name, args);
        return { content };
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}