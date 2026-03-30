import { tasksListTaskLists, tasksListTasks } from './tasks-tools.js';

async function test() {
  console.log('Testing tasksListTaskLists...');
  const listResult = await tasksListTaskLists();
  console.log('Task Lists:', listResult.content[0].text);

  const data = JSON.parse(listResult.content[0].text);
  if (data.items && data.items.length > 0) {
    const id = data.items[0].id;
    console.log(`\nTesting tasksListTasks (tasklist: ${id})...`);
    const tasksResult = await tasksListTasks({ tasklist: id, maxResults: 1 });
    console.log('Tasks:', tasksResult.content[0].text);
  }
}

test();
