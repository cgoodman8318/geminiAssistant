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

// ─── Configuration ────────────────────────────────────────────────────────────

function findProjectRootContainingSecrets(startDirectory: string): string {
  let currentDirectory = path.resolve(startDirectory);
  while (currentDirectory !== path.parse(currentDirectory).root) {
    if (fs.existsSync(path.join(currentDirectory, '.secrets'))) {
      return currentDirectory;
    }
    currentDirectory = path.dirname(currentDirectory);
  }
  return startDirectory;
}

const projectRootDirectory = findProjectRootContainingSecrets(process.cwd());
const secretsFilePath = path.join(projectRootDirectory, '.secrets', 'google-maps.env');

if (fs.existsSync(secretsFilePath)) {
  dotenv.config({ path: secretsFilePath });
} else {
  dotenv.config();
}

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
if (!googleMapsApiKey) {
  console.error('[Google Maps MCP] Error: GOOGLE_MAPS_API_KEY must be set in .secrets/google-maps.env');
  process.exit(1);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeocodeResult {
  inputAddress: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  status: string;
}

interface GeocodeFailure {
  inputAddress: string;
  status: string;
  error: string;
}

type GeocodingOutcome = GeocodeResult | GeocodeFailure;

// ─── Geocoding Logic ──────────────────────────────────────────────────────────

const GOOGLE_GEOCODING_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json';

async function geocodeSingleAddress(
  rawAddress: string,
  apiKey: string
): Promise<GeocodingOutcome> {
  const encodedAddress = encodeURIComponent(rawAddress);
  const requestUrl = `${GOOGLE_GEOCODING_API_ENDPOINT}?address=${encodedAddress}&key=${apiKey}`;

  const httpResponse = await fetch(requestUrl);
  if (!httpResponse.ok) {
    return {
      inputAddress: rawAddress,
      status: 'HTTP_ERROR',
      error: `HTTP ${httpResponse.status}: ${httpResponse.statusText}`,
    };
  }

  const responsePayload = (await httpResponse.json()) as any;
  const apiStatus: string = responsePayload.status;

  if (apiStatus !== 'OK') {
    return {
      inputAddress: rawAddress,
      status: apiStatus,
      error: `Google Geocoding API returned status: ${apiStatus}`,
    };
  }

  const firstResult = responsePayload.results[0];
  const locationCoordinates = firstResult.geometry.location;

  return {
    inputAddress: rawAddress,
    formattedAddress: firstResult.formatted_address as string,
    latitude: locationCoordinates.lat as number,
    longitude: locationCoordinates.lng as number,
    status: apiStatus,
  };
}

// ─── MCP Server ───────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: 'google-maps-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'geocode_address',
      description:
        'Convert a street address or place name into latitude/longitude coordinates using the Google Geocoding API.',
      inputSchema: {
        type: 'object',
        properties: {
          address: {
            type: 'string',
            description: 'The address or place name to geocode (e.g., "1600 Amphitheatre Parkway, Mountain View, CA")',
          },
        },
        required: ['address'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'geocode_address': {
        const { address } = args as { address: string };
        const geocodingOutcome = await geocodeSingleAddress(address, googleMapsApiKey!);
        return {
          content: [{ type: 'text', text: JSON.stringify(geocodingOutcome, null, 2) }],
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

// ─── Entry Point ──────────────────────────────────────────────────────────────

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Google Maps MCP] Server running on stdio');
}

runServer().catch((error) => {
  console.error('[Google Maps MCP] Fatal error:', error);
  process.exit(1);
});
