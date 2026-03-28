#!/usr/bin/env node --import tsx
import { chromium } from 'playwright-extra';
const stealth = require('puppeteer-extra-plugin-stealth')();
import { Page } from 'playwright';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

chromium.use(stealth);

const BASE_URL = 'https://wol.jw.org';

async function getDailyText(page: Page, date?: string) {
    const targetUrl = date 
        ? `${BASE_URL}/en/wol/h/r1/lp-e/${date}` 
        : `${BASE_URL}/en/wol/h/r1/lp-e/${new Date().toISOString().split('T')[0].replace(/-/g, '/')}`;
    
    console.error(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const data = await page.evaluate(() => {
        const themeScrp = document.querySelector('.themeScrp')?.textContent?.trim() || '';
        const bodyTxt = document.querySelector('.bodyTxt')?.textContent?.trim() || '';
        
        const refLinks = Array.from(document.querySelectorAll('.articlePositioner a'))
            .map(a => (a as HTMLAnchorElement).href)
            .filter(href => href.includes('wol.jw.org'));

        return { themeScrp, bodyTxt, refLinks };
    });

    const refs = [];
    for (const link of data.refLinks) {
        refs.push(await getReferenceContent(page, link));
    }

    return {
        themeScripture: data.themeScrp,
        bodyText: data.bodyTxt,
        refs: refs.filter(r => r !== null)
    };
}

async function getReferenceContent(page: Page, url: string) {
    console.error(`Fetching reference: ${url}...`);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        const fragment = new URL(url).hash;
        
        const content = await page.evaluate((frag) => {
            const parentTitle = (document.querySelector('#parentTitle') as HTMLInputElement)?.value || '';
            const contentTitle = (document.querySelector('#contentTitle') as HTMLInputElement)?.value || '';
            let text = '';

            const getTextNoFootnotes = (el: Element) => {
                const clone = el.cloneNode(true) as HTMLElement;
                clone.querySelectorAll('.fn, .vp, .parNum, b').forEach(n => n.remove());
                return clone.textContent?.trim() || '';
            };

            // Paragraph range: #h=11:0-11:297
            const hMatch = frag.match(/#h=(\d+).*-(\d+)/);
            if (hMatch) {
                const startPid = parseInt(hMatch[1]);
                const endPid = parseInt(hMatch[2]);
                const paragraphs = [];
                for (let i = startPid; i <= endPid; i++) {
                    const p = document.querySelector(`p[data-pid="${i}"]`);
                    if (p) paragraphs.push(getTextNoFootnotes(p));
                }
                text = paragraphs.join('\n\n');
            } 
            // Verse range: #v=1:1:1-1:1:5
            else if (frag.includes('#v=')) {
                const vMatch = frag.match(/#v=((\d+):(\d+):(\d+))(-\d+:\d+:(\d+))?$/);
                if (vMatch) {
                    const book = vMatch[2];
                    const chap = vMatch[3];
                    const startVerse = parseInt(vMatch[4]);
                    const endVerse = vMatch[6] ? parseInt(vMatch[6]) : startVerse;
                    
                    const verses = [];
                    for (let v = startVerse; v <= endVerse; v++) {
                        const vEl = document.querySelector(`[id^="v${book}-${chap}-${v}"]`);
                        if (vEl) verses.push(getTextNoFootnotes(vEl));
                    }
                    text = verses.join(' ');
                }
            }

            if (!text) return null;

            return {
                refTitle: contentTitle,
                refParentTitle: parentTitle,
                text: text,
                url: window.location.href
            };
        }, fragment);

        return content;
    } catch (e) {
        console.error(`Error fetching ${url}:`, e);
        return null;
    }
}

if (require.main === module) {
    yargs(hideBin(process.argv))
        .command('daily [date]', 'Scrape daily text and references', {
            date: { type: 'string', description: 'Date in YYYY/MM/DD format' }
        }, async (argv: any) => {
            const browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();
            try {
                const result = await getDailyText(page, argv.date as string);
                console.log(JSON.stringify(result, null, 2));
            } finally {
                await browser.close();
            }
        })
        .demandCommand(1)
        .help()
        .parse();
}
