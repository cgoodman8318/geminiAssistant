#!/usr/bin/env node --import tsx
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as http from 'http';
import * as https from 'https';

// ==============================================================================
// 1. Data Structures
// ==============================================================================

export interface ChapterOutput {
    index: number;
    title: string | null;
    file_url: string;
    relative_path: string;
}

export interface Job {
    job_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    text_preview: string;
    created_at: string;
    output_file: string | null;
    chapter_outputs: ChapterOutput[] | null;
    error: string | null;
    chapter_mode: boolean;
}

export interface Voice {
    id: string;
    name: string;
    lang_code: string;
    category: 'standard' | 'custom';
}

// ==============================================================================
// 2. Client Class
// ==============================================================================

export class KokoroClient {
    private baseUrl: string;
    private axiosInstance: AxiosInstance;

    constructor(url: string = 'http://localhost:5000') {
        this.baseUrl = url.replace(/\/+$/, '');
        if (!this.baseUrl.startsWith('http')) {
            this.baseUrl = `http://${this.baseUrl}`;
        }
        
        // Disable keep-alive to prevent blocking single-threaded servers
        this.axiosInstance = axios.create({
            httpAgent: new http.Agent({ keepAlive: false }),
            httpsAgent: new https.Agent({ keepAlive: false })
        });
    }

    private getUrl(endpoint: string): string {
        return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
    }

    async getVoices(): Promise<Voice[]> {
        const url = this.getUrl('api/voices');
        try {
            const resp = await this.axiosInstance.get(url, { timeout: 10000 });
            const data = resp.data;

            if (data.success) {
                const voiceList: Voice[] = [];
                for (const groupName in data.voices) {
                    const groupData = data.voices[groupName];
                    const lang = groupData.lang_code || 'unknown';

                    // Standard Voices
                    if (groupData.voices) {
                        for (const vId of groupData.voices) {
                            voiceList.push({ id: vId, name: vId, lang_code: lang, category: 'standard' });
                        }
                    }

                    // Custom Voices
                    if (groupData.custom_voices) {
                        for (const cv of groupData.custom_voices) {
                            voiceList.push({ id: cv.code, name: cv.name, lang_code: lang, category: 'custom' });
                        }
                    }
                }
                return voiceList;
            } else {
                throw new Error(`Failed to fetch voices: ${data.error || 'Unknown error'}`);
            }
        } catch (e: any) {
            throw new Error(`Connection error: ${e.message}`);
        }
    }

    async submitJob(text: string, voices: any, splitChapters: boolean = false): Promise<string> {
        console.error('Submitting job to /api/generate...');
        const url = this.getUrl('api/generate');
        const payload = {
            text,
            voice_assignments: voices,
            split_by_chapter: splitChapters
        };

        const resp = await this.axiosInstance.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        const data = resp.data;
        if (data.success) {
            console.error(`Job submitted successfully. ID: ${data.job_id}`);
            return data.job_id;
        } else {
            throw new Error(`Server rejected job: ${data.error || 'Unknown error'}`);
        }
    }

    async getQueue(): Promise<Job[]> {
        const url = this.getUrl('api/queue');
        try {
            const resp = await this.axiosInstance.get(url, { timeout: 10000 });
            if (resp.data.success) {
                return resp.data.jobs;
            } else {
                throw new Error('Failed to fetch queue');
            }
        } catch (e: any) {
            throw new Error(`Failed to fetch queue: ${e.message}`);
        }
    }

