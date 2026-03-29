---
name: home-assistant
description: Control your smart home via Gemini. Connects to your local Home Assistant instance to manage lights, switches, scripts, and sensors. Use for requests like "turn on the lights", "what's the temperature", or "run the goodnight script".
---

# Home Assistant Integration Skill

This skill empowers you to interact with your smart home directly from the Gemini CLI. You can discover devices, check their detailed states, and execute any Home Assistant service using the provided MCP tools.

## Core Interaction Protocol

To ensure accuracy and prevent "entity ID hallucinations," always follow this three-step process:

1.  **Discovery (The "Map" Phase):** If you are unsure of an entity ID or if it's your first time interacting with a device in this session, call `get_ha_states`. This returns a list of all devices and their "friendly names."
2.  **Inspection (Optional):** If you need detailed information (like current brightness, color, or specific sensor units), call `get_ha_state` with the specific `entity_id`.
3.  **Execution (The "Action" Phase):** Once you have the correct `entity_id` and domain, use `call_ha_service` to perform the action.

## Service Mapping Guide

| Intent | Domain | Service | Entity ID Example |
| :--- | :--- | :--- | :--- |
| "Turn on..." | `light` or `switch` | `turn_on` | `light.living_room` |
| "Turn off..." | `light` or `switch` | `turn_off` | `switch.coffee_maker` |
| "Toggle..." | `light` or `switch` | `toggle` | `light.kitchen_lamp` |
| "Run script..." | `script` | `turn_on` | `script.goodnight` |
| "Activate scene..." | `scene` | `turn_on` | `scene.cozy_evening` |

## Best Practices

- **Friendly Name Matching:** If the user says "Turn on the lamp," scan the list from `get_ha_states` for a `friendly_name` containing "lamp."
- **Ambiguity Resolution:** If multiple lamps exist, list them for the user and ask for clarification.
- **Service Data:** When the user provides specific details (e.g., "Set the light to 50%"), include that in the `service_data` object (e.g., `{"brightness_pct": 50}`).
- **Quiet Mode:** After a successful action, provide a brief confirmation (e.g., "Living room lamp is now on.").

## Security & Safety

- **Read-Only First:** Favor `get_ha_states` for general inquiries.
- **Validation:** Always verify that an entity supports the service you are trying to call (e.g., don't try to `turn_on` a sensor).
- **No Private Logging:** Do not output sensitive attribute data (like location coordinates or private tokens) unless explicitly requested.
