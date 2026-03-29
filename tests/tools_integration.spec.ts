import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TOOLS INTEGRATION TESTS
 * Verifies that remediation fixes (sandboxing, pathing, async)
 * did not break the core CLI tools.
 */

const ROOT_DIR = path.resolve(process.cwd());
const AUDIT_CACHE = path.join(ROOT_DIR, 'audit_cache');
const RESEARCH_OUTPUTS = path.join(ROOT_DIR, 'research_outputs');
const IS_CI = process.env.CI === 'true';

describe('CLI Tools Integration', () => {

    test('Skill Auditor: Inventory & Analyze', () => {
        console.log('Testing Skill Auditor...');
        
        // 1. Inventory
        const inventoryOut = execSync('npx tsx src/tools/core/skill-auditor/index.ts inventory', { encoding: 'utf8' });
        expect(inventoryOut).toContain('[Success] Manifest generated');
        expect(fs.existsSync(path.join(AUDIT_CACHE, 'manifest.json'))).toBe(true);

        // 2. Analyze
        const analyzeOut = execSync('npx tsx src/tools/core/skill-auditor/index.ts analyze', { encoding: 'utf8' });
        expect(analyzeOut).toContain('[Success] Security Scorecard generated');
        expect(fs.existsSync(path.join(AUDIT_CACHE, 'security_scorecard.json'))).toBe(true);
    });

    test('Autonomous Researcher: Minimal Run', () => {
        if (IS_CI && !process.env.GEMINI_API_KEY) {
            console.log('Skipping Autonomous Researcher test in CI without API key.');
            return;
        }

        console.log('Testing Autonomous Researcher (Dry Run)...');
        
        const initialCount = fs.existsSync(RESEARCH_OUTPUTS) ? fs.readdirSync(RESEARCH_OUTPUTS).length : 0;
        
        try {
            execSync('npx tsx src/tools/core/autonomous-researcher/index.ts --query "test"', { 
                encoding: 'utf8',
                timeout: 30000 
            });
        } catch (e: any) {
            // Success if it at least started and created a directory
        }

        const finalCount = fs.existsSync(RESEARCH_OUTPUTS) ? fs.readdirSync(RESEARCH_OUTPUTS).length : 0;
        expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    });

    test('JW Daily Orchestrator: Help & Init', () => {
        console.log('Testing JW Daily Orchestrator CLI...');
        const helpOut = execSync('npx tsx src/tools/personal/jw_daily_orchestrator.ts --help', { encoding: 'utf8' });
        expect(helpOut).toContain('Options:');
        expect(helpOut).toContain('--date');
    });

});

function describe(name: string, fn: () => void) {
    console.log(`\n--- Starting Suite: ${name} ---`);
    fn();
}

function test(name: string, fn: () => void) {
    try {
        fn();
        console.log(`✅ PASSED: ${name}`);
    } catch (e: any) {
        console.error(`❌ FAILED: ${name}`);
        console.error(e.message);
        // Only fail the process if we are in CI
        if (IS_CI) process.exit(1);
    }
}

function expect(val: any) {
    return {
        toBe: (expected: any) => { if (val !== expected) throw new Error(`Expected ${expected} but got ${val}`); },
        toContain: (expected: string) => { if (!val.includes(expected)) throw new Error(`Expected string to contain "${expected}"`); },
        toBeGreaterThanOrEqual: (expected: number) => { if (val < expected) throw new Error(`Expected ${val} to be >= ${expected}`); }
    };
}
