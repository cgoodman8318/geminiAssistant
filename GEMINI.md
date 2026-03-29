# GEMINI Context: `geminiAssistant` Repository

This repository serves as the **Source of Truth** for all master code and skill prompts in the workspace.

## Core Mandates
- **Structure:** All master files reside in `src/`.
- **Pathing:** Code uses dynamic path discovery to support global installation and sandboxed secrets in the parent directory.
- **Security:** Follow the **Agent Ground Rules** defined in the root `GEMINI.md`.

## Team Workflow & State Protocol
To maintain high-integrity development, follow the **Project Lifecycle**:

1.  **Architecture (The Architect):** Use **`project-planner`** for new ideas. It produces a `Plan_<Name>_YYYYMMDD.md` in the root.
2.  **Tactical Spec (The Tactical Architect):** Use **`coding-step-planner`** to break down a specific step from the Plan into a `Spec_<Step>_YYYYMMDD.md`.
3.  **Research (The Lead Researcher):** Use **`autonomous-researcher`** for deep-dives into unknown technologies or complex library APIs.
4.  **Execution (The Developer):** Implement code ONLY after a Spec is approved.
5.  **Forensics (The Investigator):** Upon tool failure, the **`code-debugger`** skill triggers automatically. Follow its 3-step diagnostic protocol strictly.

**State Rule:** Always check for existing `Plan_*.md` and `Spec_*.md` files at session start to establish the current "Source of Truth."

---
## Technical Knowledge Base
For specific system details, reference the `docs/` directory:

- **`docs/TeamRoster.md`**: Catalog of Core and Personal tools/skills.
- **`docs/DiagnosticSuite.md`**: Deterministic debugging hooks and protocols.
- **`docs/HomeAssistant.md`**: Local MCP integration details.
- **`docs/JWToolkit.md`**: Religious research constraints.
