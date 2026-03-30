import { spawn } from 'node:child_process';
const service = 'gmail';
const helper = 'send';
const args = [
    '--to', 'cgoodman8318@gmail.com',
    '--subject', 'test mcp',
    '--body', 'Manual spawn test'
];
const fullArgs = [service, `+${helper}`, '--to', '"cgoodman8318@gmail.com"', '--subject', '"test mcp"', '--body', '"Manual spawn test"', '--format', 'json'];
const command = process.platform === 'win32' ? 'gws.cmd' : 'gws';
console.log('Command:', command);
console.log('Args:', JSON.stringify(fullArgs));
const child = spawn(command, fullArgs, { shell: true });
child.stdout.on('data', (data) => { console.log('STDOUT:', data.toString()); });
child.stderr.on('data', (data) => { console.error('STDERR:', data.toString()); });
child.on('close', (code) => {
    console.log('Process exited with code:', code);
});
