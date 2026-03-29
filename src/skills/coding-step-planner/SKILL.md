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

# Gemini CLI — Coding Step Planner Skill

This skill uses Gemini CLI (`gemini`) to research and spec out a single step from an
existing project plan. The goal is to go from an abstract line like:
*"Phase 3: Implement distributed compute pipeline on HyperGator"*
…to a detailed, code-ready spec document covering architecture decisions, data flows,
function signatures, edge cases, and open questions — before a single line of code
is written.

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
Run Gemini CLI through three sequential passes. Each pass builds on the previous.
Use `--yolo` flag to suppress interactive prompts if running non-interactively.

*Platform note: The examples below use shell syntax for illustration. It is highly recommended to wrap this workflow in an orchestration script to handle the state transfer between passes natively, especially on Windows.*

### Pass 1 — Context Load & Ambiguity Surfacing
**Goal:** Give Gemini the full context and have it identify everything that's unclear, underspecified, or undocumented about the step before any planning begins.

**Research Integration:** If any "Documentation Gaps" are identified (e.g., niche library syntax, hardware registers, specific API versions), do not guess. Use the `autonomous-researcher` tool to perform a deep-dive investigation into those specific gaps before proceeding to Pass 2.

Prompt template:
```markdown
gemini -p "
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
- Documentation Gaps — explicitly list any specific language features, hardware interfaces, or third-party libraries where you lack complete, up-to-date syntax knowledge. Note: These will be resolved using the `autonomous-researcher` tool.
- Open decisions — things that must be chosen before the architecture can be designed

Be exhaustive. A question left unasked here becomes a bug later.
"
```
**After this pass:** Gemini outputs a Markdown form (`pass1Form.md`). Fill in every `**Answer:**` field directly in that file. Provide URLs or pasted documentation for any flagged Documentation Gaps, or better yet, run the `autonomous-researcher` for those gaps and attach the findings to Pass 2. Save the completed form; it feeds directly into Pass 2.

### Pass 2 — Architecture & Logic Design
**Goal:** Design the implementation: data structures, function signatures, control flow, integration points, and error handling strategy. The resolved constraints from Pass 1 and any research reports from the `autonomous-researcher` are the ground truth.

Prompt template:
```markdown
gemini -p "
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
<language> — follow its idioms strictly. Do not use patterns from other paradigms.
Key conventions for this project: <projectConventions>

### DOCUMENTATION & GROUNDING
The `autonomous-researcher` has been used to resolve Documentation Gaps. You MUST strictly follow the syntax and idioms provided in the <researcherReportContent>, <pass1FormWithAnswers> and <relevantCodeSnippets>. Do not guess or invent standard library functions. If a required interface remains unknown, document it as an explicit blocker in the ## Open Items section.

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
Use the project's language and naming conventions exactly (e.g., camelCase for variables).

## Function Signatures & Module Layout
List every new function or method, with:
- Name (follow project conventions)
- Parameters (names + types)
- Return type
- One-line description of responsibility
- Any side effects or state mutations

## Control Flow
Walk through the main execution path step by step, including:
- The happy path
- Key branching points and their conditions
- Error handling strategy (what can fail, how it's caught/propagated)

## Integration Points
How does this step connect to adjacent steps in the plan?
What existing modules/functions does it call, and what contracts must it honor?

## Edge Cases & Failure Modes
List edge cases that must be handled explicitly, with a brief note on how each is handled.

## Open Items
List anything still needing a decision, with your recommended default if you have one.
"
```
*Context injection tip:* Use `@filename` syntax to inject source files directly: `gemini -p "Review @src/agents/planner.jl and @src/types.jl, then [task]"`

### Pass 3 — Implementation Checklist & Spec Finalization
**Goal:** Translate the architecture into a concrete, ordered implementation checklist plus a test plan. Pass 3 receives ONLY the TLDR and Function Signatures sections from Pass 2.

Prompt template:
```markdown
gemini -p "
### THE STEP TO PLAN
<targetStep>

### ARCHITECTURE SUMMARY (TLDR from Pass 2)
<pass2Tldr>

### FUNCTION SIGNATURES (from Pass 2)
<pass2FunctionSignatures>

### TASK
Produce the following artifacts:

## Implementation Checklist
An ordered list of discrete coding tasks to implement this step.
Each task should be:
- Small enough to complete in one sitting (30–90 min)
- Independently testable
- Named with the specific function/module it touches
Format: checkbox list, grouped by sub-component if needed.

## Test Plan
For each logical unit in the implementation:
- What to test (happy path, key edge cases, error paths)
- What kind of test is appropriate (unit, integration, manual smoke test)
- What a passing result looks like

## Risks & Mitigations
Implementation risks (performance, complexity, third-party behavior) with a
one-line mitigation strategy for each.

## Definition of Done
A crisp, unambiguous checklist: what does 'this step is complete' mean?
"
```

---

## Output: The Spec Document
After all three passes, assemble outputs into a single Markdown spec file. 
Naming convention: `Spec_stepName_YYYYMMDD.md`

**Spec document structure:**
```markdown
# Step Spec: [Step Name]
**Project:** [project name]
**Stack:** [language / framework]
**Date:** [date]
**Status:** Draft | Ready for Implementation

---

## 1. Step Summary
[One paragraph: what this step does and why it matters]

## 2. Resolved Constraints
[The completed Pass 1 Q&A form, including any provided documentation]

## 3. Architecture
[Full output from Pass 2]

## 4. Implementation Checklist
[Checkbox list from Pass 3]

## 5. Test Plan
[From Pass 3]

## 6. Risks & Mitigations
[From Pass 3]

## 7. Definition of Done
[From Pass 3]

## 8. Open Items
[Anything still unresolved, with owner/deadline if known]
```

---

## Language-Specific Architectural Guardrails
When running Pass 2, inject these specific constraints into the `### LANGUAGE & STACK` field based on the project:

* **Julia:** Explicitly define the multiple dispatch strategy. Specify which structs must be `mutable struct` versus immutable, and how they fit into the abstract type hierarchy. Flag any potential type instabilities or allocation-heavy paths in hot loops.
* **Toit (ESP32):** Explicitly address memory constraints on the microcontroller. Define the task scheduling approach. Detail exactly how the code interfaces with specific ESP32 hardware pins, I2C/SPI buses, or network boundaries.
* **MS SQL:** Provide clear definitions of stored procedure contracts. Detail indexing strategies for new tables, CTE performance considerations for complex queries, and how concurrency or locking will be managed during transactions.

## Automating the Pipeline
To eliminate manual copy-paste and cross-platform shell issues, build an orchestration script that:
1. Runs Pass 1 and saves the Q&A form to `pass1Form.md`.
2. Opens the file in Obsidian (or standard editor) and pauses execution.
3. On user confirmation, reads the completed form and runs Pass 2.
4. Programmatically extracts the `## TLDR` and `## Function Signatures` sections from Pass 2 output.
5. Runs Pass 3 with the trimmed context.
6. Assembles and saves the final `Spec_stepName_YYYYMMDD.md` file. 

## When NOT to Use This Skill
* The step is already fully specced and you just need to write the code → go write it.
* The step is trivially small (add a field, rename a function) → just do it.
* You don't have an existing project plan → create the plan first, then come back here.
