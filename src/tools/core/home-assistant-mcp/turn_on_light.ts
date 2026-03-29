import { HAClient } from './ha-client.js';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

function findProjectRoot(startDir: string): string {
    let curr = path.resolve(startDir);
    while (curr !== path.parse(curr).root) {
        if (fs.existsSync(path.join(curr, '.secrets'))) return curr;
        curr = path.dirname(curr);
    }
    return startDir;
}

const PROJECT_ROOT = findProjectRoot(process.cwd());
const SECRETS_PATH = path.join(PROJECT_ROOT, '.secrets/home-assistant.env');
dotenv.config({ path: SECRETS_PATH });

const ha = new HAClient(process.env.HA_URL!, process.env.HA_TOKEN!);

async function main() {
    console.log("Turning on Living Room Lamp...");
    try {
        const result = await ha.callService({
            domain: 'light',
            service: 'turn_on',
            entity_id: 'light.wiz_rgbw_tunable_68c3b4'
        });
        console.log("Success! Affected entities:", result.length);
    } catch (err: any) {
        console.error("Failed:", err.message);
    }
}

main();
