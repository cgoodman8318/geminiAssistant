# Home Assistant Integration

This workspace integrates directly with a local Home Assistant instance via a custom Model Context Protocol (MCP) server.

## Architecture
- **Server:** Node.js/TypeScript MCP Server (`src/tools/core/home-assistant-mcp`)
- **Transport:** Stdio
- **Authentication:** Long-Lived Access Token via `.secrets/home-assistant.env`

## Capabilities & Tools

### **1. State Management**
- `get_ha_states`: Lists the current state and friendly names of **all** entities.
- `get_ha_state`: Retrieves the **detailed attributes** of a specific entity (Unit of measurement, device class, battery, etc).

### **2. Device & Service Control**
- `call_ha_service`: The primary tool for taking action (turning lights on/off, triggering scripts, setting temperatures).
- `list_ha_services`: Returns the full registry of available services grouped by domain.

### **3. Automation Management (CRUD)**
*Requires administrative token permissions.*
- `list_ha_automations`: Lists all automations by filtering the state machine (includes Internal IDs).
- `get_ha_automation_config`: Fetches the detailed YAML/JSON logic of a specific automation.
- `save_ha_automation`: Create a new automation or update an existing one.
- `delete_ha_automation`: Permanently remove an automation.

### **4. Integration & Infrastructure**
- `list_ha_config_entries`: View all installed integrations (MQTT, Shelly, Hue, etc) and their status.
- `reload_ha_config_entry`: Force an integration to restart (crucial for refreshing MQTT discovery).

## Usage Guidelines
- **Entity Discovery:** Always call `get_ha_states` first if you are unsure of the exact `entity_id`.
- **Automation IDs:** To edit an automation, first use `list_ha_automations` to find the 13-digit Internal ID (different from the `entity_id`).
- **MQTT Discovery:** If custom ESP32 sensors are not appearing, use `reload_ha_config_entry` on the `mqtt` integration.

## Service Mapping Examples
| Intent | Domain | Service |
| :--- | :--- | :--- |
| "Turn on..." | `light` or `switch` | `turn_on` |
| "Turn off..." | `light` or `switch` | `turn_off` |
| "Run script..." | `script` | `turn_on` |
