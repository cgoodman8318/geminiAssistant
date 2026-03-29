#!/usr/bin/env node --import tsx
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const PROMPT_SYSTEM_CONTEXT = `
You are an expert scriptwriter for a family-oriented podcast. 
Your goal is to create a natural, engaging, and spiritually encouraging conversation between a Father, Mother, and Child.
The tone should be warm, conversational, and realistic. 
Characters:
- [Father]: Leads the discussion, warm, insightful.
- [Mother]: Supportive, practical, shares personal observations.
- [Child]: Curious, asks questions, makes simple but heartfelt applications.

Formatting:
- Use character names in brackets like [Father], [Mother], [Child].
- Do not include stage directions or parentheticals like (smiling) or (reads scripture).
- Convert all Bible citations to be read aloud (e.g., "Matthew 24 verse 14" instead of "Matt. 24:14").
- Focus on the content provided in the Daily Text and References.
`;

const PROMPT_DAILY_TEXT_TEMPLATE = `
**Task: Review Daily Text**
**Context:** The family sits down for breakfast and discusses the daily text.

**Input Data:**
## Daily Text Scripture 
{{themeScripture}}

## Watchtower Comment 
{{bodyText}}

## Supporting References
{{refs}}

**Instructions:**
1. **Start Casually:** [Father] greets the family and suggests considering the daily text.
2. **Outline:**
    - [Father] reads the scripture (full book name/chapter/verse).
    - [Father] asks for initial thoughts.
    - [Mother] or [Child] provides a brief comment.
    - [Mother] reads the Watchtower comment (skipping inline citations like "w24.04").
    - **General Discussion:** The family discusses the points, using the supporting references to add depth.
    - [Father] leads the conversation to:
        - Explain the meaning.
        - Provide an illustration or analogy.
        - Make a practical application for the day.
3. **Closing:** [Father] summarizes and says goodbye as they start their day.
`;

async function main() {
    const argv: any = yargs(hideBin(process.argv))
        .option('date', { type: 'string', description: 'Date in YYYY/MM/DD format' })
        .option('output', { type: 'string', description: 'Output MP3 path' })
        .help()
        .argv;

    const dateStr = argv.date || new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const defaultOutputDir = process.env.PODCAST_OUTPUT_DIR || path.join(os.homedir(), 'Documents', 'Podcasts');
    const outputFilename = argv.output || path.join(defaultOutputDir, `podcast_dailyText_${dateStr.replace(/\//g, '')}.mp3`);

    console.log(`--- Starting JW Daily Text Orchestrator for ${dateStr} ---`);

    // 1. Scrape Data
    console.log('Step 1: Scraping JW.org...');
    const scraperOutput = execSync(`jw-scraper-daily daily --date ${dateStr}`, { encoding: 'utf-8' });
    const dailyData = JSON.parse(scraperOutput);

    // 2. Prepare Prompt
    console.log('Step 2: Preparing Prompt...');
    let prompt = PROMPT_DAILY_TEXT_TEMPLATE
        .replace('{{themeScripture}}', dailyData.themeScripture)
        .replace('{{bodyText}}', dailyData.bodyText || dailyData.bodyTxt || '')
        .replace('{{refs}}', JSON.stringify(dailyData.refs, null, 2));
    
    const fullPrompt = `${PROMPT_SYSTEM_CONTEXT}\n\n${prompt}`;

    // 3. Call Gemini
    console.log('Step 3: Calling Gemini CLI...');
    const promptPath = path.join(os.tmpdir(), `temp_prompt_${Date.now()}.txt`);
    fs.writeFileSync(promptPath, fullPrompt);
    
    const geminiOutput = execSync(`type "${promptPath}" | gemini -p "Please generate the script based on the provided data." --raw-output`, { encoding: 'utf-8' });
    
    fs.removeSync(promptPath);

    // 4. Synthesize Audio
    console.log('Step 4: Synthesizing Audio with Kokoro...');
    const voiceAssignments = {
        "mother": { "voice": "custom_7dc4c524-efae-4889-b49e-2feb7971bb0e", "lang_code": "a" },
        "father": { "voice": "custom_72b25c0f-5e02-4b64-be2b-96ce15d66664",  "lang_code": "a" },
        "child": { "voice": "custom_c3b38692-9889-4782-841d-2e77c7352c8e",  "lang_code": "a" }
    };

    fs.ensureDirSync(path.dirname(outputFilename));

    const scriptPath = path.join(os.tmpdir(), `temp_script_${Date.now()}.txt`);
    fs.writeFileSync(scriptPath, geminiOutput);

    console.log(`Submitting script to Kokoro...`);
    const voicesJson = JSON.stringify(voiceAssignments);
    const voicesPath = path.join(os.tmpdir(), `temp_voices_${Date.now()}.json`);
    fs.writeFileSync(voicesPath, voicesJson);
    
    execSync(`kokoro-tts generate --file "${scriptPath}" --voices_file "${voicesPath}" --output "${outputFilename}"`, { 
        encoding: 'utf-8' 
    });

    fs.removeSync(scriptPath);
    fs.removeSync(voicesPath);

    console.log(`--- Finished! Audio saved to: ${outputFilename} ---`);
}

main().catch(err => {
    console.error('Orchestration failed:', err);
});
