import { gmailListMessages, gmailGetMessage } from './gmail-tools.js';
async function test() {
    console.log('Testing gmailListMessages (maxResults: 1)...');
    const listResult = await gmailListMessages({ maxResults: 1 });
    console.log('List Result:', JSON.stringify(listResult, null, 2));
    const listData = JSON.parse(listResult.content[0].text);
    if (listData.messages && listData.messages.length > 0) {
        const id = listData.messages[0].id;
        console.log(`\nTesting gmailGetMessage (id: ${id})...`);
        const getResult = await gmailGetMessage({ id });
        console.log('Get Result:', getResult.content[0].text.substring(0, 1000) + '...');
    }
}
test();
