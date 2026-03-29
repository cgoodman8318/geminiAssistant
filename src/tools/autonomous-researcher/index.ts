import * as fs from 'fs';
import * as path from 'path';
import { ulid } from 'ulid';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Path to the secure root-level secrets file
const SECRETS_PATH = path.resolve(process.cwd(), '../../../../.secrets/researcher.env');
const OUTPUT_ROOT = path.resolve(process.cwd(), '../../../../research_outputs');

dotenv.config({ path: SECRETS_PATH });

/**
 * SYSTEM SPECIFICATION: CASS-Compatible Autonomous Research Agent
 * 
 * Philosophy: Step-Based State Machine with a Write-Ahead Log (WAL).
 * Resilience: Survive hard crashes and resume cleanly.
 */

// --- Configuration & Constants ---
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error(`Error: GEMINI_API_KEY environment variable is required at ${SECRETS_PATH}`);
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Multi-Model Configuration for Free Tier optimization and specialized tasks
const MODELS = {
    PLANNER: "gemini-2.5-flash",           
    SEARCHER: "gemini-2.5-flash-lite",    
    SYNTHESIZER: "gemini-2.5-flash", 
    DEEP_RESEARCH: "models/deep-research-pro-preview-12-2025" 
};

const WAL_FILENAME = 'report_status.jsonl';
const LOG_FILENAME = 'report_log.md';
const REPORT_FILENAME = 'report.md';

// --- Types ---
/**
 * @typedef {Object} WALEntry
 * @property {string} ulid
 * @property {string} stepId
 * @property {"INIT" | "QUERY_PLAN" | "SEARCH_LOOP" | "SYNTHESIS" | "WRAP_UP"} intent
 * @property {"STARTED" | "RUNNING" | "COMPLETED" | "FAILED"} status
 * @property {number | null} subIndex
 * @property {any} data
 * @property {string} ts
 */

// --- Core Utilities ---

/**
 * Safe WAL Parser: Reads line-by-line and stops at the first corruption.
 */
function safeReadJSONL(filePath: string): any[] {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const validEntries = [];
    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            validEntries.push(JSON.parse(line));
        } catch (err) {
            console.warn(`[WAL] Corrupt line detected and truncated: ${line.substring(0, 30)}...`);
            break;
        }
    }
    return validEntries;
}

/**
 * Appends an entry to the WAL file.
 */
function appendToWAL(dir: string, entry: any): any {
    const filePath = path.join(dir, WAL_FILENAME);
    const fullEntry = {
        ulid: ulid(),
        ts: new Date().toISOString(),
        ...entry
    };
    fs.appendFileSync(filePath, JSON.stringify(fullEntry) + '\n');
    return fullEntry;
}

/**
 * Logs raw data/responses for debugging.
 */
function logDebug(dir: string, content: string): void {
    const filePath = path.join(dir, LOG_FILENAME);
    fs.appendFileSync(filePath, `\n---\nTimestamp: ${new Date().toISOString()}\n${content}\n`);
}

/**
 * Execute a grounded search using Google Search Tool
 */
async function executeGroundedSearch(dir: string, query: string): Promise<{ ok: boolean, summary?: string, links?: any[], error?: string }> {
    try {
        const model = genAI.getGenerativeModel({ model: MODELS.SEARCHER });
        // Using Google Search Grounding tool
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: `Search for information on: ${query}. Summarize the key findings and provide specific URLs found.` }] }],
            tools: [{ googleSearch: {} } as any],
        });

        const response = await result.response;
        const text = response.text();
        
        // Extract links from grounding metadata if available
        let links: any[] = [];
        const metadata: any = response.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
            links = metadata.groundingChunks
                .filter((chunk: any) => chunk.web && chunk.web.uri)
                .map((chunk: any) => ({ title: chunk.web.title, url: chunk.web.uri }));
        }

        return { ok: true, summary: text, links };
    } catch (err: any) {
        return { ok: false, error: err.message };
    }
}

// --- Execution Phases ---

