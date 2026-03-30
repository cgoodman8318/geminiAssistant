import { runGws } from './gws-runner.js';
async function test() {
    console.log('Testing gws tasks tasklists list...');
    const result = await runGws('tasks', 'tasklists', 'list');
    if (result.success) {
        console.log('SUCCESS!');
        console.log('Data:', JSON.stringify(result.data, null, 2).substring(0, 500) + '...');
    }
    else {
        console.error('FAILED!');
        console.error('Error:', result.error);
        console.error('Exit Code:', result.exitCode);
    }
}
test();
