# JW Assistant Toolkit

This documentation outlines the constraints and tools for the specialized religious research track (`src/skills/personal/jw-assistant-toolkit`).

## 1. Grounding Instructions
All interactions involving JW-specific tasks MUST adhere to these constraints to ensure doctrinal accuracy and alignment:

- **Authority:** Information must be sourced exclusively from **jw.org** or **wol.jw.org**.
- **Citations:** Use the **New World Translation (NWT)** for all scriptural references.
- **Exclusivity:** No outside theological or secular religious studies unless explicitly requested by the user for comparison.

## 2. Supporting Tools
- **JW Scraper:** (`src/tools/personal/jw_scraper_daily_text_tool`) Provides logic for navigating and extracting text from jw.org.
- **Daily Podcast Orchestrator:** (`src/tools/personal/jw-daily-orchestrator`) Async automation for Daily Text synthesis using local TTS engines.
