---
name: coding-step-planner
description: >
  Use this skill when the user wants to deeply plan, research, or spec out a single step
  from an existing project plan before writing any code. Triggers include: "plan out this
  step", "spec this phase", "research before coding", "help me think through step N",
  "what's the logic for this part", "break this down before I implement", or any request
  to turn an abstract bullet in a project plan into a detailed implementation spec.
  This skill drives Gemini CLI (via gemini in the terminal) through a structured
  multi-pass research and planning session, producing a concrete spec document as output.
  Always use this skill when the user has a project plan and wants to deeply understand
  how to implement one step before touching code.
---

# Gemini CLI — Coding Step Planner Skill (Secure Plan Mode)

This skill uses Gemini CLI (`gemini`) to research and spec out a single step from an
existing project plan. To ensure system security and prevent accidental code changes,
this workflow is designed to be executed exclusively in **Plan Mode**.

## Security & Approval Modes
During the architectural and design phase, the agent must be restricted to a read-only
state. This is achieved by using the CLI's built-in policy engine.

*   **Instructional Enforcement:** All commands in this skill use the `--approval-mode=plan` flag.
*   **Hard Enforcement:** To globally prevent the agent from ever using YOLO or making
    unconfirmed changes, the user should set `"general.defaultApprovalMode": "plan"` in 
    their `~/.gemini/settings.json`.

## Prerequisites
* `gemini` CLI is installed and authenticated (`gemini --version` works)
* The user has an existing project plan (file, paste, or description)
* The user has identified the specific step to plan

## Inputs to Collect
Before running, gather:
* **The step to plan** — the exact text of the step/phase from the project plan
* **Project context** — what is the overall project? What language/stack?
* **Surrounding steps** — what comes before and after this step (for interface awareness)
* **Existing code/files** — any relevant existing modules, types, or schemas the new step must integrate with (ask the user to paste or provide paths)
* **Constraints** — performance requirements, library restrictions, style conventions, deployment environment
* **Output format preference** — Markdown spec file, inline response, or both

---

## The Planning Workflow
Run Gemini CLI through three sequential passes using the **Plan Mode** flag. This ensures 
the agent can read your entire codebase but is physically blocked from modifying any 
source files.

*Platform note: The examples below use shell syntax for illustration. It is highly recommended to wrap this workflow in an orchestration script to handle the state transfer between passes natively, especially on Windows.*

### Pass 1 — Context Load & Ambiguity Surfacing
**Goal:** Give Gemini the full context in a read-only state to identify everything that's 
unclear or undocumented.

**Research Integration:** If any "Documentation Gaps" are identified (e.g., niche library 
syntax, hardware registers), use the `autonomous-researcher` tool to perform a deep-dive 
investigation.

Prompt template:
```bash
gemini --approval-mode=plan -p "
### PROJECT CONTEXT
<projectSummary>

### FULL PROJECT PLAN (abbreviated)
<surroundingSteps>

### THE STEP TO PLAN
<targetStep>

### EXISTING CODE INTERFACES
<relevantCodeSnippets>

### TASK
You are a senior software architect doing pre-implementation planning.
Your job right now is NOT to design a solution — it is to surface every ambiguity,
assumption, open question, and documentation gap embedded in this step before any design work begins.

Output a fill-in-the-blank Markdown form structured exactly like this for each question:

### Question N: <question title>
**Context:** <one sentence on why this matters>
**Answer:** [TYPE ANSWER HERE]

Categories to cover:
- Ambiguities — things stated but not fully defined
- Assumptions — things implied but not stated
- Interface questions — inputs/outputs/contracts with adjacent steps
- Documentation Gaps — Note: These will be resolved using the `autonomous-researcher` tool.
- Open decisions — things that must be chosen before the architecture can be designed

Be exhaustive. A question left unasked here becomes a bug later.
"
```
**After this pass:** Gemini outputs a Markdown form (`pass1Form.md`). Fill in every `**Answer:**` field. Run the `autonomous-researcher` for any technical gaps. Save the completed form; it feeds directly into Pass 2.

### Pass 2 — Architecture & Logic Design
**Goal:** Design the implementation. The agent uses its full read access to integrate 
with existing code while being prevented from modifying it.

Prompt template:
```bash
gemini --approval-mode=plan -p "
### PROJECT CONTEXT
<projectSummary>

### THE STEP TO PLAN
<targetStep>

### RESOLVED CONSTRAINTS (completed Pass 1 form)
<pass1FormWithAnswers>

### RESEARCH FINDINGS (from autonomous-researcher)
<researcherReportContent>

### EXISTING CODE INTERFACES
<relevantCodeSnippets>

### LANGUAGE & STACK
<language> — follow its idioms strictly.
Key conventions for this project: <projectConventions>

### DOCUMENTATION & GROUNDING
The `autonomous-researcher` has been used to resolve Documentation Gaps. You MUST strictly follow the syntax and idioms provided in the <researcherReportContent>, <pass1FormWithAnswers> and <relevantCodeSnippets>. Do not guess.

### TASK
You are a senior software architect. Design the full implementation plan for this step,
strictly following the language idioms, conventions, and research findings provided above.

Begin your response with a ## TLDR section (5 lines max) summarizing:
- What this step does
- The core approach chosen
- The 2-3 most important design decisions made

Then produce each of the following sections in full:

## Architecture Overview
Describe the high-level approach. What components are involved? How do they interact?

## Data Structures & Types
Define all new types, structs, schemas, or data shapes introduced by this step.

## Function Signatures & Module Layout
List every new function or method, with parameters, return types, and responsibilities.

## Control Flow
Walk through the main execution path step by step, including branching and error handling.

## Integration Points
How does this step connect to adjacent steps and honor existing contracts?

## Edge Cases & Failure Modes
List edge cases that must be handled explicitly.

## Open Items
List anything still needing a decision.
"
```

### Pass 3 — Implementation Checklist & Spec Finalization
**Goal:** Translate the architecture into a concrete, ordered implementation checklist 
plus a test plan.

Prompt template:
```bash
gemini --approval-mode=plan -p "
### THE STEP TO PLAN
<targetStep>

### ARCHITECTURE SUMMARY (TLDR from Pass 2)
<pass2Tldr>

### FUNCTION SIGNATURES (from Pass 2)
<pass2FunctionSignatures>

### TASK
Produce the following artifacts:

## Implementation Checklist
An ordered checkbox list of discrete coding tasks.

## Test Plan
For each logical unit: what to test, kind of test, and passing results.

## Risks & Mitigations
Implementation risks with a one-line mitigation strategy for each.

## Definition of Done
A crisp, unambiguous checklist: what does 'this step is complete' mean?
"
```

---

## Output: The Spec Document
After all three passes, assemble outputs into a single Markdown spec file: `Spec_stepName_YYYYMMDD.md`.

---

## Language-Specific Architectural Guardrails
When running Pass 2, inject these specific constraints based on the project:

* **Julia:** Explicitly define the multiple dispatch strategy. Specify struct mutability. Flag potential type instabilities.
* **Toit (ESP32):** Address memory constraints and task scheduling. Detail hardware pin and bus interfaces.
* **MS SQL:** Define stored procedure contracts. Detail indexing strategies and concurrency/locking management.

## Automating the Pipeline
To eliminate manual copy-paste, build an orchestration script that handles the state transfer between passes. Ensure the script itself respects the `--approval-mode=plan` flag when calling the CLI.

## When NOT to Use This Skill
* The step is already fully specced and you just need to write the code.
* The step is trivially small.
* You don't have an existing project plan → create the plan first.
