# GEMINI Context: JW Assistant Tooling & Research Agent

## Project Overview
This project is a specialized Node.js environment dedicated to automating research, technical planning, content creation, and multi-voice synthesis. It integrates with Google's Generative AI via the `gemini` CLI and uses the Chrome DevTools MCP for interactive research.

## GitHub Integration
The master repository for this project is managed on GitHub:
- **Repository:** `https://github.com/cgoodman8318/geminiAssistant`
- **MCP Server:** Connected via the `github` MCP server for managing issues, PRs, and commits directly through Gemini.

## Repository Structure
The `geminiAssistant` directory serves as the **Source of Truth** for all tools and skills.

```text
geminiAssistant/             # Main Repository
├── src/
│   ├── skills/              # Master copies of Gemini Skills
│   │   ├── autonomous-researcher/ # WAL-based deep web research
│   │   ├── coding-step-planner/   # Multi-pass technical spec writer
│   │   ├── interactive-web-explorer/ # Playwright-based browsing
│   │   └── jw-assistant-toolkit/  # Religious Research & Grounding
│   └── tools/               # Master copies of CLI Tools (TS)
│       ├── autonomous-researcher/ # Search Agent Engine
│       ├── browser_engine.ts      # Shared browser logic
│       ├── interactive_wol_research.ts # WOL interface
│       ├── jw_daily_orchestrator.ts # Podcast automation
│       ├── jw_scraper_daily_text_tool.ts # Scraping logic
│       └── kokoro_tool.ts         # TTS Client
├── tests/                   # Tool verification tests
├── package.json             # Manages global installation
├── REDEPLOY.md              # Setup instructions for new machines
└── GEMINI.md                # This file
```

## Agent Ground Rules & Collaboration
To ensure a safe and effective peer-programming experience, the following rules apply to all agent interactions:

- **The Inquiry vs. Directive Boundary:** 
    - **Inquiries (Questions/Observations):** If the user asks a question, reports a bug, or requests analysis (e.g., "How does this work?", "Is this a bug?", "What are the risks?"), the agent MUST strictly limit its scope to **research and analysis**. Propose a strategy, but **DO NOT** modify any files or execute implementation tools.
    - **Directives (Instructions):** The agent will only modify code or files when given an explicit instruction (e.g., "Update the file," "Fix the bug," "Execute the plan").
- **Research -> Propose -> Wait Workflow:** For any non-trivial change, the agent MUST:
    1. **Research:** Map the codebase and understand the scope.
    2. **Propose:** Share a concise summary of the intended strategy and the files to be touched.
    3. **Wait:** Obtain explicit user confirmation before touching the codebase.
- **Architect Role (Secure Planning):** When performing architectural or technical planning (e.g., using `coding-step-planner`), the agent MUST operate in **Plan Mode** (`--approval-mode=plan`). This locks the agent into a read-only state for source files while allowing it to write to a dedicated `plans/` or `.md` spec file.

## Religious Research & Grounding Instructions
**All agent interactions regarding JW-specific tasks must adhere to the following:**

- **Core Directive:** Responses regarding religion, the Bible, or doctrines must be limited exclusively to the beliefs and teachings of Jehovah’s Witnesses.
- **Authority & Sources:** All information must be grounded in and sourced from **jw.org** or the **Watchtower ONLINE LIBRARY (wol.jw.org)**.
- **Exclusivity:** No outside theological commentaries or secular religious studies should be used unless explicitly requested for comparative purposes.
- **Scriptural Citations:** The **New World Translation of the Holy Scriptures (NWT)** must be used for all scriptural citations and references.
- **Tone:** Maintain a respectful and helpful tone consistent with official publications.

## Primary Toolchain

### 1. Autonomous Research Agent (`autonomous-researcher`)
- **Function:** Decomposes complex topics into sub-queries, performs grounded web searches, and synthesizes a professional deep-dive report.
- **Resilience:** Uses a Write-Ahead Log (WAL) to survive crashes and resume seamlessly.
- **Models:** Spreads load across 2.5 and 3.0 models to optimize free tier limits.

### 2. Daily Podcast Orchestrator (`jw-daily-orchestrator`)
- **Function:** Scrapes Daily Text -> Generates script -> Synthesizes audio using Kokoro TTS.
- **Config:** Uses `PODCAST_OUTPUT_DIR` environment variable.

### 3. Kokoro TTS Client (`kokoro-tts`)
- **Function:** Multi-voice mapping and job monitoring for the Kokoro server.
- **Config:** Uses `KOKORO_SERVER_URL` (Default: `http://192.168.1.68:5000`).

### 4. Technical Planner (`coding-step-planner`)
- **Function:** A 3-pass workflow to turn abstract project steps into detailed, code-ready specs for Julia, Toit, and MS SQL.

## Global Installation & Updates
To "publish" changes from the `geminiAssistant` repository to your user-level environment:

1.  **CLI Tools:** `npm run install-tools` (Installs global bin links).
2.  **Gemini Skills:** `npm run install-skills` (Installs master prompt files).
3.  **Browsers:** `npx playwright install chromium` (First-time setup).

## Development Conventions
- **Language:** TypeScript (`tsx`).
- **Style:** camelCase naming conventions.
- **Environment:** Windows (win32).
- **Persistence:** Browser sessions and temp files are managed in `~/.gemini/` and system temp dirs.
