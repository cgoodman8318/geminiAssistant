import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

import * as os from 'os';

const STATE_DIR = path.join(os.homedir(), '.gemini');
const STATE_FILE = path.join(STATE_DIR, 'browser_session_state.json');

async function getAccessibilityTree(page: Page) {
    return await page.evaluate(() => {
        const getLabel = (el: HTMLElement) => {
            return el.innerText?.trim() || el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('placeholder') || '';
        };

        const elements = Array.from(document.querySelectorAll('button, input, select, a, [role="button"], [role="link"], h1, h2, h3'));
        
        return elements.map((el, index) => {
            const htmlEl = el as HTMLElement;
            const rect = htmlEl.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return null;

            return {
                id: index,
                tag: htmlEl.tagName.toLowerCase(),
                role: htmlEl.getAttribute('role') || htmlEl.tagName.toLowerCase(),
                label: getLabel(htmlEl),
                text: htmlEl.innerText?.substring(0, 50).trim() || '',
                isVisible: true
            };
        }).filter(item => item !== null && (item.label || item.text));
    });
}

async function runAction(command: string, target?: string, value?: string) {
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--disable-http2', '--no-sandbox'] 
    });
    
    if (!fs.existsSync(STATE_DIR)) {
        fs.mkdirSync(STATE_DIR, { recursive: true });
    }
    const contextOptions = fs.existsSync(STATE_FILE) ? { storageState: STATE_FILE } : {};
    const context = await browser.newContext({
        ...contextOptions,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
        if (command === 'goto') {
            await page.goto(target!, { waitUntil: 'networkidle', timeout: 60000 });
        } else if (command === 'click') {
            // Find by text or aria-label if possible
            await page.click(target!);
        } else if (command === 'type') {
            await page.fill(target!, value!);
        }

        // Always Map after action
        const tree = await getAccessibilityTree(page);
        const title = await page.title();
        const url = await page.url();

        console.log(JSON.stringify({
            title,
            url,
            map: tree
        }, null, 2));

        await context.storageState({ path: STATE_FILE });

    } catch (error: any) {
        console.log(JSON.stringify({ error: error.message }));
    } finally {
        await browser.close();
    }
}

const [cmd, target, val] = process.argv.slice(2);
runAction(cmd, target, val);
