---
name: home-assistant
description: Control and manage your smart home via Gemini. Connects to your local Home Assistant instance to manage lights, switches, scripts, sensors, and automations.
---

# Home Assistant Integration Skill

This skill empowers you to interact with and manage your smart home directly from the Gemini CLI. You can discover devices, check their detailed states, execute services, and perform full lifecycle management of automations and integrations.

## Core Interaction Protocol

To ensure accuracy and prevent "entity ID hallucinations," always follow this three-step process:

1.  **Discovery (The "Map" Phase):** Call `get_ha_states` to list all devices. For automations specifically, use `list_ha_automations`.
2.  **Inspection:** For detailed sensor data or device attributes, use `get_ha_state`. For automation logic, use `get_ha_automation_config` with the 13-digit Internal ID.
3.  **Execution (The "Action" Phase):** Use `call_ha_service` for standard device control or the dedicated automation/config tools for management.

## Service Mapping Guide

| Intent | Domain | Service | Entity ID Example |
| :--- | :--- | :--- | :--- |
| "Turn on..." | `light` or `switch` | `turn_on` | `light.living_room` |
| "Turn off..." | `light` or `switch` | `turn_off` | `switch.coffee_maker` |
| "Toggle..." | `light` or `switch` | `toggle` | `light.kitchen_lamp` |
| "Run script..." | `script` | `turn_on` | `script.goodnight` |
| "Manage Automation" | `automation` | (CRUD Tools) | `1759484257466` (Internal ID) |

## Advanced Management

### **Automation CRUD**
- **List:** `list_ha_automations` returns all automations and their **Internal IDs**.
- **Read:** `get_ha_automation_config` retrieves the full YAML/JSON logic.
- **Write:** `save_ha_automation` allows you to create or update logic. Use `initial_state: false` to create a deactivated automation.
- **Delete:** `delete_ha_automation` removes it permanently.

### **Integration Management**
- Use `list_ha_config_entries` to see all integrations (MQTT, Shelly, etc).
- Use `reload_ha_config_entry` to force a refresh (e.g., to pick up new MQTT Discovery sensors).

## Best Practices

- **Friendly Name Matching:** Scan the list from `get_ha_states` for a `friendly_name` provided by the user.
- **Ambiguity Resolution:** If multiple devices match, list them and ask for clarification.
- **Service Discovery:** Use `list_ha_services` if you are unsure which services a domain supports.
- **Safety:** Always verify that an entity supports the service you are trying to call.

## Security & Safety

- **Read-Only First:** Favor state inquiries before modifications.
- **Admin Access:** Automation and Integration tools require administrative token permissions.
- **No Private Logging:** Do not output sensitive attribute data (location, private tokens) unless requested.
