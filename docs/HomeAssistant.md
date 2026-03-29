# Home Assistant Integration

This workspace integrates directly with a local Home Assistant instance via a custom Model Context Protocol (MCP) server.

## Architecture
- **Server:** Node.js/TypeScript MCP Server (`src/tools/core/home-assistant-mcp`)
- **Transport:** Stdio Server Transport for Gemini CLI.
- **Backend:** Axios REST Client (`ha-client.ts`) authenticated via Long-Lived Access Token.
- **Sandbox:** Credentials (`HA_URL`, `HA_TOKEN`) are securely stored in the root `.secrets/home-assistant.env`.

## Core Interaction Protocol
To ensure accuracy and prevent "entity ID hallucinations," the agent must follow this three-step process:

1.  **Discovery (The "Map" Phase):** Call `get_ha_states` to find the exact `entity_id` based on friendly names.
2.  **Inspection (Optional):** Call `get_ha_state` to read specific attributes (brightness, color, etc.).
3.  **Execution (The "Action" Phase):** Use `call_ha_service` to perform the action.

## Service Mapping Examples
| Intent | Domain | Service |
| :--- | :--- | :--- |
| "Turn on..." | `light` or `switch` | `turn_on` |
| "Turn off..." | `light` or `switch` | `turn_off` |
| "Run script..." | `script` | `turn_on` |
