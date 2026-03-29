#!/usr/bin/env node --import tsx
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { HAClient } from './ha-client.js';

/**
 * Robust Path Discovery: Walks up from CWD to find the project root
 */
function findProjectRoot(startDir: string): string {
    let curr = path.resolve(startDir);
    while (curr !== path.parse(curr).root) {
        if (fs.existsSync(path.join(curr, '.secrets'))) {
            return curr;
        }
        curr = path.dirname(curr);
    }
    return startDir;
}

// 1. Load Configuration
const PROJECT_ROOT = findProjectRoot(process.cwd());
const SECRETS_PATH = path.join(PROJECT_ROOT, '.secrets/home-assistant.env');

if (fs.existsSync(SECRETS_PATH)) {
    dotenv.config({ path: SECRETS_PATH });
} else {
    dotenv.config();
}

const HA_URL = process.env.HA_URL;
const HA_TOKEN = process.env.HA_TOKEN;

if (!HA_URL || !HA_TOKEN) {
    console.error(`[HA MCP] Error: HA_URL and HA_TOKEN must be set in the environment.`);
    process.exit(1);
}

// 2. Initialize Backend Client
const ha = new HAClient(HA_URL, HA_TOKEN);

// 3. Initialize MCP Server
const server = new Server(
  {
    name: 'home-assistant-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 4. Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_ha_states',
      description: 'List the current state of all entities in Home Assistant.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_ha_state',
      description: 'Get the detailed state and attributes of a specific entity.',
      inputSchema: {
        type: 'object',
        properties: {
          entity_id: {
            type: 'string',
            description: 'The entity ID (e.g., light.living_room)',
          },
        },
        required: ['entity_id'],
      },
    },
    {
      name: 'call_ha_service',
      description: 'Call any Home Assistant service to control devices.',
      inputSchema: {
        type: 'object',
        properties: {
          domain: {
            type: 'string',
            description: 'The service domain (e.g., light, switch, script)',
          },
          service: {
            type: 'string',
            description: 'The service name (e.g., turn_on, toggle, reload)',
          },
          entity_id: {
            type: 'string',
            description: 'The target entity ID (optional)',
          },
          service_data: {
            type: 'object',
            description: 'Optional extra data for the service (e.g., brightness: 255)',
          },
        },
        required: ['domain', 'service'],
      },
    },
    {
        name: 'list_ha_services',
        description: 'Returns the full registry of available services in Home Assistant.',
        inputSchema: { type: 'object', properties: {} }
    },
    {
        name: 'list_ha_automations',
        description: 'List all current automation configurations.',
        inputSchema: { type: 'object', properties: {} }
    },
    {
        name: 'get_ha_automation_config',
        description: 'Get the full configuration for a specific automation.',
        inputSchema: {
            type: 'object',
            properties: {
                automation_id: { type: 'string', description: 'The unique ID of the automation' }
            },
            required: ['automation_id']
        }
    },
    {
        name: 'save_ha_automation',
        description: 'Create or update an automation configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                automation_id: { type: 'string', description: 'The unique ID to use for this automation' },
                config: { type: 'object', description: 'The automation configuration object (trigger, condition, action)' }
            },
            required: ['automation_id', 'config']
        }
    },
    {
        name: 'delete_ha_automation',
        description: 'Remove an automation configuration.',
        inputSchema: {
            type: 'object',
            properties: {
                automation_id: { type: 'string', description: 'The unique ID of the automation to delete' }
            },
            required: ['automation_id']
        }
    },
    {
        name: 'list_ha_config_entries',
        description: 'List all installed integrations and their status.',
        inputSchema: { type: 'object', properties: {} }
    },
    {
        name: 'reload_ha_config_entry',
        description: 'Force a specific integration to restart.',
        inputSchema: {
            type: 'object',
            properties: {
                entry_id: { type: 'string', description: 'The ID of the config entry to reload' }
            },
            required: ['entry_id']
        }
    }
  ],
}));

// 5. Handle Tool Calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_ha_states': {
        const states = await ha.getStates();
        const simplified = states.map(s => ({
            entity_id: s.entity_id,
            state: s.state,
            friendly_name: s.attributes.friendly_name || ''
        }));
        return {
          content: [{ type: 'text', text: JSON.stringify(simplified, null, 2) }],
        };
      }

      case 'get_ha_state': {
        const { entity_id } = args as { entity_id: string };
        const state = await ha.getState(entity_id);
        if (!state) {
            return {
                content: [{ type: 'text', text: `Entity not found: ${entity_id}` }],
                isError: true
            };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(state, null, 2) }],
        };
      }

      case 'call_ha_service': {
        const { domain, service, entity_id, service_data } = args as any;
        const result = await ha.callService({ domain, service, entity_id, service_data });
        return {
          content: [{ type: 'text', text: `Service successfully called. Affected entities: ${result.length}` }],
        };
      }

      case 'list_ha_services': {
        const services = await ha.getServices();
        return {
          content: [{ type: 'text', text: JSON.stringify(services, null, 2) }],
        };
      }

      case 'list_ha_automations': {
        const automations = await ha.getAutomations();
        return {
          content: [{ type: 'text', text: JSON.stringify(automations, null, 2) }],
        };
      }

      case 'get_ha_automation_config': {
        const { automation_id } = args as { automation_id: string };
        const config = await ha.getAutomationConfig(automation_id);
        return {
          content: [{ type: 'text', text: JSON.stringify(config, null, 2) }],
        };
      }

      case 'save_ha_automation': {
        const { automation_id, config } = args as { automation_id: string, config: any };
        const result = await ha.saveAutomation(automation_id, config);
        return {
          content: [{ type: 'text', text: `Automation saved successfully: ${JSON.stringify(result)}` }],
        };
      }

      case 'delete_ha_automation': {
        const { automation_id } = args as { automation_id: string };
        const result = await ha.deleteAutomation(automation_id);
        return {
          content: [{ type: 'text', text: `Automation deleted successfully: ${JSON.stringify(result)}` }],
        };
      }

      case 'list_ha_config_entries': {
        const entries = await ha.getConfigEntries();
        return {
          content: [{ type: 'text', text: JSON.stringify(entries, null, 2) }],
        };
      }

      case 'reload_ha_config_entry': {
        const { entry_id } = args as { entry_id: string };
        const result = await ha.reloadConfigEntry(entry_id);
        return {
          content: [{ type: 'text', text: `Config entry reloaded successfully: ${JSON.stringify(result)}` }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: error.message }],
      isError: true,
    };
  }
});

// 6. Connect & Run
async function runServer() {
  if (process.argv.includes('--test')) {
    console.error('[HA MCP] Running in test mode: Listing lights...');
    try {
      const states = await ha.getStates();
      const lights = states.filter(s => s.entity_id.startsWith('light.'));
      console.log(JSON.stringify(lights.map(l => ({
        entity_id: l.entity_id,
        state: l.state,
        friendly_name: l.attributes.friendly_name
      })), null, 2));
      process.exit(0);
    } catch (err: any) {
      console.error(`[HA MCP] Test failed: ${err.message}`);
      process.exit(1);
    }
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr because stdout is used for MCP messages
  console.error('[HA MCP] Server running on stdio');
}

runServer().catch((error) => {
  console.error('[HA MCP] Fatal error:', error);
  process.exit(1);
});
