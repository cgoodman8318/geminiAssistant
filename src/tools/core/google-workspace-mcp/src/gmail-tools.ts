import { runGws, runGwsHelper } from './gws-runner.js';

interface SimplifiedMessage {
  id: string;
  threadId: string;
  from?: string;
  subject?: string;
  date?: string;
  body?: string;
  snippet?: string;
}

function extractBody(payload: any): string {
  if (payload.body && payload.body.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }
  
  if (payload.parts) {
    // Look for text/plain part
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart && plainPart.body && plainPart.body.data) {
      return Buffer.from(plainPart.body.data, 'base64').toString('utf-8');
    }
    
    // Recurse into parts
    for (const part of payload.parts) {
      const body = extractBody(part);
      if (body) return body;
    }
  }
  
  return '';
}

function simplifyMessage(raw: any): SimplifiedMessage {
  const headers = raw.payload?.headers || [];
  const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value;

  return {
    id: raw.id,
    threadId: raw.threadId,
    from: getHeader('From'),
    subject: getHeader('Subject'),
    date: getHeader('Date'),
    snippet: raw.snippet,
    body: extractBody(raw.payload)
  };
}

export async function gmailListMessages(args: { q?: string, maxResults?: number, pageToken?: string }) {
  const params: any = { userId: 'me' };
  if (args.q) params.q = args.q;
  if (args.maxResults) params.maxResults = args.maxResults;
  if (args.pageToken) params.pageToken = args.pageToken;

  const result = await runGws('gmail', 'users messages', 'list', { params });
  
  if (!result.success) {
    return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to list messages' }] };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(result.data, null, 2) }]
  };
}

export async function gmailGetMessage(args: { id: string }) {
  const result = await runGws('gmail', 'users messages', 'get', { 
    params: { userId: 'me', id: args.id } 
  });

  if (!result.success) {
    return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to get message' }] };
  }

  const simplified = simplifyMessage(result.data);
  return {
    content: [{ type: 'text', text: JSON.stringify(simplified, null, 2) }]
  };
}

export async function gmailSendMessage(args: { to: string, subject: string, body: string }) {
  // Use the +send helper
  // We wrap in literal double quotes to handle spaces on Windows
  const result = await runGwsHelper('gmail', 'send', [
    '--to', `"${args.to}"`,
    '--subject', `"${args.subject}"`,
    '--body', `"${args.body}"`
  ]);

  if (!result.success) {
    return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to send message' }] };
  }

  return {
    content: [{ type: 'text', text: 'Email sent successfully!' }]
  };
}

export async function gmailTrashMessage(args: { id: string }) {
  const result = await runGws('gmail', 'users messages', 'trash', { 
    params: { userId: 'me', id: args.id } 
  });

  if (!result.success) {
    return { isError: true, content: [{ type: 'text', text: result.error || 'Failed to trash message' }] };
  }

  return {
    content: [{ type: 'text', text: `Message ${args.id} moved to trash.` }]
  };
}
