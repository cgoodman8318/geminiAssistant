#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { gmailListMessages, gmailGetMessage, gmailSendMessage, gmailTrashMessage } from './gmail-tools.js';
import { tasksListTaskLists, tasksListTasks, tasksCreateTask, tasksGetTask, tasksUpdateTask, tasksDeleteTask } from './tasks-tools.js';
import { calendarListCalendars, calendarListEvents, calendarCreateEvent, calendarUpdateEvent, calendarGetEvent, calendarDeleteEvent } from './calendar-tools.js';
import { driveListFiles, driveGetFileContent, driveCreateFile, driveUpdateFile, driveDeleteFile, driveCreateFolder, driveMoveFile, driveGetFileMetadata } from './drive-tools.js';

const server = new Server(
  {
    name: 'google-workspace-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    // Gmail Tools
    {
      name: 'gmail_list_messages',
      description: 'List Gmail messages with optional query filters.',
      inputSchema: {
        type: 'object',
        properties: {
          q: { type: 'string', description: 'Gmail search query (e.g., "from:someone@example.com")' },
          maxResults: { type: 'number', description: 'Maximum number of messages to return (default 20)' },
          pageToken: { type: 'string', description: 'Page token for pagination' },
        },
      },
    },
    {
      name: 'gmail_get_message',
      description: 'Get full details of a specific Gmail message by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The ID of the message to retrieve' },
        },
        required: ['id'],
      },
    },
    {
      name: 'gmail_send_message',
      description: 'Send a plain-text email.',
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email address' },
          subject: { type: 'string', description: 'Email subject' },
          body: { type: 'string', description: 'Email body content' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
    {
      name: 'gmail_trash_message',
      description: 'Move a specific Gmail message to the trash by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The ID of the message to trash' },
        },
        required: ['id'],
      },
    },
    // Tasks Tools
    {
      name: 'tasks_list_tasklists',
      description: 'List all Google Task lists.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'tasks_list_tasks',
      description: 'List tasks in a specific task list.',
      inputSchema: {
        type: 'object',
        properties: {
          tasklist: { type: 'string', description: 'The ID of the task list' },
          showCompleted: { type: 'boolean', description: 'Whether to show completed tasks' },
          maxResults: { type: 'number', description: 'Max tasks to return' },
        },
        required: ['tasklist'],
      },
    },
    {
      name: 'tasks_create_task',
      description: 'Create a new task in a specific task list.',
      inputSchema: {
        type: 'object',
        properties: {
          tasklist: { type: 'string', description: 'The ID of the task list' },
          title: { type: 'string', description: 'Task title' },
          notes: { type: 'string', description: 'Task notes/description' },
          due: { type: 'string', description: 'Due date in RFC 3339 format (e.g., 2026-03-29T12:00:00Z)' },
        },
        required: ['tasklist', 'title'],
      },
    },
    {
      name: 'tasks_get_task',
      description: 'Returns the specified task.',
      inputSchema: {
        type: 'object',
        properties: {
          tasklist: { type: 'string', description: 'The ID of the task list' },
          task: { type: 'string', description: 'The ID of the task' },
        },
        required: ['tasklist', 'task'],
      },
    },
    {
      name: 'tasks_update_task',
      description: 'Updates the specified task.',
      inputSchema: {
        type: 'object',
        properties: {
          tasklist: { type: 'string', description: 'The ID of the task list' },
          task: { type: 'string', description: 'The ID of the task' },
          title: { type: 'string', description: 'New task title' },
          notes: { type: 'string', description: 'New task notes' },
          status: { type: 'string', description: 'Task status (needsAction or completed)' },
          due: { type: 'string', description: 'New due date (RFC 3339)' },
        },
        required: ['tasklist', 'task'],
      },
    },
    {
      name: 'tasks_delete_task',
      description: 'Deletes the specified task from the task list.',
      inputSchema: {
        type: 'object',
        properties: {
          tasklist: { type: 'string', description: 'The ID of the task list' },
          task: { type: 'string', description: 'The ID of the task' },
        },
        required: ['tasklist', 'task'],
      },
    },
    // Calendar Tools
    {
      name: 'calendar_list_calendars',
      description: 'List all Google Calendars.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'calendar_list_events',
      description: 'List events from a specific calendar.',
      inputSchema: {
        type: 'object',
        properties: {
          calendarId: { type: 'string', description: 'The ID of the calendar (use "primary" for the main calendar)' },
          timeMin: { type: 'string', description: 'Lower bound for an event\'s end time (RFC 3339)' },
          timeMax: { type: 'string', description: 'Upper bound for an event\'s start time (RFC 3339)' },
          maxResults: { type: 'number', description: 'Max events to return' },
        },
        required: ['calendarId'],
      },
    },
    {
      name: 'calendar_create_event',
      description: 'Create a new calendar event.',
      inputSchema: {
        type: 'object',
        properties: {
          calendarId: { type: 'string', description: 'The ID of the calendar' },
          summary: { type: 'string', description: 'Event title' },
          description: { type: 'string', description: 'Event description' },
          start: {
            type: 'object',
            properties: {
              dateTime: { type: 'string', description: 'Start time (RFC 3339)' },
              date: { type: 'string', description: 'Start date (YYYY-MM-DD for all-day events)' },
            }
          },
          end: {
            type: 'object',
            properties: {
              dateTime: { type: 'string', description: 'End time (RFC 3339)' },
              date: { type: 'string', description: 'End date (YYYY-MM-DD for all-day events)' },
            }
          },
        },
        required: ['calendarId', 'summary', 'start', 'end'],
      },
    },
    {
      name: 'calendar_update_event',
      description: 'Update or patch an existing calendar event.',
      inputSchema: {
        type: 'object',
        properties: {
          calendarId: { type: 'string', description: 'The ID of the calendar' },
          eventId: { type: 'string', description: 'The ID of the event to update' },
          updates: { 
            type: 'object', 
            description: 'The fields to update (e.g., { "colorId": "11" })',
            additionalProperties: true
          },
        },
        required: ['calendarId', 'eventId', 'updates'],
      },
    },
    {
      name: 'calendar_get_event',
      description: 'Returns the specified event.',
      inputSchema: {
        type: 'object',
        properties: {
          calendarId: { type: 'string', description: 'The ID of the calendar' },
          eventId: { type: 'string', description: 'The ID of the event to retrieve' },
        },
        required: ['calendarId', 'eventId'],
      },
    },
    {
      name: 'calendar_delete_event',
      description: 'Deletes an event.',
      inputSchema: {
        type: 'object',
        properties: {
          calendarId: { type: 'string', description: 'The ID of the calendar' },
          eventId: { type: 'string', description: 'The ID of the event to delete' },
        },
        required: ['calendarId', 'eventId'],
      },
    },
    // Drive Tools
    {
      name: 'drive_list_files',
      description: 'List or search for files in Google Drive.',
      inputSchema: {
        type: 'object',
        properties: {
          q: { type: 'string', description: 'Drive search query (see https://developers.google.com/drive/api/guides/search-files)' },
          pageSize: { type: 'number', description: 'Max files to return' },
          pageToken: { type: 'string', description: 'Page token for pagination' },
        },
      },
    },
    {
      name: 'drive_get_file_content',
      description: 'Get the content of a file from Google Drive. For Google Docs/Sheets, it will be exported as text/csv.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The ID of the file to retrieve' },
        },
        required: ['id'],
      },
    },
    {
      name: 'drive_create_file',
      description: 'Create a new file in Google Drive.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The name of the file' },
          mimeType: { type: 'string', description: 'The MIME type of the file' },
          parents: { type: 'array', items: { type: 'string' }, description: 'Parent folder IDs' },
          content: { type: 'string', description: 'The content of the file' },
        },
        required: ['name'],
      },
    },
    {
      name: 'drive_update_file',
      description: 'Update or edit an existing file in Google Drive.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The ID of the file to update' },
          name: { type: 'string', description: 'New name for the file' },
          content: { type: 'string', description: 'New content for the file' },
        },
        required: ['id'],
      },
    },
    {
      name: 'drive_delete_file',
      description: 'Move a file to trash or permanently delete it.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The ID of the file to delete' },
          permanent: { type: 'boolean', description: 'Whether to permanently delete instead of trashing' },
        },
        required: ['id'],
      },
    },
    {
      name: 'drive_create_folder',
      description: 'Create a new folder in Google Drive.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The name of the folder' },
          parents: { type: 'array', items: { type: 'string' }, description: 'Parent folder IDs' },
        },
        required: ['name'],
      },
    },
    {
      name: 'drive_move_file',
      description: 'Move a file between folders.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The ID of the file to move' },
          addParents: { type: 'array', items: { type: 'string' }, description: 'Folder IDs to add' },
          removeParents: { type: 'array', items: { type: 'string' }, description: 'Folder IDs to remove' },
        },
        required: ['id', 'addParents', 'removeParents'],
      },
    },
    {
      name: 'drive_get_file_metadata',
      description: 'Get detailed metadata for a file, including parents.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The ID of the file' },
          fields: { type: 'string', description: 'Specific fields to retrieve (e.g., "id,name,parents")' },
        },
        required: ['id'],
      },
    },
    ],
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
    switch (name) {
      case 'gmail_list_messages': return await gmailListMessages(args as any);
      case 'gmail_get_message': return await gmailGetMessage(args as any);
      case 'gmail_send_message': return await gmailSendMessage(args as any);
      case 'gmail_trash_message': return await gmailTrashMessage(args as any);

      case 'tasks_list_tasklists': return await tasksListTaskLists();
      case 'tasks_list_tasks': return await tasksListTasks(args as any);
      case 'tasks_create_task': return await tasksCreateTask(args as any);
      case 'tasks_get_task': return await tasksGetTask(args as any);
      case 'tasks_update_task': return await tasksUpdateTask(args as any);
      case 'tasks_delete_task': return await tasksDeleteTask(args as any);

      case 'calendar_list_calendars': return await calendarListCalendars();
      case 'calendar_list_events': return await calendarListEvents(args as any);
      case 'calendar_create_event': return await calendarCreateEvent(args as any);
      case 'calendar_update_event': return await calendarUpdateEvent(args as any);
      case 'calendar_get_event': return await calendarGetEvent(args as any);
      case 'calendar_delete_event': return await calendarDeleteEvent(args as any);

      case 'drive_list_files': return await driveListFiles(args as any);
      case 'drive_get_file_content': return await driveGetFileContent(args as any);
      case 'drive_create_file': return await driveCreateFile(args as any);
      case 'drive_update_file': return await driveUpdateFile(args as any);
      case 'drive_delete_file': return await driveDeleteFile(args as any);
      case 'drive_create_folder': return await driveCreateFolder(args as any);
      case 'drive_move_file': return await driveMoveFile(args as any);
      case 'drive_get_file_metadata': return await driveGetFileMetadata(args as any);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: error.message || 'An unexpected error occurred' }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Workspace MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
