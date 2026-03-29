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
- **Pathing:** Uses dynamic path discovery to support global installation and sandboxed secrets.
- **Security:** Follow the **Agent Ground Rules** in the root `GEMINI.md`.
