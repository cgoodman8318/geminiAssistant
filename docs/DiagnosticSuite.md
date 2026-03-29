# Deterministic Diagnostic Suite & code-debugger

This workspace implements a deterministic, multi-ecosystem diagnostic engine via session hooks to provide high-reasoning troubleshooting.

## 1. The Architecture
- **Phase A (SessionStart):** `snapshotBuilder.jl` maps Julia and Python dependencies to `.gemini/context/manifestSnapshot.json`. This provides the deterministic state of all installed packages.
- **Phase B (AfterTool):** `forensicLookup.jl` intercepts failures, parses stack traces, and injects diagnostic context into the agent's payload.
- **Specialized Agent:** The **`code-debugger`** skill consumes this context for expert troubleshooting.
- **Language Extension:** Support for new ecosystems follows the [Language Extension Spec](../.gemini/docs/LanguageExtensionSpec.md).

## 2. Diagnostic Mode Procedures
If the agent receives a payload containing the `[DIAGNOSTIC MODE ACTIVE]` flag (injected by the `forensicLookup.jl` hook upon tool failure), it MUST strictly adhere to the following sequence:

1. **Identify Root Cause:** Analyze the injected stack frames.
2. **Determine Causality:** Explicitly state whether the error originates from User Code calling a dependency incorrectly, or from an internal Dependency/Stdlib conflict.
3. **Suggest Fix:** *Only* suggest a fix after confirming the root cause. The agent MUST NOT hallucinate broad architectural changes or unrelated refactoring to resolve simple version, type, or syntax mismatches highlighted by the diagnostic payload.
