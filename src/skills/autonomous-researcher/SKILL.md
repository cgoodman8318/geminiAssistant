---
name: autonomous-researcher
description: >
  Activates the Autonomous Research Agent (CASS-compatible) to perform deep-dive, grounded
  web research on complex topics. Use this when the user asks for "deep research",
  "write a report on X", "investigate the latest advancements in Y", or any request
  requiring multiple sequential web searches and high-reasoning synthesis.
  This skill orchestrates a multi-pass workflow using 2.5 and 3.0 models:
  Phase 1: Query Planning (2.5 Pro)
  Phase 2: Grounded Search Loop (2.5 Flash-Lite)
  Phase 3: Deep Synthesis (3.1 Pro)
  It provides full crash-resilience via a Write-Ahead Log (WAL).
---

# Autonomous Research Agent Skill

This skill provides a senior-level autonomous research capability. It does not just
answer a question — it designs a research plan, executes multiple grounded web searches,
logs every raw response for auditability, and synthesizes a professional deep-dive report.

## Prerequisites
* The `autonomous-researcher` CLI tool is installed globally (`npm run install-tools`).
* A valid `GEMINI_API_KEY` is set in the environment or `.env` file.

## Activation Triggers
* "Deep research on [topic]"
* "Perform an autonomous investigation into [topic]"
* "Write a comprehensive technical report on [topic] using real-time data"
* "Analyze the latest breakthroughs in [field]"

## The Research Workflow (Automated)

### 1. Initialization
The tool generates a unique `research_<ULID>/` directory to house the investigation.
Every state transition is written to `report_status.jsonl` (the WAL).

### 2. Phase 1: Planning
The agent uses **Gemini 2.5 Pro** to decompose your request into 3–5 high-quality, 
targeted search queries designed to cover all facets of the topic.

### 3. Phase 2: Grounded Search
The agent loops through each query using **Gemini 2.5 Flash-Lite** with **Google Search Grounding**
enabled. It extracts summaries and source URLs, logging them as it goes.

### 4. Phase 3: Deep Synthesis
The agent reads all collected findings from the WAL and uses **Gemini 3.1 Pro** to 
synthesize a structured, multi-themed final report.

### 5. Phase 4: Finalization
The agent compiles a clean list of all web sources used and finalizes the `report.md` file.

---

## Commands

### Start New Research
```bash
autonomous-researcher --query "Your complex topic here"
```

### Resume After Crash
If the process is interrupted, simply run:
```bash
autonomous-researcher --resume ./research_<ULID>/
```
The tool will detect the last completed step in the WAL and resume instantly.

## Best Practices
* **Specific Queries:** Provide as much context as possible in the initial `--query`.
* **Monitor Progress:** You can tail the `report_log.md` in the research directory to see the raw thoughts and streams in real-time.
* **Auditability:** Always check the `Sources` section at the bottom of the final report to verify the grounding.

## When NOT to Use
* Simple fact-checking (e.g., "What is the capital of France?") -> Use standard search.
* Code-only questions with no web dependency -> Use the codebase-investigator.
* Local file analysis only -> Use a dedicated file-reading tool.