    async waitForJob(jobId: string, pollInterval: number = 2000): Promise<Job> {
        console.error(`Waiting for Job ${jobId} to complete...`);
        
        let lastStatus = '';
        while (true) {
            const allJobs = await this.getQueue();
            const job = allJobs.find(j => j.job_id === jobId);

            if (!job) {
                throw new Error(`Job ID ${jobId} lost! It may have been cleared from the server.`);
            }

            const currentStatus = `Status: ${job.status} | Progress: ${job.progress}%${job.chapter_mode ? ` | Chapters: ${job.chapter_outputs?.length || 0}` : ''}`;
            if (currentStatus !== lastStatus) {
                console.error(currentStatus);
                lastStatus = currentStatus;
            }

            if (job.status === 'completed') {
                return job;
            } else if (job.status === 'failed' || job.status === 'cancelled') {
                throw new Error(`Job ended with status: ${job.status}. Error: ${job.error || 'None'}`);
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
    }

    async downloadAudio(jobId: string, outputPath: string): Promise<void> {
        const isZip = outputPath.toLowerCase().endsWith('.zip');
        const urlPath = isZip ? `api/download/${jobId}/zip` : `api/download/${jobId}`;
        const url = this.getUrl(urlPath);

        console.error(`Downloading content to ${outputPath}...`);

        try {
            const response = await this.axiosInstance({
                method: 'GET',
                url: url,
                responseType: 'stream',
                timeout: 60000 // 60 seconds for download start
            });

            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.error('Download complete.');
                    resolve();
                });
                writer.on('error', reject);
            });
        } catch (e: any) {
            if (e.response && e.response.status === 404) {
                throw new Error('File not found on server. The job might not be finished or valid.');
            } else {
                throw e;
            }
        }
    }
}

// ==============================================================================
// 3. CLI Logic
// ==============================================================================

if (require.main === module) {
    const defaultUrl = process.env.KOKORO_SERVER_URL || 'http://192.168.1.68:5000';
    const client = new KokoroClient(defaultUrl);

    yargs(hideBin(process.argv))
        .command('voices', 'List available voices', {}, async () => {
            try {
                const voices = await client.getVoices();
                console.table(voices.map(v => ({ ID: v.id, Name: v.name, Lang: v.lang_code, Category: v.category })));
            } catch (e: any) {
                console.error(e.message);
            }
        })
        .command('generate', 'Submit a TTS job', {
            text: { type: 'string', alias: 't', description: 'Text to synthesize' },
            file: { type: 'string', alias: 'f', description: 'Path to a file containing text to synthesize' },
            voices: { type: 'string', alias: 'v', description: 'JSON string for voice assignments' },
            voices_file: { type: 'string', alias: 'vf', description: 'Path to a JSON file containing voice assignments' },
            output: { type: 'string', demandOption: true, alias: 'o', description: 'Output file path' }
        }, async (argv) => {
            try {
                let text = argv.text as string;
                if (argv.file) {
                    text = await fs.readFile(argv.file as string, 'utf-8');
                }
                if (!text) {
                    throw new Error('Please provide either --text or --file');
                }

                let voiceMap;
                if (argv.voices_file) {
                    voiceMap = JSON.parse(await fs.readFile(argv.voices_file as string, 'utf-8'));
                } else if (argv.voices) {
                    voiceMap = JSON.parse(argv.voices as string);
                } else {
                    throw new Error('Please provide either --voices or --voices_file');
                }

                const jobId = await client.submitJob(text, voiceMap);
                console.log(`Job submitted: ${jobId}`);
                await client.waitForJob(jobId);
                await client.downloadAudio(jobId, argv.output);
            } catch (e: any) {
                console.error(e.message);
            }
        })
        .command('status <jobId>', 'Check job status', {}, async (argv) => {
            try {
                const jobs = await client.getQueue();
                const job = (jobs as any[]).find(j => j.job_id === argv.jobId);
                if (job) {
                    console.log(JSON.stringify(job, null, 2));
                } else {
                    console.log('Job not found.');
                }
            } catch (e: any) {
                console.error(e.message);
            }
        })
        .command('download <jobId> <output>', 'Download audio for a job', {}, async (argv) => {
            try {
                await client.downloadAudio(argv.jobId as string, argv.output as string);
            } catch (e: any) {
                console.error(e.message);
            }
        })
        .demandCommand(1, 'Please provide a command')
        .help()
        .parse();
}
