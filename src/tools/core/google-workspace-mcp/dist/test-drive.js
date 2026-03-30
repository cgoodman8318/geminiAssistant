import { driveListFiles } from './drive-tools.js';
async function test() {
    console.log('Testing driveListFiles (pageSize: 1)...');
    const result = await driveListFiles({ pageSize: 1 });
    console.log('Files:', result.content[0].text);
}
test();