async function runPhase1_QueryPlanning(dir: string, query: string, wal: any[]): Promise<void> {
    const stepId = "QUERY_PLAN";
    if (wal.some(e => e.stepId === stepId && e.status === "COMPLETED")) {
        console.log(`[Phase 1] ${stepId} already completed. Skipping.`);
        return;
    }

    console.log(`[Phase 1] Planning queries using ${MODELS.PLANNER}...`);
    appendToWAL(dir, { stepId, intent: "QUERY_PLAN", status: "STARTED", subIndex: null, data: null });

    const model = genAI.getGenerativeModel({ model: MODELS.PLANNER });
    const prompt = `Decompose the following research request into 3-5 specific, high-quality search queries. 
    Output ONLY a JSON array of strings.
    Request: "${query}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    logDebug(dir, `Query Plan Response: ${responseText}`);

    try {
        const subQueries = JSON.parse(responseText.replace(/```json|```/g, '').trim());
        appendToWAL(dir, { stepId, intent: "QUERY_PLAN", status: "COMPLETED", subIndex: null, data: { subQueries } });
        
        const reportPath = path.join(dir, REPORT_FILENAME);
        fs.appendFileSync(reportPath, `## Research Plan\n\n${subQueries.map((q: string) => `- ${q}`).join('\n')}\n\n`);
    } catch (err: any) {
        appendToWAL(dir, { stepId, intent: "QUERY_PLAN", status: "FAILED", subIndex: null, data: { error: err.message } });
        throw new Error("Failed to parse query plan JSON.");
    }
}

async function runPhase2_SearchLoop(dir: string, wal: any[]): Promise<void> {
    const planEntry = wal.find(e => e.stepId === "QUERY_PLAN" && e.status === "COMPLETED");
    if (!planEntry) throw new Error("Query plan not found in WAL.");

    const { subQueries } = planEntry.data;

    for (let i = 0; i < subQueries.length; i++) {
        const stepId = `SEARCH_LOOP_${i}`;
        const query = subQueries[i];

        if (wal.some(e => e.stepId === stepId && e.status === "COMPLETED")) {
            console.log(`[Phase 2] ${stepId} already completed. Skipping.`);
            continue;
        }

        console.log(`[Phase 2] Executing Grounded Search ${i+1}/${subQueries.length}: ${query}`);
        appendToWAL(dir, { stepId, intent: "SEARCH_LOOP", status: "STARTED", subIndex: i, data: { query } });

        const searchResult = await executeGroundedSearch(dir, query);
        logDebug(dir, `Search Result ${i}: ${JSON.stringify(searchResult)}`);

        if (searchResult.ok) {
            const data = { 
                summary: searchResult.summary,
                links: searchResult.links,
                query: query
            };
            appendToWAL(dir, { stepId, intent: "SEARCH_LOOP", status: "COMPLETED", subIndex: i, data });
            
            const reportPath = path.join(dir, REPORT_FILENAME);
            fs.appendFileSync(reportPath, `### Findings for: ${query}\n${data.summary}\n\n`);
        } else {
            appendToWAL(dir, { stepId, intent: "SEARCH_LOOP", status: "FAILED", subIndex: i, data: { error: searchResult.error } });
            console.error(`[Phase 2] Search failed for ${query}: ${searchResult.error}`);
        }
    }
}

async function runPhase3_Synthesis(dir: string, wal: any[]): Promise<void> {
    const stepId = "SYNTHESIS";
    if (wal.some(e => e.stepId === stepId && e.status === "COMPLETED")) {
        console.log(`[Phase 3] ${stepId} already completed. Skipping.`);
        return;
    }

    console.log(`[Phase 3] Synthesizing final report using ${MODELS.SYNTHESIZER}...`);
    appendToWAL(dir, { stepId, intent: "SYNTHESIS", status: "STARTED", subIndex: null, data: null });

    const summaries = wal
        .filter(e => e.intent === "SEARCH_LOOP" && e.status === "COMPLETED")
        .map(e => `Query: ${e.data.query}\nFindings: ${e.data.summary}`)
        .join('\n\n');

    const prompt = `Based on the following research findings, provide a comprehensive, deep-dive report answering the original query.
    Use professional markdown formatting. Organize by themes, analyze conflicts in information if any, and conclude with future outlook.
    
    RESEARCH FINDINGS:
    ${summaries}`;

    const model = genAI.getGenerativeModel({ model: MODELS.SYNTHESIZER });
    const logStream = fs.createWriteStream(path.join(dir, LOG_FILENAME), { flags: 'a' });
    logStream.write('\n\n--- SYNTHESIS STREAM ---\n');

    let fullReportContent = "";
    try {
        const result = await model.generateContentStream(prompt);
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullReportContent += chunkText;
            logStream.write(chunkText);
        }
        logStream.end();

        const reportPath = path.join(dir, REPORT_FILENAME);
        fs.appendFileSync(reportPath, `## Final Deep-Dive Synthesis\n\n${fullReportContent}\n\n`);
        
        appendToWAL(dir, { stepId, intent: "SYNTHESIS", status: "COMPLETED", subIndex: null, data: { length: fullReportContent.length } });
    } catch (err: any) {
        appendToWAL(dir, { stepId, intent: "SYNTHESIS", status: "FAILED", subIndex: null, data: { error: err.message } });
        throw err;
    }
}

