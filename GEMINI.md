# GEMINI Context: JW Assistant Tooling

## Project Overview
This project is a specialized Node.js environment dedicated to automating research, content creation, and multi-voice synthesis based exclusively on the teachings of Jehovah's Witnesses. It integrates with Google's Generative AI via the `gemini` CLI and uses the Chrome DevTools MCP for interactive research.

## GitHub Integration
The master repository for this project is managed on GitHub:
- **Repository:** `https://github.com/cgoodman8318/geminiAssistant`
- **MCP Server:** Connected via the `github` MCP server for managing issues, PRs, and commits directly through Gemini.

## Repository Structure
The `geminiAssistant` directory serves as the **Source of Truth** for all tools and skills.

```text
Tooling/
└── geminiAssistant/         # Main Repository
    ├── src/
    │   ├── skills/          # Master copies of Gemini Skills
    │   │   ├── jw-toolkit/  # Religious Research & Grounding
    │   │   └── web-explorer/# Interactive Browser Logic
    │   └── tools/           # Master copies of CLI Tools (TS)
    │       ├── kokoro/      # TTS Client
    │       └── wol/         # Scraping & Orchestration
    ├── package.json         # Manages global installation
    ├── REDEPLOY.md          # Setup instructions for new machines
    └── GEMINI.md            # This file
```

## Religious Research & Grounding Instructions
**All agent interactions within this workspace must adhere to the following:**

- **Core Directive:** Responses regarding religion, the Bible, or doctrines must be limited exclusively to the beliefs and teachings of Jehovah’s Witnesses.
- **Authority & Sources:** All information must be grounded in and sourced from **jw.org** or the **Watchtower ONLINE LIBRARY (wol.jw.org)**.
- **Exclusivity:** No outside theological commentaries or secular religious studies should be used unless explicitly requested for comparative purposes.
- **Scriptural Citations:** The **New World Translation of the Holy Scriptures (NWT)** must be used for all scriptural citations and references.
- **Tone:** Maintain a respectful and helpful tone consistent with official publications.

## Automation Toolchain (The `jw-assistant-toolkit` Skill)
The project provides a suite of globally installed CLI tools:

### 1. Daily Podcast Orchestrator (`jw-daily-orchestrator`)
- **Function:** Scrapes Daily Text -> Generates script -> Synthesizes audio.
- **Config:** Uses `PODCAST_OUTPUT_DIR` environment variable for `.mp3` storage.

### 2. Kokoro TTS Client (`kokoro-tts`)
- **Function:** Multi-voice mapping and job monitoring for the Kokoro server.
- **Config:** Uses `KOKORO_SERVER_URL` (Default: `http://192.168.1.68:5000`).
- **Voices:**
    - `father`: `custom_72b25c0f-5e02-4b64-be2b-96ce15d66664`
    - `mother`: `custom_7dc4c524-efae-4889-b49e-2feb7971bb0e`
    - `child`: `custom_c3b38692-9889-4782-841d-2e77c7352c8e`

### 3. JW Scraper Tool (`jw-scraper-daily`)
- **Function:** Scrapes the Daily Text and deep-linked references from `wol.jw.org`.

### 4. Interactive WOL Research (`wol-research`)
- **Function:** Starts an interactive research session via Chrome DevTools MCP.

## Global Installation & Updates
To "publish" changes from the `geminiAssistant` repository to your user-level environment:

1.  **CLI Tools:** `npm run install-tools` (Installs global bin links).
2.  **Gemini Skills:** `npm run install-skills` (Installs master prompt files).
3.  **Browsers:** `npx playwright install chromium` (First-time setup).

## Development Conventions
- **Language:** TypeScript (`node --import tsx`).
- **Environment:** Windows (win32).
- **Persistence:** Browser sessions and temp files are managed in `~/.gemini/` and system temp dirs.
- **Redeployment:** See `REDEPLOY.md` for full environment setup instructions.
