import * as fs from 'fs';
import * as path from 'path';
import { ulid } from 'ulid';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { analyzeComponent } from './scanner.js';

/**
 * SKILL AUDITOR CLI TOOL
 * Part of the "Source of Truth" self-correction suite.
 */

const ROOT_SRC = path.resolve(findProjectRoot(process.cwd()), 'src');
const OUTPUT_DIR = path.resolve(findProjectRoot(process.cwd()), 'audit_cache');

/**
 * Robust Path Discovery: Walks up from CWD to find the project root
 */
function findProjectRoot(startDir: string): string {
    let curr = path.resolve(startDir);
    while (curr !== path.parse(curr).root) {
        if (fs.existsSync(path.join(curr, '.git')) || fs.existsSync(path.join(curr, 'package.json'))) {
            return curr;
        }
        curr = path.dirname(curr);
    }
    return startDir;
}

interface ComponentMetadata {
    description?: string;
    hasYolo: boolean;
    isSourceOfTruth: boolean;
    version?: string;
    dependencies?: string[];
}

interface Component {
    id: string;
    type: 'tool' | 'skill' | 'utility';
    name: string;
    path: string;
    metadata: ComponentMetadata;
    security?: any;
}

/**
 * Extracts YAML frontmatter using regex to avoid heavy deps.
 */
function parseSkillMetadata(content: string): Partial<ComponentMetadata> {
    const meta: Partial<ComponentMetadata> = {};
    const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
    
    if (frontmatterMatch) {
        const lines = frontmatterMatch[1].split('\n');
        for (const line of lines) {
            const [key, ...val] = line.split(':');
            if (key && val) {
                if (key.trim() === 'description') meta.description = val.join(':').trim();
            }
        }
    }
    
    meta.hasYolo = content.includes('--yolo') || content.includes('yolo mode');
    return meta;
}

/**
 * Scans a tool directory for version and dependency info.
 */
function parseToolMetadata(dirPath: string): Partial<ComponentMetadata> {
    const meta: Partial<ComponentMetadata> = { hasYolo: false };
    const pkgPath = path.join(dirPath, 'package.json');
    const indexPath = path.join(dirPath, 'index.ts');

    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            meta.version = pkg.version;
            meta.dependencies = Object.keys(pkg.dependencies || {});
        } catch (e) {
            // Silently skip corrupt JSON
        }
    }

    if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        meta.hasYolo = content.includes('--yolo') || content.includes('yolo: true');
    }

    return meta;
}

async function runInventory() {
    console.log(`[Inventory] Scanning ${ROOT_SRC}...`);
    const components: Component[] = [];

    const scanDirectory = (dir: string, type: 'skill' | 'tool') => {
        if (!fs.existsSync(dir)) return;
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                // Check if it's a component (has SKILL.md or package.json)
                const isSkill = fs.existsSync(path.join(fullPath, 'SKILL.md'));
                const isTool = fs.existsSync(path.join(fullPath, 'package.json'));

                if (isSkill || isTool) {
                    if (item === 'skill-auditor') continue; // Skip self

                    const metadata = isSkill 
                        ? parseSkillMetadata(fs.readFileSync(path.join(fullPath, 'SKILL.md'), 'utf8'))
                        : parseToolMetadata(fullPath);

                    components.push({
                        id: ulid(),
                        type: isSkill ? 'skill' : 'tool',
                        name: item,
                        path: fullPath,
                        metadata: {
                            isSourceOfTruth: true,
                            hasYolo: false,
                            ...metadata
                        }
                    });
                } else {
                    // Recurse deeper (e.g., into core/personal)
                    scanDirectory(fullPath, type);
                }
            } else if (item.endsWith('.ts') && type === 'tool') {
                // Individual utility file
                const content = fs.readFileSync(fullPath, 'utf8');
                components.push({
                    id: ulid(),
                    type: 'utility',
                    name: item,
                    path: fullPath,
                    metadata: {
                        isSourceOfTruth: true,
                        hasYolo: content.includes('--yolo')
                    }
                });
            }
        }
    };

    scanDirectory(path.join(ROOT_SRC, 'skills'), 'skill');
    scanDirectory(path.join(ROOT_SRC, 'tools'), 'tool');

    // 3. Write Manifest
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    const manifest = {
        timestamp: new Date().toISOString(),
        count: components.length,
        components
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`[Success] Manifest generated with ${components.length} components.`);
    console.log(`[Path] ${manifestPath}`);
}

async function runAnalysis() {
    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error("[Error] Manifest not found. Run 'inventory' first.");
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`[Analysis] Auditing ${manifest.components.length} components...`);

    const results = [];
    for (const comp of manifest.components) {
        console.log(`[Red Team] Reviewing: ${comp.name}...`);
        const security = analyzeComponent(comp.path);
        results.push({
            ...comp,
            security
        });
    }

    const scorecardPath = path.join(OUTPUT_DIR, 'security_scorecard.json');
    fs.writeFileSync(scorecardPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        results
    }, null, 2));

    console.log(`[Success] Security Scorecard generated: ${scorecardPath}`);
}

async function main() {
    const argv: any = yargs(hideBin(process.argv))
        .command('inventory', 'Generate a manifest of all skills and tools', {}, async () => {
            await runInventory();
        })
        .command('analyze', 'Perform security deep-dive on inventoried components', {}, async () => {
            await runAnalysis();
        })
        .demandCommand(1, 'Please provide a command')
        .help()
        .argv;
}

main();