async function runPhase4_WrapUp(dir: string, wal: any[]): Promise<void> {
    const stepId = "WRAP_UP";
    if (wal.some(e => e.stepId === stepId && e.status === "COMPLETED")) {
        return;
    }

    console.log(`[Phase 4] Wrapping up...`);
    
    // Collect all unique links from all search loops
    const allLinks = new Map();
    wal.filter(e => e.intent === "SEARCH_LOOP" && e.status === "COMPLETED")
       .forEach(e => {
           if (e.data.links) {
               e.data.links.forEach((link: any) => allLinks.set(link.url, link.title || link.url));
           }
       });

    let sourcesMarkdown = "## Sources\n";
    if (allLinks.size > 0) {
        allLinks.forEach((title, url) => {
            sourcesMarkdown += `- [${title}](${url})\n`;
        });
    } else {
        sourcesMarkdown += "_No direct web sources found via grounding metadata._\n";
    }

    const reportPath = path.join(dir, REPORT_FILENAME);
    fs.appendFileSync(reportPath, sourcesMarkdown);

    appendToWAL(dir, { stepId, intent: "WRAP_UP", status: "COMPLETED", subIndex: null, data: { sourceCount: allLinks.size } });
}

// --- Main Engine ---

async function main() {
    const argv: any = yargs(hideBin(process.argv))
        .option('query', { type: 'string', describe: 'The research query' })
        .option('resume', { type: 'string', describe: 'Path to an existing research directory to resume' })
        .argv;

    let researchDir: string;
    let currentQuery: string;
    let wal: any[] = [];

    if (argv.resume) {
        researchDir = argv.resume;
        if (!fs.existsSync(researchDir)) {
            console.error(`Error: Directory ${researchDir} does not exist.`);
            process.exit(1);
        }
        console.log(`[System] Resuming research in: ${researchDir}`);
        wal = safeReadJSONL(path.join(researchDir, WAL_FILENAME));
        
        if (wal.some(e => e.stepId === "WRAP_UP" && e.status === "COMPLETED")) {
            console.log("[System] Research already completed. Exit code 2.");
            process.exit(2);
        }

        // Rebuild report.md from WAL to ensure consistency
        const reportPath = path.join(researchDir, REPORT_FILENAME);
        if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);
        
        const initEntry = wal.find(e => e.stepId === "INIT");
        currentQuery = initEntry ? initEntry.data.query : "Unknown Query";
        fs.writeFileSync(reportPath, `# Research Report: ${currentQuery}\n\n`);
    } else if (argv.query) {
        currentQuery = argv.query;
        const id = ulid();
        researchDir = path.join(OUTPUT_ROOT, `research_${id}`);
        if (!fs.existsSync(OUTPUT_ROOT)) fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
        fs.mkdirSync(researchDir);
        console.log(`[System] Starting new research. Directory: ${researchDir}`);
        
        appendToWAL(researchDir, { stepId: "INIT", intent: "INIT", status: "COMPLETED", subIndex: null, data: { query: currentQuery } });
        fs.writeFileSync(path.join(researchDir, REPORT_FILENAME), `# Research Report: ${currentQuery}\n\n`);
    } else {
        console.error("Error: Either --query or --resume is required.");
        process.exit(1);
    }

    try {
        await runPhase1_QueryPlanning(researchDir, currentQuery, wal);
        wal = safeReadJSONL(path.join(researchDir, WAL_FILENAME)); // Update local WAL state
        
        await runPhase2_SearchLoop(researchDir, wal);
        wal = safeReadJSONL(path.join(researchDir, WAL_FILENAME));

        await runPhase3_Synthesis(researchDir, wal);
        wal = safeReadJSONL(path.join(researchDir, WAL_FILENAME));

        await runPhase4_WrapUp(researchDir, wal);
        
        console.log(`\n[System] Success! Report finalized in ${researchDir}/${REPORT_FILENAME}`);
        process.exit(0);
    } catch (err: any) {
        console.error(`\n[FATAL] ${err.message}`);
        process.exit(1);
    }
}

main();
