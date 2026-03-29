#!/usr/bin/env node --import tsx
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

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

const PROJECT_ROOT = findProjectRoot(process.cwd());
const SECRETS_PATH = path.join(PROJECT_ROOT, '.secrets/home-assistant.env');

if (fs.existsSync(SECRETS_PATH)) {
    dotenv.config({ path: SECRETS_PATH });
    console.log(`[HA MCP] Loaded configuration from sandbox.`);
} else {
    console.warn(`[HA MCP] Warning: Sandbox config not found at ${SECRETS_PATH}. Falling back to local .env`);
    dotenv.config();
}

const HA_URL = process.env.HA_URL;
const HA_TOKEN = process.env.HA_TOKEN;

if (!HA_URL || !HA_TOKEN) {
    console.error(`[HA MCP] Error: HA_URL and HA_TOKEN must be set in the environment.`);
    process.exit(1);
}

console.log(`[HA MCP] Initialized successfully.`);
console.log(`[HA MCP] Target HA URL: ${HA_URL}`);
// Intentionally not logging the token for security

// TODO: Initialize MCP Server here in Step 3
