---
name: interactive-web-explorer
description: Provides a stateful, interactive way to explore and navigate websites using Playwright. Use when you need to interact with a UI, navigate complex flows, or perform multi-step actions on a website.
---

# Interactive Web Explorer

This skill enables a stateful browsing session within the terminal. It uses a specialized browser engine to map UI elements and maintain session state across multiple turns.

## Core Workflow

1.  **Initialize/Navigate:** Use `browser_engine.ts` with the `goto` command.
2.  **UI Mapping:** The engine automatically returns a JSON "Map" of interactive elements (labels, tags, roles).
3.  **Analysis:** Present the simplified UI map to the user, highlighting key landmarks and buttons.
4.  **Interaction:** When the user selects an action (e.g., "Click Search"), use the `click` or `type` commands.
5.  **Persistence:** Session state (cookies, storage) is automatically saved to `session_state.json`.

## Best Practices

- **Headless First:** Always run in headless mode with HTTP/2 disabled to avoid protocol errors.
- **Semantic Selection:** Prefer selecting elements by their ARIA labels or text content rather than fragile CSS selectors.
- **Wait for Idle:** Always wait for the network to be idle after an action to ensure the UI has updated.
- **Handle Dynamic Content:** If a page is highly dynamic, perform a mapping action twice to check for updates.

## Using the Engine

```bash
# Navigate
npx ts-node scripts/browser_engine.ts goto https://example.com

# Click an element
npx ts-node scripts/browser_engine.ts click "button[aria-label='Search']"

# Type into an input
npx ts-node scripts/browser_engine.ts type "input#search" "my query"
```

## UI Presentation Pattern

When presenting the UI to the user, use a clean Markdown table or list:

| Element | Role | Label | Action |
| :--- | :--- | :--- | :--- |
| Button | search | Search the site | Click |
| Input | textbox | Search query | Type |
| Link | navigation | Bible | Navigate |
