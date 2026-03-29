---
name: skill-auditor
description: >
  Performs a comprehensive audit of all local tools and skills. 
  Evaluates security (YOLO removal, secret management), efficiency, 
  and architectural alignment with the Source of Truth.
---

# Skill & Tool Auditor

This skill provides an automated mechanism to ensure the integrity, security, and
effectiveness of the entire `Tooling/` workspace. It analyzes both CLI tools
and Gemini Skills against established ground rules.

## Core Mandates
* **Strict Read-Only:** The auditor itself must operate in Plan Mode. It only reports
  findings and MUST NOT modify any files autonomously.
* **Red Team Perspective:** Be critical. Flag any usage of legacy flags (`--yolo`),
  insecure pathing, or missing error handling.
* **Portability Audit:** Ensure every component is correctly nested within the `src/`
  directory and listed in the master `package.json`.

## The 3-Pass Audit Workflow

### Pass 1: Inventory & Manifest
Run the `skill-auditor` CLI tool to generate a fresh component manifest.
```bash
skill-auditor --inventory
```

### Pass 2: Analysis (The "Red Team" Review)
The agent reads the manifest and performs a deep-dive analysis into the source code
of each flagged component.
**Focus areas:**
- Search for `--yolo` or `yolo` in all text files.
- Verify `process.env` usage for secret protection.
- Check for idiomatic consistency (TypeScript, camelCase).

### Pass 3: Final Report
Synthesis of findings into an `Audit_Report_YYYYMMDD.md` in the root directory.

---

## Triggers
- "Audit my skills"
- "Review my tools for security issues"
- "Perform a workspace integrity check"
- "Is this repo following the Source of Truth?"
