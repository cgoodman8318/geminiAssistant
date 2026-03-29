import * as fs from 'fs';
import * as path from 'path';
import { ulid } from 'ulid';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

/**
 * SKILL AUDITOR CLI TOOL
 * Part of the "Source of Truth" self-correction suite.
 */

const ROOT_SRC = path.resolve(process.cwd(), 'src');
const OUTPUT_DIR = path.resolve(process.cwd(), 'audit_cache');

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

    // 1. Scan Skills
    const skillsDir = path.join(ROOT_SRC, 'skills');
    if (fs.existsSync(skillsDir)) {
        const skillFolders = fs.readdirSync(skillsDir);
        for (const folder of skillFolders) {
            const fullPath = path.join(skillsDir, folder);
            if (fs.statSync(fullPath).isDirectory()) {
                const skillFile = path.join(fullPath, 'SKILL.md');
                if (fs.existsSync(skillFile)) {
                    const content = fs.readFileSync(skillFile, 'utf8');
                    components.push({
                        id: ulid(),
                        type: 'skill',
                        name: folder,
                        path: fullPath,
                        metadata: {
                            isSourceOfTruth: true,
                            hasYolo: false,
                            ...parseSkillMetadata(content)
                        }
                    });
                }
            }
        }
    }

    // 2. Scan Tools
    const toolsDir = path.join(ROOT_SRC, 'tools');
    if (fs.existsSync(toolsDir)) {
        const toolItems = fs.readdirSync(toolsDir);
        for (const item of toolItems) {
            const fullPath = path.join(toolsDir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                // Skip self to prevent recursion
                if (item === 'skill-auditor') {
                    console.log(`[Inventory] Skipping self: ${item}`);
                    continue;
                }

                components.push({
                    id: ulid(),
                    type: 'tool',
                    name: item,
                    path: fullPath,
                    metadata: {
                        isSourceOfTruth: true,
                        ...parseToolMetadata(fullPath)
                    }
                });
            } else if (item.endsWith('.ts')) {
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
    }

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

async function main() {
    const argv: any = yargs(hideBin(process.argv))
        .command('inventory', 'Generate a manifest of all skills and tools', {}, async () => {
            await runInventory();
        })
        .demandCommand(1, 'Please provide a command')
        .help()
        .argv;
}

main();
