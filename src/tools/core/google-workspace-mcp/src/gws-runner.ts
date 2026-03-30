import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface GwsResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  exitCode: number;
}

export interface GwsOptions {
  params?: Record<string, any>;
  json?: Record<string, any>;
  apiVersion?: string;
}

/**
 * Escapes JSON for safe usage in a shell command (Windows-compatible).
 */
function escapeJson(obj: Record<string, any>): string {
  const jsonStr = JSON.stringify(obj);
  const escaped = jsonStr.replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * Extracts JSON from gws output by finding the first { or [.
 */
function extractJson(output: string): string {
  const firstBrace = output.indexOf('{');
  const firstBracket = output.indexOf('[');
  
  let startIdx = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket);
  } else {
    startIdx = firstBrace !== -1 ? firstBrace : firstBracket;
  }

  if (startIdx === -1) {
    return output.trim();
  }

  return output.substring(startIdx).trim();
}

/**
 * Executes a gws +helper command (e.g., gws gmail +send)
 * Uses spawn to avoid shell escaping issues with spaces.
 */
export async function runGwsHelper<T = any>(
  service: string,
  helper: string,
  args: string[]
): Promise<GwsResult<T>> {
  return new Promise((resolve) => {
    // For Windows shell compatibility, we wrap every argument in double quotes.
    const quotedArgs = args.map(arg => {
      // Escape any internal double quotes with \
      const escaped = arg.replace(/"/g, '\\"');
      return `"${escaped}"`;
    });

    const fullArgs = [service, `+${helper}`, ...quotedArgs, '--format', 'json'];
    const command = process.platform === 'win32' ? 'gws.cmd' : 'gws';
    // Use shell: true to resolve .cmd files on Windows
    const child = spawn(command, fullArgs, { shell: true });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (exitCode) => {
      const actualExitCode = exitCode ?? 1;
      if (actualExitCode === 0) {
        const jsonStr = extractJson(stdout);
        try {
          const data = JSON.parse(jsonStr);
          resolve({ success: true, data, exitCode: 0 });
        } catch {
          resolve({ success: true, data: stdout as any, exitCode: 0 });
        }
      } else {
        let errorMessage = stderr.trim() || 'Unknown error';
        if (actualExitCode === 2) {
          errorMessage = "Authentication required. Please run 'gws auth login' in your terminal.";
        }
        resolve({ success: false, error: errorMessage, exitCode: actualExitCode });
      }
    });
  });
}

export async function runGws<T = any>(
  service: string,
  resource: string,
  method: string,
  options?: GwsOptions
): Promise<GwsResult<T>> {
  let command = `gws ${service} ${resource} ${method} --format json`;

  if (options?.params) {
    command += ` --params ${escapeJson(options.params)}`;
  }

  if (options?.json) {
    command += ` --json ${escapeJson(options.json)}`;
  }

  if (options?.apiVersion) {
    command += ` --api-version ${options.apiVersion}`;
  }

  try {
    // maxBuffer set to 10MB to handle large lists
    const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
    
    const jsonStr = extractJson(stdout);
    try {
      const data = JSON.parse(jsonStr);
      return {
        success: true,
        data,
        exitCode: 0
      };
    } catch (parseError) {
      return {
        success: false,
        error: `Failed to parse gws output as JSON: ${jsonStr.substring(0, 100)}...`,
        exitCode: 0
      };
    }
  } catch (error: any) {
    const exitCode = error.code || 1;
    let errorMessage = error.stderr || error.message || 'Unknown error';

    // Map gws exit codes
    if (exitCode === 2) {
      errorMessage = "Authentication required. Please run 'gws auth login' in your terminal.";
    } else if (exitCode === 3) {
      errorMessage = `Validation error: ${errorMessage}`;
    }

    return {
      success: false,
      error: errorMessage.trim(),
      exitCode
    };
  }
}
