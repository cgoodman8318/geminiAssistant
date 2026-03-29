# GEMINI Context: `geminiAssistant` Repository (Core & Personal)

## Overview
This repository manages two distinct development tracks: **Core** (Professional/General) and **Personal** (Religious). It serves as the Source of Truth for master code and skill prompts.

## 1. Core Track (General/Work)
General-purpose power tools designed for any high-reasoning task.
- **Autonomous Research Agent (`src/tools/core/autonomous-researcher`)**: WAL-based, grounded web research.
- **Skill & Tool Auditor (`src/tools/core/skill-auditor`)**: Automated security and integrity scanner.
- **Technical Planner (`src/skills/core/coding-step-planner`)**: Multi-pass architectural planning.
- **Web Explorer (`src/skills/core/interactive-web-explorer`)**: Playwright-based interactive browsing.

## 2. Personal Track (Religious/Custom)
Specialized tools built on Core foundations for JW-specific workflows.
- **JW Assistant Toolkit (`src/skills/personal/jw-assistant-toolkit`)**: Grounding instructions for religious research.
- **Daily Podcast Orchestrator (`src/tools/personal/jw-daily-orchestrator`)**: Async automation for Daily Text synthesis.
- **JW Scraper (`src/tools/personal/jw_scraper_daily_text_tool`)**: Scraping logic for jw.org.
- **Code Debugger (`src/skills/core/code-debugger`)**: Forensic diagnostic agent for deterministic troubleshooting.

## CASS Diagnostic Suite
This workspace implements a deterministic, multi-ecosystem diagnostic engine via session hooks:
- **Phase A (SessionStart):** `snapshotBuilder.jl` maps Julia and Python dependencies to `.gemini/context/manifestSnapshot.json`.
- **Phase B (AfterTool):** `forensicLookup.jl` intercepts failures, parses stack traces, and injects diagnostic context.
- **Language Extension:** Support for new ecosystems follows the [Language Extension Spec](.gemini/docs/LanguageExtensionSpec.md).

## Religious Research & Grounding Instructions
**All interactions involving JW-specific tasks MUST adhere to these constraints:**
- **Authority:** Information must be sourced exclusively from **jw.org** or **wol.jw.org**.
- **Citations:** Use the **New World Translation (NWT)** for all scriptural references.
- **Exclusivity:** No outside theological or secular religious studies unless requested for comparison.

## Global Installation & Updates
1.  **Tools:** `npm run install-tools`
2.  **Skills:** `npm run install-skills`
3.  **Core Only:** `npm run install-skills-core`
4.  **Personal Only:** `npm run install-skills-personal`

## Development Conventions
- **Structure:** All master files reside in `src/`.
- **Julia Hooks:** For `gemini-cli` hooks (e.g., `snapshotBuilder.jl`), always write the logic to a `.jl` file and execute it rather than using inline `julia -e` commands to avoid complex shell escaping issues in PowerShell/Windows. Use **JSON3** for all JSON processing.
- **Pathing:** Uses dynamic path discovery to support global installation and sandboxed secrets.
- **Security:** Follow the **Agent Ground Rules** in the root `GEMINI.md`.

## Diagnostic Mode Procedures
If the agent receives a payload containing the `[DIAGNOSTIC MODE ACTIVE]` flag (injected by the `forensicLookup.jl` hook upon tool failure), it MUST strictly adhere to the following sequence:
1. **Identify Root Cause:** Analyze the injected stack frames.
2. **Determine Causality:** Explicitly state whether the error originates from User Code calling a dependency incorrectly, or from an internal Dependency/Stdlib conflict.
3. **Suggest Fix:** *Only* suggest a fix after confirming the root cause. The agent MUST NOT hallucinate broad architectural changes or unrelated refactoring to resolve simple version, type, or syntax mismatches highlighted by the diagnostic payload.
