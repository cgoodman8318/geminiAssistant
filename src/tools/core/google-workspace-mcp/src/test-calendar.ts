import { calendarListCalendars, calendarListEvents } from './calendar-tools.js';

async function test() {
  console.log('Testing calendarListCalendars...');
  const listResult = await calendarListCalendars();
  console.log('Calendars:', listResult.content[0].text);

  console.log('\nTesting calendarListEvents (calendarId: primary, maxResults: 1)...');
  const eventsResult = await calendarListEvents({ calendarId: 'primary', maxResults: 1 });
  console.log('Events:', eventsResult.content[0].text);
}

test();
