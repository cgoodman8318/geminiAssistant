import { runGws } from './gws-runner.js';
export async function calendarListCalendars() {
    const result = await runGws('calendar', 'calendarList', 'list');
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to list calendars' }] };
    }
    return {
        content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
    };
}
export async function calendarListEvents(args) {
    const params = {
        calendarId: args.calendarId,
        singleEvents: true,
        orderBy: 'startTime'
    };
    if (args.timeMin)
        params.timeMin = args.timeMin;
    if (args.timeMax)
        params.timeMax = args.timeMax;
    if (args.maxResults)
        params.maxResults = args.maxResults;
    const result = await runGws('calendar', 'events', 'list', { params });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to list events' }] };
    }
    return {
        content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
    };
}
export async function calendarCreateEvent(args) {
    const params = { calendarId: args.calendarId };
    const json = {
        summary: args.summary,
        description: args.description,
        start: args.start,
        end: args.end
    };
    const result = await runGws('calendar', 'events', 'insert', { params, json });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to create event' }] };
    }
    return {
        content: [{ type: 'text', text: `Event created successfully: ${JSON.stringify(result.data, null, 2)}` }]
    };
}
export async function calendarUpdateEvent(args) {
    const params = { calendarId: args.calendarId, eventId: args.eventId };
    const json = args.updates;
    const result = await runGws('calendar', 'events', 'patch', { params, json });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to update event' }] };
    }
    return {
        content: [{ type: 'text', text: `Event updated successfully: ${JSON.stringify(result.data, null, 2)}` }]
    };
}
export async function calendarGetEvent(args) {
    const params = { calendarId: args.calendarId, eventId: args.eventId };
    const result = await runGws('calendar', 'events', 'get', { params });
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to get event' }] };
    }
    return {
        content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
    };
}
export async function calendarDeleteEvent(args) {
    const params = { calendarId: args.calendarId, eventId: args.eventId };
    const result = await runGws('calendar', 'events', 'delete', { params });
    // delete returns 204 No Content
    if (!result.success && result.error?.includes('Failed to parse gws output')) {
        return {
            content: [{ type: 'text', text: `Event ${args.eventId} deleted successfully.` }]
        };
    }
    if (!result.success) {
        return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to delete event' }] };
    }
    return {
        content: [{ type: 'text', text: `Event ${args.eventId} deleted successfully.` }]
    };
}
