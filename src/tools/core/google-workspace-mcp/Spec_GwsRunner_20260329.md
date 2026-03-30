# Spec: Core CLI Wrapper (`gws-runner.ts`)

## TLDR
- **What it does:** Provides a programmatic interface to execute the `gws` CLI tool.
- **Approach:** Uses Node.js `child_process.exec` to run commands and captures JSON output.
- **Key Decisions:** Implements "junk skipping" to strip non-JSON headers from `gws` output and maps exit codes to semantic error types.

## Architecture Overview
The `GwsRunner` is a stateless utility module. It constructs shell commands based on input parameters, handles the complexities of shell-escaping JSON strings, and parses the resulting output. It is designed to be used by all service-specific tools (Gmail, Tasks, etc.).

## Data Structures & Types
```typescript
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
```

## Function Signatures & Module Layout
```typescript
/**
 * Executes a gws command and returns the parsed result.
 */
export async function runGws<T = any>(
  service: string,
  resource: string,
  method: string,
  options?: GwsOptions
): Promise<GwsResult<T>>;

/**
 * Internal helper to sanitize and escape JSON for shell execution.
 */
function escapeJson(obj: Record<string, any>): string;

/**
 * Internal helper to extract JSON from gws output (skipping info logs).
 */
function extractJson(output: string): string;
```

## Control Flow
1.  **Command Construction:**
    *   Base: `gws <service> <resource> <method> --format json`
    *   If `options.params`: append `--params '<escaped_json>'`
    *   If `options.json`: append `--json '<escaped_json>'`
    *   If `options.apiVersion`: append `--api-version <version>`
2.  **Execution:**
    *   Run using `util.promisify(child_process.exec)`.
    *   Set a reasonable timeout (e.g., 30 seconds).
3.  **Error Handling:**
    *   Catch execution errors (e.g., `gws` not found).
    *   Check `exitCode`:
        *   `2`: Return error "Authentication required. Please run 'gws auth login' in your terminal."
        *   `3`: Return validation error details from `stderr`.
        *   `1, 4, 5`: Return general error with `stderr` content.
4.  **Output Parsing:**
    *   Use `extractJson` to find the first `{` or `[` and slice the string from there.
    *   `JSON.parse()` the result.
5.  **Return:** Wrap data in `GwsResult`.

## Integration Points
- **Consistently used by:** `index.ts` (the tool handlers).
- **Relies on:** `gws` CLI being globally installed and authenticated.

## Edge Cases & Failure Modes
- **Malformed JSON in output:** If `gws` returns an error message that isn't JSON even with `--format json`.
- **Large Output:** Ensure `maxBuffer` for `exec` is sufficient (e.g., 10MB).
- **Shell Escaping:** On Windows (where this is running), double quotes and backslashes in JSON strings need careful handling when passed via `exec`.

## Implementation Checklist
- [ ] Create `src/gws-runner.ts`.
- [ ] Implement `runGws` with `child_process.exec`.
- [ ] Implement `extractJson` utility.
- [ ] Implement `escapeJson` utility (handling Windows shell nuances).
- [ ] Add error mapping for `gws` exit codes.
- [ ] Write a small test script/harness to verify `runGws` works with `gws tasks tasklists list`.

## Test Plan
- **Unit Test:** `extractJson` with various "junk" headers.
- **Integration Test:** Call `runGws('tasks', 'tasklists', 'list')` and verify it returns a successful `GwsResult` with valid task lists.
- **Error Test:** Call a non-existent service and verify it returns `success: false` with a descriptive error.

## Definition of Done
- `runGws` can successfully execute a command and return parsed JSON data.
- Authentication errors are clearly identified and return a helpful instruction to the user.
- The module is ready to be imported by service implementations.
