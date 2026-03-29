import * as fs from 'fs';
import * as path from 'path';

export interface Violation {
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    rule: string;
    message: string;
    file: string;
    line?: number;
}

export interface SecurityResult {
    score: number;
    violations: Violation[];
}

const RULES = [
    {
        id: 'SEC_HARDCODED_KEY',
        pattern: /AIza[0-9A-Za-z\-_]{35}/,
        severity: 'CRITICAL',
        message: 'Potential hardcoded Google API Key detected.'
    },
    {
        id: 'SEC_YOLO_FLAG',
        pattern: /\-\-yolo|approval-mode=yolo|yolo\s*mode|yolo\s*:\s*true/gi,
        severity: 'HIGH',
        message: 'Usage of prohibited YOLO mode detected.'
    },
    {
        id: 'SEC_UNSAFE_EXEC',
        pattern: /(execSync|spawnSync)\(/g,
        severity: 'MEDIUM',
        message: 'Synchronous shell execution detected. Prefer async or Plan Mode compliant tools.'
    },
    {
        id: 'ARCH_SOURCE_OF_TRUTH',
        pattern: /C:\\Users\\cgood\\project_julia\\Tooling\\(?!geminiAssistant)/,
        severity: 'MEDIUM',
        message: 'Hardcoded local path detected outside of the Source of Truth repository.'
    }
];

export function analyzeComponent(componentPath: string): SecurityResult {
    const violations: Violation[] = [];
    let score = 100;

    const files = getAllFiles(componentPath);

    for (const file of files) {
        // Skip non-source files
        if (file.includes('node_modules') || file.includes('.git') || file.includes('audit_cache')) continue;
        
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');

        for (const rule of RULES) {
            // Context Awareness: Don't flag "yolo" in the auditor's own instructions or manifests
            if (rule.id === 'SEC_YOLO_FLAG' && (file.includes('skill-auditor') || file.endsWith('.json'))) continue;

            if (rule.pattern.test(content)) {
                // Find line number
                const lineIndex = lines.findIndex(l => rule.pattern.test(l));
                
                violations.push({
                    severity: rule.severity as any,
                    rule: rule.id,
                    message: rule.message,
                    file: path.relative(process.cwd(), file),
                    line: lineIndex !== -1 ? lineIndex + 1 : undefined
                });

                // Adjust Score
                if (rule.severity === 'CRITICAL') score -= 100;
                else if (rule.severity === 'HIGH') score -= 50;
                else if (rule.severity === 'MEDIUM') score -= 20;
                else score -= 10;
            }
        }

        // Check for missing try/catch in async functions (Simplified)
        if (file.endsWith('.ts') || file.endsWith('.js')) {
            if (content.includes('async ') && !content.includes('catch')) {
                violations.push({
                    severity: 'MEDIUM',
                    rule: 'LOGIC_MISSING_ERROR_HANDLING',
                    message: 'Async function detected without a visible catch block.',
                    file: path.relative(process.cwd(), file)
                });
                score -= 20;
            }
        }
    }

    return {
        score: Math.max(0, score),
        violations
    };
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.statSync(dir).isDirectory()) {
        return [dir];
    }
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getAllFiles(name, fileList);
        } else {
            fileList.push(name);
        }
    });
    return fileList;
}
