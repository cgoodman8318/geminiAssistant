# GEMINI Context: `geminiAssistant` Repository

## Overview
This repository is the **Source of Truth** for a suite of specialized Node.js tools and Gemini skills. It manages the master copies of code and prompts used for automated research, technical planning, and multi-voice content creation.

## Primary Toolchain

### 1. Autonomous Research Agent (`autonomous-researcher`)
- **Logic:** WAL-based, crash-resilient state machine.
- **Grounding:** Uses real-time Google Search Grounding.
- **Security:** Sandboxed secrets and isolated data outputs.

### 2. Skill & Tool Auditor (`skill-auditor`)
- **Logic:** Automated 3-pass scanning (Inventory -> Red Team Analysis -> Reporting).
- **Goal:** Maintains a 100/100 security score across all repository components.

### 3. Daily Podcast Orchestrator (`jw-daily-orchestrator`)
- **Logic:** Async `spawn`-based automation for scraping and multi-voice synthesis.

### 4. Technical Planner (`coding-step-planner`)
- **Logic:** Multi-pass technical spec writer for Julia, Toit, and MS SQL.

## Religious Research & Grounding Instructions
**All interactions involving JW-specific tasks MUST adhere to these constraints:**
- **Authority:** All information must be sourced exclusively from **jw.org** or **wol.jw.org**.
- **Citations:** Use the **New World Translation (NWT)** for all scriptural references.
- **Exclusivity:** No outside theological or secular religious studies unless requested for comparison.
- **Tone:** Respectful and consistent with official Witness literature.

## Global Installation & Updates
To synchronize changes from this repository to your local user environment:
1.  **Tools:** `npm run install-tools`
2.  **Skills:** `npm run install-skills`
3.  **Verification:** `npm run test` (Runs integration suites).

## Development Conventions
- **Source:** All master files reside in `src/`.
- **Typing:** Strict TypeScript (`tsx`).
- **Style:** camelCase variables and file naming.
- **Security:** Never commit `.env` or secrets. Follow the **Agent Ground Rules** defined in the root `GEMINI.md`.

---
**Repository:** `https://github.com/cgoodman8318/geminiAssistant`
