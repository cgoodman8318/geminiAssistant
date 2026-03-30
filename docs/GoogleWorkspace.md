# Google Workspace MCP Server

The `google-workspace-mcp` server provides functional access to Gmail, Google Tasks, Google Calendar, and Google Drive via the `gws` CLI.

## Core Capabilities

### Gmail
- `gmail_list_messages`: Search and list emails.
- `gmail_get_message`: Retrieve full message details (simplified for LLM efficiency).
- `gmail_send_message`: Send plain-text emails.
- `gmail_trash_message`: Move messages to the trash.

### Tasks
- `tasks_list_tasklists`: List available task lists.
- `tasks_list_tasks`: List tasks within a specific list.
- `tasks_get_task`: Retrieve a specific task.
- `tasks_create_task`: Create a new task.
- `tasks_update_task`: Update task title, notes, status, or due date.
- `tasks_delete_task`: Remove a task from a list.
> **Note:** The Tasks API only supports date-level granularity for `due` dates; time information is discarded by the API.

### Calendar
- `calendar_list_calendars`: List user calendars.
- `calendar_list_events`: Search and list events.
- `calendar_get_event`: Retrieve full event details.
- `calendar_create_event`: Create new timed or all-day events.
- `calendar_update_event`: Patch existing events (e.g., change color, summary, or time).
- `calendar_delete_event`: Remove events.

### Drive
- `drive_list_files`: Search and list files/folders using Drive query syntax.
- `drive_get_file_metadata`: Retrieve detailed metadata (including parents).
- `drive_get_file_content`: Read file content. Automatically exports Google Docs/Sheets to text/csv.
- `drive_create_file`: Create a new file with optional content upload.
- `drive_create_folder`: Create a new folder.
- `drive_update_file`: Update file metadata or content.
- `drive_delete_file`: Trash or permanently delete files/folders.
- `drive_move_file`: Move items between folders.

## Technical Implementation

- **CLI Foundation:** Built on the `gws` CLI (`C:\Users\cgood\AppData\Roaming\npm\gws.cmd`).
- **Shell Handling:** Uses `spawn` with `shell: true` and explicit argument quoting to handle Windows/PowerShell space-splitting issues.
- **Data Flow:**
  - Files are downloaded to local temporary files within the project directory to bypass `gws` security restrictions on system temp folders.
  - JSON payloads are rigorously escaped for shell execution.

## Configuration

The server is registered in `.gemini/settings.json`:
```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["C:/Users/cgood/project_julia/Tooling/geminiAssistant/src/tools/core/google-workspace-mcp/dist/index.js"]
    }
  }
}
```
