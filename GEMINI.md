# GEMINI Context: JW Assistant Tooling

## Project Overview
This project is a specialized Node.js environment dedicated to automating research, content creation, and multi-voice synthesis based exclusively on the teachings of Jehovah's Witnesses. It integrates with Google's Generative AI via the `gemini` CLI and uses the Chrome DevTools MCP for interactive research.

## Religious Research & Grounding Instructions
**All agent interactions within this workspace must adhere to the following:**

- **Core Directive:** Responses regarding religion, the Bible, or doctrines must be limited exclusively to the beliefs and teachings of Jehovah’s Witnesses.
- **Authority & Sources:** All information must be grounded in and sourced from **jw.org** or the **Watchtower ONLINE LIBRARY (wol.jw.org)**.
- **Exclusivity:** No outside theological commentaries or secular religious studies should be used unless explicitly requested for comparative purposes.
- **Scriptural Citations:** The **New World Translation of the Holy Scriptures (NWT)** must be used for all scriptural citations and references.
- **Tone:** Maintain a respectful and helpful tone consistent with official publications.

## Automation Toolchain (The `jw-assistant-toolkit` Skill)
The project provides a suite of globally installed CLI tools:

### 1. Daily Podcast Orchestrator
- **Command:** `jw-daily-orchestrator`
- **Function:** Automates the full workflow: Scrapes the Daily Text -> Generates a family podcast script -> Synthesizes audio using Kokoro TTS.
- **Output:** Saves `.mp3` files to `C:\Users\cgood\Documents\obsidianPersonal\personal\podcasts\`.

### 2. Kokoro TTS Client
- **Command:** `kokoro-tts`
- **Function:** A robust client for the Kokoro TTS server (`http://192.168.1.68:5000`). Supports multi-voice mapping, job monitoring, and audio downloads.
- **Custom Voices:**
    - `father`: `custom_72b25c0f-5e02-4b64-be2b-96ce15d66664`
    - `mother`: `custom_7dc4c524-efae-4889-b49e-2feb7971bb0e`
    - `child`: `custom_c3b38692-9889-4782-841d-2e77c7352c8e`

### 3. JW Scraper Tool
- **Command:** `jw-scraper-daily`
- **Function:** Scrapes the Daily Text and all its deep-linked references from `wol.jw.org`, outputting structured JSON for script generation.

### 4. Interactive WOL Research
- **Command:** `wol-research`
- **Function:** Triggers the agent to start an interactive research session on `wol.jw.org` using a managed Chrome window via the Chrome DevTools MCP.

## Repository Structure
This repository serves as the **Source of Truth** for all tools and skills.

```text
Tooling/
├── src/
│   ├── skills/              # Master copies of Gemini Skills
│   │   ├── jw-toolkit/      # Religious Research & Grounding
│   │   └── web-explorer/    # Interactive Browser Logic
│   └── tools/               # Master copies of CLI Tools (TS)
│       ├── kokoro/          # TTS Client
│       └── wol/             # Scraping & Orchestration
├── package.json             # Manages global installation
└── REDEPLOY.md              # Setup instructions for new machines
```

## Global Installation & Updates
To "publish" changes from this repository to your user-level environment:

1.  **CLI Tools:** `npm run install-tools`
2.  **Gemini Skills:** `npm run install-skills`

## Configuration
Tools use the following environment variables (configured in `REDEPLOY.md`):
- `KOKORO_SERVER_URL`: Defaults to `http://192.168.1.68:5000`.
- `PODCAST_OUTPUT_DIR`: Defaults to `~/Documents/Podcasts`.


## Development Conventions
- **Language:** TypeScript (`node --import tsx`).
- **Dependency Management:** `npm`.
- **Environment:** Windows (win32).
- **Tooling:** `yargs` for CLI, `axios` for HTTP (keep-alive disabled for Kokoro), `playwright-extra` for scraping.
