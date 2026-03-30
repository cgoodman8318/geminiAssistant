import { runGws } from './gws-runner.js';
export async function tasksListTaskLists() {
    const result = await runGws('tasks', 'tasklists', 'list');
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to list task lists' }] };
    }
    return {
        content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
    };
}
export async function tasksListTasks(args) {
    const params = {
        tasklist: args.tasklist,
        showCompleted: args.showCompleted ?? false
    };
    if (args.maxResults)
        params.maxResults = args.maxResults;
    const result = await runGws('tasks', 'tasks', 'list', { params });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to list tasks' }] };
    }
    return {
        content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
    };
}
export async function tasksCreateTask(args) {
    const params = { tasklist: args.tasklist };
    const json = { title: args.title };
    if (args.notes)
        json.notes = args.notes;
    if (args.due)
        json.due = args.due;
    const result = await runGws('tasks', 'tasks', 'insert', { params, json });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to create task' }] };
    }
    return {
        content: [{ type: 'text', text: `Task created successfully: ${JSON.stringify(result.data, null, 2)}` }]
    };
}
export async function tasksGetTask(args) {
    const params = { tasklist: args.tasklist, task: args.task };
    const result = await runGws('tasks', 'tasks', 'get', { params });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to get task' }] };
    }
    return {
        content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
    };
}
export async function tasksUpdateTask(args) {
    const params = { tasklist: args.tasklist, task: args.task };
    const json = { id: args.task };
    if (args.title)
        json.title = args.title;
    if (args.notes)
        json.notes = args.notes;
    if (args.status)
        json.status = args.status;
    if (args.due)
        json.due = args.due;
    const result = await runGws('tasks', 'tasks', 'update', { params, json });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to update task' }] };
    }
    return {
        content: [{ type: 'text', text: `Task updated successfully: ${JSON.stringify(result.data, null, 2)}` }]
    };
}
export async function tasksDeleteTask(args) {
    const params = { tasklist: args.tasklist, task: args.task };
    const result = await runGws('tasks', 'tasks', 'delete', { params });
    // delete often returns 204 No Content, which runGws might fail to parse as JSON
    if (!result.success && result.error?.includes('Failed to parse gws output')) {
        return {
            content: [{ type: 'text', text: `Task ${args.task} deleted successfully.` }]
        };
    }
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to delete task' }] };
    }
    return {
        content: [{ type: 'text', text: `Task ${args.task} deleted successfully.` }]
    };
}
