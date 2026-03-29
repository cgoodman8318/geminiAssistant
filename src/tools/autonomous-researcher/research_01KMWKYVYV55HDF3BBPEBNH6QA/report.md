# Research Report: gemini-cli security policies: how to enforce read-only access for agents while allowing specific tools to write. Alternatives to YOLO mode and best practices for secure planning in gemini-cli.

## Research Plan

- gemini-cli security policies "read-only access" agents "specific tools write" enforcement
- gemini-cli "YOLO mode" alternatives secure execution modes granular permissions
- gemini-cli secure planning best practices agent security guidelines

### Findings for: gemini-cli security policies "read-only access" agents "specific tools write" enforcement
## Gemini CLI Security Policies: Read-Only Access, Specific Tools, and Enforcement

The Gemini CLI employs a robust policy engine to manage security, especially concerning tool execution, read-only access, and specific write permissions. This engine allows for granular control over what actions an AI agent can perform, balancing autonomy with safety.

**Key Security Features and Policies:**

*   **Default Policies:** Gemini CLI comes with built-in default policies that prioritize safety. Read-only tools, such as `read_file` and `glob`, are generally allowed. Write tools, like `write_file` and `run_shell_command`, default to requiring user confirmation (`ask_user`).
*   **Approval Modes:** Different modes influence how tool execution is handled.
    *   `default`: Standard interactive mode where most write tools require confirmation.
    *   `autoEdit`: Optimized for automated code editing, with some write operations auto-approved.
    *   `plan`: A strict, read-only mode for analysis and planning, restricting agents to tools like `read_file`, `grep_search`, and `glob`.
    *   `yolo`: A mode where all tools are auto-approved, intended for high-trust environments and to be used with extreme caution. This mode can be permanently enabled via the `gemini --yolo` command.
*   **Policy Engine and Enforcement:** The policy engine acts as a firewall for tool calls, evaluating them against defined rules before execution. These rules can `allow`, `deny`, or `ask_user` for confirmation.
    *   **Hierarchy of Trust:** Policies are applied in a tiered system, with administrator-defined policies taking precedence over user, workspace, and default settings.
    *   **System-Wide Enforcement:** Administrators can enforce system-wide policies that override all other settings, ensuring consistent security across an enterprise. These policies can be managed through system settings files (e.g., `settings.json`).
*   **Read-Only Access:** Read-only tools are generally permitted, and specific modes like `plan` are designed to operate exclusively with read-only capabilities. External context sources (MCP servers) can be queried without write access during the planning phase.
*   **Specific Tool Control:** The policy engine allows for fine-grained control over specific tools, even targeting tools from particular Model Context Protocol (MCP) servers. This includes denying specific servers or allowing only certain tools across all servers.
    *   **Allowlisting:** The most secure approach involves explicitly listing permitted tools and commands, preventing the use of any unlisted tool.
    *   **`coreTools` and `excludeTools`:** Users can configure which built-in tools are available in agent mode using `coreTools` and `excludeTools` settings in their Gemini settings JSON file.
*   **Agent Delegation:** Agent delegation defaults to `ask_user` to ensure remote agents prompt for confirmation, while local sub-agent actions are checked individually.
*   **Sandboxing and Security:**
    *   **Sandboxing:** Gemini CLI supports sandboxing via Docker or Podman containers for isolation, allowing organizations to restrict file system access, network connections, and resource usage according to their security policies.
    *   **Folder Trust:** A "folder trust" system (introduced in v0.26.0) allows users to designate trusted folders, granting Gemini CLI permission to run commands and edit files within them. This is an optional safety layer.
    *   **Security Checks:** The CLI enforces strict security checks on system policy directories to prevent privilege escalation.
*   **User Confirmation:** For actions that modify files or execute shell commands, Gemini CLI requires manual approval, showing a diff or the exact command before confirmation. This consent prompt mechanism is a key feature for building trust.
*   **Vulnerability Mitigation:** A previously disclosed vulnerability (v0.1.14) allowed silent execution of arbitrary malicious code. This has been fixed, and the current versions emphasize transparent consent prompts and security validation.

**Specific URLs for Further Information:**

*   **Gemini CLI Policy Engine Overview:** [vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHh48MuYF1eK-y0n4tzropGFECSAKZ8OjSH46Y-0KpWBUwJKDXNkRAwHr1eC9gcj4Wg0VAANqiPb9gSV1Mv_pcmawsJsfat2lH31n-fqyh-0dnN4_QTLgE79ipd-dN9F8DcgwMn0nFA-AVv68g8mA==](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHh48MuYF1eK-y0n4tzropGFECSAKZ8OjSH46Y-0KpWBUwJKDXNkRAwHr1eC9gcj4Wg0VAANqiPb9gSV1Mv_pcmawsJsfat2lH31n-fqyh-0dnN4_QTLgE79ipd-dN9F8DcgwMn0nFA-AVv68g8mA==)
*   **Gemini CLI Security for Enterprise:** [vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEpArg_cXDmjPyHENToKlIdnam55ygNXM5tco8Z19HpgP5BN1T8OyJIpPH7jdPKssIyBSu92X8aFjo9lxBQxa5QCcpS42xJhsSTa5rjrFBFjxNDBYgSIuhAXr0nsuYOMttw0bknrh2_hNUSP4Ja8WX7OE8Zi6nHoyKlbRQ5M47ntuxEGaoRbNmVDbb_](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEpArg_cXDmjPyHENToKlIdnam55ygNXM5tco8Z19HpgP5BN1T8OyJIpPH7jdPKssIyBSu92X8aFjo9lxBQxa5QCcpS42xJhsSTa5rjrFBFjxNDBYgSIuhAXr0nsuYOMttw0bknrh2_hNUSP4Ja8WX7OE8Zi6nHoyKlbRQ5M47ntuxEGaoRbNmVDbb_)
*   **Enterprise Deployment and Best Practices:** [vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF784Oxxf7wuLXPrVFBPeG6eJxu0fkwS0qxLp4Xnf_d9gTRJp6b9N-MrKsw3LHYpVyIoJTigNUjT80DNP2JOPsUO5EJAk67S1msjgXF3zIH8Z5d1frpa7CmpbUjTvyM0tlMKKQb7MsmM_UxgN4wgdOvaJve4fWaK-qRMhvXC4E=](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF784Oxxf7wuLXPrVFBPeG6eJxu0fkwS0qxLp4Xnf_d9gTRJp6b9N-MrKsw3LHYpVyIoJTigNUjT80DNP2JOPsUO5EJAk67S1msjgXF3zIH8Z5d1frpa7CmpbUjTvyM0tlMKKQb7MsmM_UxgN4wgdOvaJve4fWaK-qRMhvXC4E=)
*   **Plan Mode (Read-Only State):** [vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE8JqvPr1wDzsw1bV9uOkZiQFWI0ai6sJi55m2lAPnqW8SRJcp_ZtSPppliffAlUnLKG-45Fm8LZhOof0hRewseTb1ppyg4L4aGnC_7uHR1Mn0F-qdTvKeldQMrRsbMeVoVzxlkFNYrqS6sbvE_gv3PQlrqpTKU3-Fjy4dqxcCjFE7iPQZcsPXJ3AD4p3U5t-Dn_DWUN3nFJ_pLlCqBgjM79HlZfQ==](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE8JqvPr1wDzsw1bV9uOkZiQFWI0ai6sJi55m2lAPnqW8SRJcp_ZtSPppliffAlUnLKG-45Fm8LZhOof0hRewseTb1ppyg4L4aGnC_7uHR1Mn0F-qdTvKeldQMrRsbMeVoVzxlkFNYrqS6sbvE_gv3PQlrqpTKU3-Fjy4dqxcCjFE7iPQZcsPXJ3AD4p3U5t-Dn_DWUN3nFJ_pLlCqBgjM79HlZfQ==)
*   **Gemini CLI Hooks for Security Policies:** [vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHMMtCVMZ0oEp4MnM2AHuHpeRzXIXN5o1dTJtX5IKwHnnk4dccnwBrJfYhYWxuyeSMC_lQI3_7WS2ihMD53Ow_rGkbbxmGeu5CCcHDKBJ4fSO6M_rWN76dycXLIcPPi3NYIsU5zRPgOPzVDtC_BBUdq5DE4mlXN_aXQ1ybxbtQq3On_2vCf4GpdJ6P6](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHMMtCVMZ0oEp4MnM2AHuHpeRzXIXN5o1dTJtX5IKwHnnk4dccnwBrJfYhYWxuyeSMC_lQI3_7WS2ihMD53Ow_rGkbbxmGeu5CCcHDKBJ4fSO6M_rWN76dycXLIcPPi3NYIsU5zRPgOPzVDtC_BBUdq5DE4mlXN_aXQ1ybxbtQq3On_2vCf4GpdJ6P6)
*   **Gemini CLI Settings:** [vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHVQbVqHz0DYx2yqVSupcH9qzalmigCF9aYtubcyXlk9Uuvr_-cCDZSpVj6ZEzwTeNmMl2oEmxSNWkhZlEi_7OoEN7LXvifnjZreyYA39Sy9wLjo_QhfHdQaPrFzr3WaqEAduI=](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHVQbVqHz0DYx2yqVSupcH9qzalmigCF9aYtubcyXlk9Uuvr_-cCDZSpVj6ZEzwTeNmMl2oEmxSNWkhZlEi_7OoEN7LXvifnjZreyYA39Sy9wLjo_QhfHdQaPrFzr3WaqEAduI=)
*   **Gemini CLI GitHub Repository:** [github.com/google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli)
*   **Security Consent Prompts and Folder Trust:** [vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEbI7zIDxrtUhvm6PedzeYmpIebescavUGWCO0p8zlzH4dlrmjIryQCBdKi4xfQfMDZ5X95ICbEyUSLNK3Nm4JV3786bhVeqWXbrdbpQ5-1xXFm9kwjv7OclxnDtwF_rIlE3Pgckdvco8i7_crg4T_adbkFhFhsk2zh9coYR1b6vRdOLJ6ZzYBDLpCvFb9ZfNC_Eq-YisEmHZSjWQdn846r3cAieQ==](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEbI7zIDxrtUhvm6PedzeYmpIebescavUGWCO0p8zlzH4dlrmjIryQCBdKi4xfQfMDZ5X95ICbEyUSLNK3Nm4JV3786bhVeqWXbrdbpQ5-1xXFm9kwjv7OclxnDtwF_rIlE3Pgckdvco8i7_crg4T_adbkFhFhsk2zh9coYR1b6vRdOLJ6ZzYBDLpCvFb9ZfNC_Eq-YisEmHZSjWQdn846r3cAieQ==)
*   **Tool Usage and Security:** [vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE7tidb2mwi9sQNYF2J9iRUp4gqx_lKj_E0D7xTUIC-rr19dqDb2ZV8MmyPXbPySCnP9k1wA1t828fDCloiLiHuYcqM7fHy2Jdb0vEXABcGtvDtdb61bYAObKlxyYbOFjlLnkdPasE=](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE7tidb2mwi9sQNYF2J9iRUp4gqx_lKj_E0D7xTUIC-rr19dqDb2ZV8MmyPXbPySCnP9k1wA1t828fDCloiLiHuYcqM7fHy2Jdb0vEXABcGtvDtdb61bYAObKlxyYbOFjlLnkdPasE=)

### Findings for: gemini-cli "YOLO mode" alternatives secure execution modes granular permissions
The Gemini CLI offers several modes and features focused on secure execution and granular permissions, including a "YOLO mode."

**YOLO Mode:**
This mode, activated with the `--yolo` or `-y` flag, allows the Gemini CLI to skip all prompts and confirmations, enabling uninterrupted workflows. However, it's crucial to use this mode with caution due to its permissive nature, as it bypasses user confirmations for all actions. There is also a `/yolo` slash command that instantly enables this mode.

**Secure Execution Modes and Granular Permissions:**
Gemini CLI provides a robust policy engine for fine-grained control over tool execution. This engine allows users to define rules that determine whether a tool call should be allowed, denied, or require user confirmation.

Key features include:
*   **Policy Engine:** This system allows for defining rules based on tool names, command prefixes, and desired decisions (allow, deny, ask_user). Default policies generally allow read-only tools and prompt for write tools.
*   **Approval Settings:**
    *   `auto_edit`: Automatically approves file reads/writes but still prompts for shell commands.
    *   `default`: Prompts for approval for all tool executions.
    *   `plan`: A read-only mode.
*   **Permanent Tool Approval:** Users can enable permanent approvals to "whitelist" tools, allowing them to run without prompts after initial allowance.
*   **Sandboxing:** Gemini CLI can utilize a sandbox image (e.g., via Docker or Podman) to isolate the execution environment, enhancing security and preventing unauthorized system-level operations. This is particularly useful for tools that might have side effects.
*   **Least Privilege Principle:** By using fine-grained GitHub personal access tokens and dedicated Google Cloud service accounts with minimal permissions, users can limit the CLI's exposure and potential for damage.
*   **Planning Mode:** This mode introduces a read-only strategy step before execution, allowing the agent to explore the repository and provide a markdown plan of intended actions. This offers visibility into potential file modifications and dependency changes before execution.
*   **Session Checkpoints and Rewind:** Gemini CLI includes features for saving snapshots of project states, allowing users to roll back to earlier versions if needed.

**Alternatives:**
While Gemini CLI offers these features, alternatives like CodeConductor.ai are highlighted for teams needing persistent AI memory, enterprise-grade security (OAuth, Keycloak), and collaboration features beyond typical CLI workflows. Other alternatives mentioned include GitHub Copilot CLI, Codex CLI, and Mistral Vibe.

**Specific URLs:**
*   Gemini CLI Permissions and Tool Approval Setup: [https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQET4efiS9pK0aqLIdnbiuOREq8UJB-dMAz63boUJcSJEu-hQJiU-IngeIQtle8XnEXQ_Q_WKIBagKwV2KYyzwcKH93kPeyHLzEDC4yfazIluhxvFEB7lzW_PvUCwBA0Lveo44b75CIAdiQGJW5RaGiPdbEWxP1jImREgOOWhC-udGYKJCI=](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQET4efiS9pK0aqLIdnbiuOREq8UJB-dMAz63boUJcSJEu-hQJiU-IngeIQtle8XnEXQ_Q_WKIBagKwV2KYyzwcKH93kPeyHLzEDC4yfazIluhxvFEB7lzW_PvUCwBA0Lveo44b75CIAdiQGJW5RaGiPdbEWxP1jImREgOOWhC-udGYKJCI=)
*   Secure Gemini CLI for Cloud development: [https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGd61GKV7F6kOfwELW109GNCQTeE-i7a1IbxfSld_ffP4ny2Ee-Kh7hp7Eirw1m5XJAkoF_6EKG4QbHRwA4Izb19ccA7PaVyaaiWpGoMCbmO_Et65PlHyorS2UEbSHAWJADs03gFYXKVivUMHcK5TzfcKnDvUumy4q0Xwoy3IAsnrJ9c-I1c2e9Z7NA7d0D](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGd61GKV7F6kOfwELW109GNCQTeE-i7a1IbxfSld_ffP4ny2Ee-Kh7hp7Eirw1m5XJAkoF_6EKG4QbHRwA4Izb19ccA7PaVyaaiWpGoMCbmO_Et65PlHyorS2UEbSHAWJADs03gFYXKVivUMHcK5TzfcKnDvUumy4q0Xwoy3IAsnrJ9c-I1c2e9Z7NA7d0D)
*   Policy engine - Gemini CLI: [https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFc-rF-mgUR7PBQXGFtgO5tvJbBB3-ESGlNfy7kDJrKC_80_Hf2VwAER6ov2Hnhr9gi_1OQ7W-lCqDIqxbFo-mbLbSgtPJo9_4OPJI7XykDqQjSFnWmIER_2vt_gs-tee5DDBYcDzfJo76JbwdW0xz_8VnwaRVGKlRSyv8P](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFc-rF-mgUR7PBQXGFtgO5tvJbBB3-ESGlNfy7kDJrKC_80_Hf2VwAER6ov2Hnhr9gi_1OQ7W-lCqDIqxbFo-mbLbSgtPJo9_4OPJI7XykDqQjSFnWmIER_2vt_gs-tee5DDBYcDzfJo76JbwdW0xz_8VnwaRVGKlRSyv8P)
*   Best Gemini CLI Alternative to Build, Deploy, & Debug Apps in 2026: [https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHjZVJk24tMShfGpQzfHjQcCjRgKfTG7_B4uX4mr6BNfHisDFHVbG7Fgfpy7d_TDJtyZTls2YYk637u4mxk0XLlOfCzyUhyyxvBnPHC_T4MWcouUp4iJCZq0F5_9mSij0xMIS-M_VnP3oWwp3C2ahQ=](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHjZVJk24tMShfGpQzfHjQcCjRgKfTG7_B4uX4mr6BNfHisDFHVbG7Fgfpy7d_TDJtyZTls2YYk637u4mxk0XLlOfCzyUhyyxvBnPHC_T4MWcouUp4iJCZq0F5_9mSij0xMIS-M_VnP3oWwp3C2ahQ=)
*   Non-Interactive Mode - Code Review Extension Application: [https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEHUHNqT-TrIIwnso5vaWkavMhNcrgheiGIQrq21bwuErsja4VRfKoBIuj4gHcA4TUgAMyxcQF99KsWtmyh-RwfL25SZlYPlzsQ1AXoPnqC4jt5VyVea1qC-mVa3Hq_KIVRm7HB-1-E7xMK6JuCJEkVKJCy9RVXSeEL](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEHUHNqT-TrIIwnso5vaWkavMhNcrgheiGIQrq21bwuErsja4VRfKoBIuj4gHcA4TUgAMyxcQF99KsWtmyh-RwfL25SZlYPlzsQ1AXoPnqC4jt5VyVea1qC-mVa3Hq_KIVRm7HB-1-E7xMK6JuCJEkVKJCy9RVXSeEL)
*   Gemini CLI configuration: [https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHjKb08sCZdLp7LedlbKoQZOQ4Ma6sEvc49FY8B2egg0D28pFThdBZqatALULyJ8kUqWorN4lF2mp4IdLD6dWTLFVkLUSnUm4GljXmR-sdk1aL63ra7Dq76tHz2SH5VbpyLNOj40Sio6OyLfLRz](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHjKb08sCZdLp7LedlbKoQZOQ4Ma6sEvc49FY8B2egg0D28pFThdBZqatALULyJ8kUqWorN4lF2mp4IdLD6dWTLFVkLUSnUm4GljXmR-sdk1aL63ra7Dq76tHz2SH5VbpyLNOj40Sio6OyLfLRz)

### Findings for: gemini-cli secure planning best practices agent security guidelines
When using Gemini CLI for secure planning and agent operations, several best practices and security guidelines are crucial. These focus on controlling agent behavior, securing data, and ensuring accountability.

**Key Findings:**

*   **Zero Trust and Least Privilege:** A fundamental principle is to operate under a zero-trust model, where no input is inherently trusted. Agents should be granted the minimum necessary permissions (least privilege) to perform their tasks. This extends to action-level permissions, where every operation requires explicit approval from security rules.
*   **Identity and Access Management (IAM):** Treat each AI agent as a distinct non-human identity with its own scoped access. Avoid shared credentials and ensure that each agent has a separate role or service account with only the permissions needed for its specific tasks.
*   **Secure Planning and Execution:**
    *   **Plan Mode Security:** Gemini CLI's Plan Mode is designed to be secure by default, with restrictions on where plans can be stored to prevent sensitive file overwrites.
    *   **Skills and Customization:** Agent skills can guide planning with specialized instructions, such as including data safety checks or security vulnerability assessments.
    *   **User Confirmation:** Gemini CLI requires explicit user confirmation for commands, allowing granular control through options like "allow once," "always allow," or deny.
    *   **Checkpointing and Version Control:** Features like checkpointing act as an "undo button" for multi-step code edits, providing a safety net. Regular commits using version control (like Git) are also recommended for critical projects.
*   **Data Security and Privacy:**
    *   **Data Loss Prevention (DLP):** Enforce DLP policies to control how data enters, moves through, and exits the environment.
    *   **Memory Access Control:** Given that long-term memory can store sensitive data, access to it must be controlled.
    *   **Private Servers:** Host AI tools and agents on secure private infrastructure to maintain control over data, models, and resources.
*   **Monitoring, Auditing, and Visibility:**
    *   **Continuous Monitoring:** Implement real-time monitoring and logging to detect abnormal or unauthorized activities.
    *   **Auditing:** Comprehensive logging and audit capabilities are essential for tracking AI-generated actions, monitoring usage, and ensuring compliance.
    *   **Visibility:** Start with visibility by inventorying all AI agents and workloads to understand their access and actions.
*   **Input Validation and Prompt Security:**
    *   **Input Validation:** Treat all external input as potentially malicious and implement rigorous input validation.
    *   **Prompt Injection Resistance:** Test agents for resistance against prompt injection attacks, where malicious input can manipulate agent behavior.
*   **Sandboxing and Isolation:** Utilize sandboxing technologies (e.g., macOS Seatbelt, Docker, Podman containers) for complete isolation of agents.
*   **Secure Coding Practices:** Treat prompts as code artifacts, conduct AI-specific threat modeling, and implement secure coding standards.
*   **Extensibility and Transparency:** Gemini CLI's open-source nature allows for code auditing and community contributions to improve security. Using .gemini/GEMINI.md files provides persistent context and project-specific guidelines to the AI.

**Specific URLs Found:**

*   IBM - AI Agent Security Best Practices and Tutorial: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHhNLzvsMtipuVDsfbj5uaBQzU4-zUuGq90fPy54DcYww2PpEN_OZPm7z8VQbDbtlTKPGEJ2lvS54GyLHGpCF_BFhyNcXW28ynAJIXEPZSTOWbIWYupTRmn5EwzTuJsWCQvDloCsO1RCvFIxiqSQlTy`
*   Zscaler - How to Secure AI Agents: Models & Risks Explained: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEQblfl590jMSP_nkcVBlgpDKFTQmT2OjWORctIpkOYy6wAcZ08mlQgF4pwCnG08qYwO7fLq09U02t0IOpVC0xb0PBoZzC7Vf8olp6Wi-NIagyfr2Y9sJ2OHHaT7oIExTiQoRJO88D4dhtX8YvsNjLhtg==`
*   Medium - Securing AI Agents: A Practical Guide for Developers: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHBRCu5sBEm5DiW60kbF7rYZigbP6S9KPqQBVMc3UEJXvRtsxa1wuaoVPUNMwcum-QoLC8YCwX2HBz0KOypYqi3Z3BZs8D4ezbFL5obaheis77HIfOf6P-6kGjNY8PMsdNLiZYNpRCCH4RAPJFGeR5Od9AkDV9fgP1UvSUTie67X90MDMzCyqsDog-AE9UJbPTIqOE6wDVBsA==`
*   Wiz - AI Agent Security Best Practices: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFc911lF5bdozteCqK3IUxayqNbzOK3A9G5bU8p7BZr5HhPL5SAvVK4XBQPwBgFrnqqB3qxMKClegQamMoy81_ZY6HQdVCbAx-7xYzsEpGbr5PnsWFMgO938fmJI2ahYNNTSeSNnyTsO_gG6xR1KqbJNGIf`
*   SailPoint - Securing AI agents 101: Understanding the new identity frontier: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHPFLg2lGVGZV0gAeIQ3ceZL7e4meOuHOMLYN5jxLdRiO2G_LnH749S6-KacKXy6eaReDFNRKOhaOSqH8xVkg3_7WNm3pNzAupd8_5lz9kyVlP4uqxqawDWkMAs_QbDfaVl53j8XmN72qoKKLMWPdrU_8mCC82yX6Y= `
*   AWS Documentation - Secure development practices for agentic AI systems: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFV_ZVKzYvb_u0YraaOSgNOk-pTCLsLMb_NlBuyj4CsdpgjpB8bVsMZAGiweN5BCxjwsPXw6vcXHsief-FmznFIkuv36lmKv3vFK2ZhQUGPCI6nv1ArVTNLhnuLAbmUishk0V8Si-VLyZYvdWl6XR23xSRdvHsMugxMyB7bgU5__CVcLYiqAt1rtSsKRcJApMNDzxDT4-Yd6TyDquUKeFNUyevgTYH8Zu7Q`
*   Gemini CLI Documentation - Plan Mode: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFmSGWLbYXzSi-UuJleypClVOtA7FEfb5E_kdKNhGpBrAZRW1hH-KaxcaGSgEnQvu-J4dG33QGwwREBH0x6m3-3PXxyCLpdv-txYuPzgM03KaS34sWypytIFA2PWKgNNP_mQMve`
*   Snyk - 5 Tips for Agentic Coding with Gemini CLI: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEQuJneKDfurvXWbGOYxAp5MbmYt9Hho_czkfJvPKZQqZpMK9IDZonUMBfARqTk9MJXAyo8IeqQqc8i0EgSUZqmp8yor564RTlIY_AEzah_Byf5iaRxD2OiI0AatrIW24oi5K6ONlYMJXKQb2HAcLJ5WokJQsQL_j4n6eC5wFk=`
*   AWS Documentation - Secure development practices for agentic AI systems on AWS: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFV_ZVKzYvb_u0YraaOSgNOk-pTCLsLMb_NlBuyj4CsdpgjpB8bVsMZAGiweN5BCxjwsPXw6vcXHsief-FmznFIkuv36lmKv3vFK2ZhQUGPCI6nv1ArVTNLhnuLAbmUishk0V8Si-VLyZYvdWl6XR23xSRdvHsMugxMyB7bgU5__CVcLYiqAt1rtSsKRcJApMNDzxDT4-Yd6TyDquUKeFNUyevgTYH8Zu7Q`
*   Gemini Code Assist Documentation - How to Build AI Security Agents with Gemini CLI: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHQhfxlDvN-6PwVqt95K7sus8vxtc7trRgPIVtZRufRKgayomLiVHGGo76tZdFZQgYMB6YnYdy5ONL_Kjjh2oM95V2UVNkG8Bh16Winrw1-BCKPvw4frZLvA_NckNiCPLfXi9mcZqo1O3aKiS31rMzlP6yn06p83U6FUPnchLVsxbBqjeFhdBoYutAYTg==`
*   Milvus - How secure is Gemini CLI for enterprise use?: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG2Q7Ivw1VRz7gTGsuzBiUx026xtuzCq7INbsgQ83XmDVYFiq9Ocpsrg0FOIwv41o_n4_m5m76BjzxoXm4Wnj8--uZ102gLM4dniYFQZR2mgrIbcJtiyJ6ZYTHvDEKW_KGAsyfGluEBQ_FjJkkWnBghzqA5zRsQPsicUzVrsMZkWRJOJ2OLN93Verei`
*   DEV Community - Gemini CLI Best Practices: 10 Pro Tips You're Not Using: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFLwYYVO_2SQo7el6-2UbOOM-kIkcSFgCNVryfohs7JpSO_ngc8H0A4Izel10MpFU8LlrHBbFxMUgFMl5qL-XdSVd1o4hrsc1guGueIjDZnRSP7opmG1Jlx2Jca6iL2SEAkUD2L_NbkyYsxmYBs-3b1f6HBh4_C3qh3lF2tOprEPSOcLxNhaGK-XjdIhkQ=`
*   Gemini CLI Documentation - Gemini CLI extension best practices: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG4ph7alPVXKIm8WoYLFfRbgxU_a-bZxNDs-jomCAxnVtD6bbm-VhUXrRBVTG0uarUc031-I3AooqDvCTnWVKq2Z10qD3IOgF0EvC1nD1M398jftHyhnHfKHHplw3hyG46BWLfZhI5gcOuatpXenHCN`
*   Medium - Best Practices for Using Gemini CLI: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG8ACyELa1LKfPjqfFMIiIiqGrD172Rt-NblbygiHCuu6Vw7Jd1DNGnUHRuXEVpjv8otnWsYT0VTXridJcx0ghs1We5j0u_glIyp2BLxm2LkiITgLLU31Jt4LLXHCXX2C0vXdkdy4ItL3T8tWoJqcFgETs5Xnc9QAmvZG9KiM0MA4LjNEA6QO5lZUw-`
*   Elevate - Gemini CLI Tips & Tricks: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE5OiuBYgXRvjRaMw4kBuqluyS7eiB0fZ_7P-2vaG-nBK9S6MQlc2t1nms__0e6qWTiYBhZtGYfCn-1Yw_mqFPHUJ69fafSTLkDHEfMXWomjFq3jiMXIgjMDOZoGM92JuJxKTRT1UCjvSgFK6gU3TcNAIE=`
*   Google for Developers - Google announces Gemini CLI: your open-source AI agent: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFMa_V1fWsduTUmWHRb3w1AIJly_b9CXb-QVJcMelA-OKIkTG0WxEAUgWJNzih7430-BDhEKYURhUPoBJToeBvvJ7kCITT7OPetje9QxnlklhgOG_Q_LkzF_EVuTt6rARccgFrp-us-CsJyj1CpCl5PgrvWg3ZLjbeBnebsmBkpODXWBdjYEjR3pTrEGo7VOJ2WzE4f5dE2FNj8MTNasSxxu7A5kXhLvb0n`
*   Google for Developers - Gemini CLI | Gemini Code Assist: `https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFa-TMbG0SF9DAKjnIua3EtH75jSvU5Dlf4SxDxCi5RNXOQUmyIm8zEpYWk2bzUWJQQJYmfTTIiv4GzdRsGRycVLxzBfyLScgoO2IF4I1ueEraaCShfga_Eg92qKzufaNaa-i_d7LXCil-9OmcAfIFFTSB_wnfSnW1g-MM=`

## Final Deep-Dive Synthesis

# Deep-Dive Report: Gemini CLI Security Policies and Enforcement Mechanisms

## Executive Summary
The Gemini CLI (Command Line Interface) implements a sophisticated security architecture designed to manage the inherent risks of agentic AI. Central to this architecture is a **Policy Engine** that acts as a tool-call firewall, enforcing granular control over "read-only" versus "write" operations. By leveraging hierarchical configurations and execution modes—ranging from the restrictive `plan` mode to the permissive `yolo` mode—Gemini CLI allows organizations to balance developer velocity with strict security protocols.

---

## 1. The Policy Engine: The Core Enforcement Mechanism
The Policy Engine is the primary security gatekeeper for Gemini CLI. Every time an agent attempts to execute a tool, the request is evaluated against a set of rules before being dispatched.

### Decision Logic
The engine evaluates tool calls and returns one of three decisions:
*   **`allow`**: The tool executes immediately without user intervention.
*   **`deny`**: The tool execution is blocked, and the agent is informed of the restriction.
*   **`ask_user`**: The CLI pauses and presents a prompt (often including a file diff or the specific shell command) for manual human approval.

### Hierarchy of Trust
Enforcement follows a tiered precedence model, ensuring that organizational security cannot be bypassed by individual users:
1.  **Administrator Policies**: Defined at the system level; these override all other settings.
2.  **User Policies**: Personal preferences defined in the user's global config.
3.  **Workspace Policies**: Specific to a repository or directory.
4.  **Default Settings**: The built-in safety-first defaults provided by Google.

---

## 2. Tool-Specific Access Control
Gemini CLI distinguishes between operations that observe the environment and those that modify it.

### Read-Only Access
Read-only tools are generally permitted by default to allow the agent to gather context.
*   **Permitted Tools**: `read_file`, `glob`, `grep_search`.
*   **Planning Phase**: During initial analysis, agents are restricted to read-only capabilities to prevent accidental side effects before a strategy is finalized.

### Specific Write Permissions
Write access is strictly controlled and typically defaults to `ask_user` to ensure transparency.
*   **Controlled Tools**: `write_file`, `run_shell_command`, and `delete_file`.
*   **Fine-Grained Allowlisting**: Users can configure `coreTools` and `excludeTools` in their `settings.json`. This allows an administrator to, for example, allow an agent to use `write_file` but strictly deny `run_shell_command`.
*   **MCP Server Control**: For external tools connected via the Model Context Protocol (MCP), the engine can deny specific servers or limit the agent to a subset of tools from a trusted server.

---

## 3. Operational Modes and Approval Workflows
The CLI's behavior changes based on the active "Mode," which acts as a preset for the Policy Engine.

| Mode | Security Posture | Primary Use Case |
| :--- | :--- | :--- |
| **`plan`** | **Strict Read-Only** | Initial analysis; agent explores the codebase without making changes. |
| **`default`** | **Interactive** | Standard development; requires confirmation for all write/shell actions. |
| **`autoEdit`** | **Balanced** | Automated coding; auto-approves file writes but prompts for shell commands. |
| **`yolo`** | **Permissive** | High-trust environments; skips all prompts (use with extreme caution). |

---

## 4. Advanced Security Layers: Sandboxing and Trust
Beyond tool-call logic, Gemini CLI employs architectural isolation to protect the host system.

*   **Containerized Sandboxing**: Support for **Docker** and **Podman** allows agents to run in isolated environments. This restricts the agent's view of the file system and limits network access.
*   **Folder Trust System (v0.26.0+)**: This feature prevents the CLI from acting on untrusted directories. Users must explicitly designate a folder as "trusted" before the agent can execute commands or edit files within it.
*   **Agent Delegation**: When a local agent spawns a remote or sub-agent, the CLI defaults to `ask_user` for the delegated actions, preventing a "chain reaction" of unapproved operations.

---

## 5. Analysis of Information Conflicts
While the research findings are largely cohesive, a few points of tension exist:

1.  **Efficiency vs. Zero Trust**: The existence of `yolo` mode and `autoEdit` contradicts the "Zero Trust" principle mentioned in best practices. While the documentation advocates for "least privilege," the CLI provides "high-velocity" modes that bypass these checks. 
    *   *Resolution*: These modes are intended for "High-Trust Environments," placing the burden of risk assessment on the user rather than the tool.
2.  **Vulnerability History**: There is a conflict between the CLI's image as a secure enterprise tool and the mention of a critical vulnerability in version 0.1.14 (silent malicious code execution).
    *   *Resolution*: This was a "fixed" issue. Current versions (0.26.0+) have replaced the flawed logic with the "Folder Trust" and "Consent Prompt" mechanisms.

---

## 6. Future Outlook
As AI agents become more autonomous, Gemini CLI's security model is expected to evolve in the following directions:

*   **DLP Integration**: Future versions may incorporate Data Loss Prevention (DLP) filters directly into the Policy Engine to prevent agents from reading or writing sensitive patterns (e.g., API keys, PII).
*   **Identity-Centric Agent Security**: Moving toward treating AI agents as distinct IAM identities with their own scoped Google Cloud/GitHub permissions, rather than inheriting the user's full token permissions.
*   **Automated Threat Modeling**: Integration of security-specific "Skills" that allow the agent to audit its own plan for potential vulnerabilities before execution.
*   **Immutable Snapshots**: Enhanced "Checkpointing" that automatically commits state to a hidden git-tree before any `yolo` or `autoEdit` operation, allowing for "one-click" rollback of AI errors.

### Conclusion
Gemini CLI provides a robust framework for enforcing read-only access and specific write tool permissions. By utilizing the **Policy Engine** and **Sandboxing**, organizations can effectively implement a "Human-in-the-loop" security model that scales with the complexity of the agentic tasks.

## Sources
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHh48MuYF1eK-y0n4tzropGFECSAKZ8OjSH46Y-0KpWBUwJKDXNkRAwHr1eC9gcj4Wg0VAANqiPb9gSV1Mv_pcmawsJsfat2lH31n-fqyh-0dnN4_QTLgE79ipd-dN9F8DcgwMn0nFA-AVv68g8mA==)
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHVQbVqHz0DYx2yqVSupcH9qzalmigCF9aYtubcyXlk9Uuvr_-cCDZSpVj6ZEzwTeNmMl2oEmxSNWkhZlEi_7OoEN7LXvifnjZreyYA39Sy9wLjo_QhfHdQaPrFzr3WaqEAduI=)
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG9m101rNis0Rs6SerqBbI25ULQUMNbG4Ayvz0HOkXUmHRQEXMNFoPEVRzmY38Eh14Pv1N50McJJmh1MkPBnucFpzlGpW4GRoaEgTG3iwgev5jjZ-FrGFC3vTyOY4iHnrXNveY481JpXejxumAlBA==)
- [daily.dev](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE8JqvPr1wDzsw1bV9uOkZiQFWI0ai6sJi55m2lAPnqW8SRJcp_ZtSPppliffAlUnLKG-45Fm8LZhOof0hRewseTb1ppyg4L4aGnC_7uHR1Mn0F-qdTvKeldQMrRsbMeVoVzxlkFNYrqS6sbvE_gv3PQlrqpTKU3-Fjy4dqxcCjFE7iPQZcsPXJ3AD4p3U5t-Dn_DWUN3nFJ_pLlCqBgjM79HlZfQ==)
- [google.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGREl5EfN39sPZ3cnx2vim-2R0iBCEd8ltaFeJ0FX-_g0MZO4P60dWmgcKpOgq61iEiWGPokrYLrInpdWYYm7VXLJJowpc9gBDsqtMSix9CH-pketXrJsZwqwSLKZeOAnMJNUrNWFZvF86hGYLvnqM7qOd4Doo6H1lo7g==)
- [google.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFQRFQ4pwEzZpqHQWAqkhr6xnkX_ddryfktPnmW_YYgKYuO4BURHmk6StSawBpRnJf0gIxd7JXvN59whskE4LaLoWP4NoJD1KK7xybe3xa2GPgnRTtlZ-6fC09XcKjNtLeoUyaQZ2DcbxGsV-QwwmqOarhiT_O7-pL1-IY=)
- [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFGJvFMPuBZuD6e4UlcQM3fQXFI6MQesn3HnUgoV0lhC3AuhiJsVI2N1UyBXsIlBfGh6s785O2ApjoDW35NdBMEqN3LUpPluoWNzk8cUytH09IicodPA50sKkmdrHmMvai72IiEST-bRafAnIcrrnaKnrlVHqabc1RFHShklgS-7AxeZMazIbev-rhPL9dERguWwMjqAx6MqkqjAY2QV_M=)
- [hutchison.org](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHe6af4F9wBecND1ohyg-6l6tWCzSnjcq-de_kOGwB0TqhjJyxbPfaGfRgEsLA6IukbTyJ2Vvkz9UOemOkvA71Cv4kPcM37ldXCPlz5g7L1daO6yLKJCSQDEFwauUB1HSlsh0OVg93AS3K4eXGhs28S9S5428h1q14IiHLzwQ==)
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHAr-wI22MT-v1NyFHbPgb95JPV4Nl_4d5RTaoxztmbXxbeul8WGX1pQbujdWCFuiCggzWGV89VJhVkwy1fB8wvsT_HpM8VtQTAZbZ-4DmBinMstFbdPnPmN6x3n6km1OyxZg3UaQ==)
- [github.io](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF784Oxxf7wuLXPrVFBPeG6eJxu0fkwS0qxLp4Xnf_d9gTRJp6b9N-MrKsw3LHYpVyIoJTigNUjT80DNP2JOPsUO5EJAk67S1msjgXF3zIH8Z5d1frpa7CmpbUjTvyM0tlMKKQb7MsmM_UxgN4wgdOvaJve4fWaK-qRMhvXC4E=)
- [google.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHNTddA69Zb10vGcEwxdswzAYMtjiCF0H82rBAUCmBC9inabGicnOnVFQqkaDpUGwJ05MJWa58q6eHJZuZFFWFGhk-OM5ZQa3Nx7kEujn4bIBhnM7hNtjFcBx_qCMrimjE_wA7nyOulhI_bvDwiF0aJGeeZqgK4-wk_qXpF7RjKOFZWif8OGwvEOsd2WkZsfXhx)
- [milvus.io](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEpArg_cXDmjPyHENToKlIdnam55ygNXM5tco8Z19HpgP5BN1T8OyJIpPH7jdPKssIyBSu92X8aFjo9lxBQxa5QCcpS42xJhsSTa5rjrFBFjxNDBYgSIuhAXr0nsuYOMttw0bknrh2_hNUSP4Ja8WX7OE8Zi6nHoyKlbRQ5M47ntuxEGaoRbNmVDbb_)
- [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEbI7zIDxrtUhvm6PedzeYmpIebescavUGWCO0p8zlzH4dlrmjIryQCBdKi4xfQfMDZ5X95ICbEyUSLNK3Nm4JV3786bhVeqWXbrdbpQ5-1xXFm9kwjv7OclxnDtwF_rIlE3Pgckdvco8i7_crg4T_adbkFhFhsk2zh9coYR1b6vRdOLJ6ZzYBDLpCvFb9ZfNC_Eq-YisEmHZSjWQdn846r3cAieQ==)
- [milvus.io](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG9rYokQruFW-V-SwHqZF5_QBT1KudEutTZFdbhZJR5Rbu9a-Xer5uiuUVHmHq2vZ7-RA_OAYxjSLxjSfDAoLbJKgxonqbe92RABWh7ZdF0LiD6dQc-7uovsj3Fi2O4_pC8VM71nvPbSJ34Upz-LjPrGBVXTscFSIlvjPyCTAkKQ5OAdO5a3ghc)
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE7tidb2mwi9sQNYF2J9iRUp4gqx_lKj_E0D7xTUIC-rr19dqDb2ZV8MmyPXbPySCnP9k1wA1t828fDCloiLiHuYcqM7fHy2Jdb0vEXABcGtvDtdb61bYAObKlxyYbOFjlLnkdPasE=)
- [tracebit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGbeNE3dBX6rY2i79MNXdXteEk6yhg6cQNR_yqQPj5MUPz0rA563lt480kTCiPpBTzvH21GpAx4g5p0ADI6hAH9MOZfJrDU7MlwOha9d_H7cvae3zBGVoleo5KbPOrt3wsBPkrX7sJaZmyWAdRwarvfAxVarQbbHCvbJ1YXAg==)
- [poncardas.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQET4efiS9pK0aqLIdnbiuOREq8UJB-dMAz63boUJcSJEu-hQJiU-IngeIQtle8XnEXQ_Q_WKIBagKwV2KYyzwcKH93kPeyHLzEDC4yfazIluhxvFEB7lzW_PvUCwBA0Lveo44b75CIAdiQGJW5RaGiPdbEWxP1jImREgOOWhC-udGYKJCI=)
- [google.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEHUHNqT-TrIIwnso5vaWkavMhNcrgheiGIQrq21bwuErsja4VRfKoBIuj4gHcA4TUgAMyxcQF99KsWtmyh-RwfL25SZlYPlzsQ1AXoPnqC4jt5VyVea1qC-mVa3Hq_KIVRm7HB-1-E7xMK6JuCJEkVKJCy9RVXSeEL)
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHjKb08sCZdLp7LedlbKoQZOQ4Ma6sEvc49FY8B2egg0D28pFThdBZqatALULyJ8kUqWorN4lF2mp4IdLD6dWTLFVkLUSnUm4GljXmR-sdk1aL63ra7Dq76tHz2SH5VbpyLNOj40Sio6OyLfLRz)
- [github.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEZ8iDPiViE1Gq9EJXezGXkCgFZfSm3aUF5to4cS9GPoyuTa5EjxoYE-suPFGLC0YU4k4CmjuerUtLb-rFh4b6aIn1SxT_sYmLY0CfiJfSwuqv44UN8UOH6d_vezQB2F1RRIzhg3lX8rseEtHOA7bnyBto=)
- [hutchison.org](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEc-rF-mgUR7PBQXGFtgO5tvJbBB3-ESGlNfy7kDJrKC_80_Hf2VwAER6ov2Hnhr9gi_1OQ7W-lCqDIqxbFo-mbLbSgtPJo9_4OPJI7XykDqQjSFnWmIER_2vt_gs-tee5DDBYcDzfJo76JbwdW0xz_8VnwaRVGKlRSyv8P)
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFccvrIODvoD7ADP2WwjGSFr19azmBGuSrtyk9Fg_tb68LicVrThsngw-K5BSe1E3WWHVslh-YEp3V_7fFBScQWkjMf3nh7wDzx0uECesXnXdk5awKgJPDdZj_uDSREuYGnoNzWkXInkAI5X72J)
- [medium.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGd61GKV7F6kOfwELW109GNCQTeE-i7a1IbxfSld_ffP4ny2Ee-Kh7hp7Eirw1m5XJAkoF_6EKG4QbHRwA4Izb19ccA7PaVyaaiWpGoMCbmO_Et65PlHyorS2UEbSHAWJADs03gFYXKVivUMHcK5TzfcKnDvUumy4q0Xwoy3IAsnrJ9c-I1c2e9Z7NA7d0D)
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEgB5J7L8lwdXxDrfd5PN9rMwOnwCk_U8gr9ayBPBxWfBMalN4P6QeMoq27TeOaU5leTx6ixNRSsM-ycec0nxKnXMHs8bh4FF76GFbYqUnPcYgXK_LcE5ZikdSa_QUGP3alKM2rEmV4qhpOVtYa4Q==)
- [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGYlZbAetQQNY79C-QBm71PVhlkmvpwcy-IkdeNJ5ZGjTBojgGqudBriuDPsgYoeBYNQHVHN1eYpRPleeBfraRhg-vWHajXUm5sdCzeKrT4B0R__ifOdNapz4XSvEbca8yTNWxY4K6JgLpctVob4btOki3o6s_Avm7ud8wLTzTYx2G3KhoN7r3t-oYeleOe2dDNwgxDUErgKfnoLFtcAun7wA==)
- [realpython.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHWUqwqQKFRRNbDEt35hxVCocHXG7Ka_kJfa9ZqElkHlEtmP-MLKIVcFSZkdtDpgBEpoiytRFOiXNgp_s2YZYVxvdvynBn3CT347vspVNVnBedNVxe1zSSH57Rk5ItcAmbT7zzOwnO7)
- [codeconductor.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHjZVJk24tMShfGpQzfHjQcCjRgKfTG7_B4uX4mr6BNfHisDFHVbG7Fgfpy7d_TDJtyZTls2YYk637u4mxk0XLlOfCzyUhyyxvBnPHC_T4MWcouUp4iJCZq0F5_9mSij0xMIS-M_VnP3oWwp3C2ahQ=)
- [slashdot.org](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGg5BdWXTu9GYoqjXrFvu5b9xf4TijEcqQfcfWE7vwdhEjMpRxlMZ7am9td4JQtySKbFlbEKFx51QAJfyGk3vpxH-Q-xckkM_UIZxZXQGSk8d2J8XLpi8sTzWN4dBzTyWdz_Y3zRTn342O_ecezdRhDEg==)
- [sourceforge.net](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGSH8S4xvG8ZBipa9bZE3XUKSD0RPJeJO8Zpy_nC4Ll2xwySteQfnXJfiPwVYJUQBmkxrpvHzLO4m-xV8F321j1spFpM6qDq2ip3lJDeGqiB8eo-5jeJe0KyzjdVoSy7CXf0cpdgo_jZQHvYi75gZP39mgZSAuneWD_fA==)
- [ibm.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHhNLzvsMtipuVDsfbj5uaBQzU4-zUuGq90fPy54DcYww2PpEN_OZPm7z8VQbDbtlTKPGEJ2lvS54GyLHGpCF_BFhyNcXW28ynAJIXEPZSTOWbIWYupTRmn5EwzTuJsWCQvDloCsO1RCvFIxiqSQlTy)
- [medium.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHBRCu5sBEm5DiW60kbF7rYZigbP6S9KPqQBVMc3UEJXvRtsxa1wuaoVPUNMwcum-QoLC8YCwX2HBz0KOypYqi3Z3BZs8D4ezbFL5obaheis77HIfOf6P-6kGjNY8PMsdNLiZYNpRCCH4RAPJFGeR5Od9AkDV9fgP1UvSUTie67X90MDMzCyqsDog-AE9UJbPTIqOE6wDVBsA==)
- [sailpoint.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHPFLg2lGVGZV0gAeIQ3ceZL7e4meOuHOMLYN5jxLdRiO2G_LnH749S6-KacKXy6eaReDFNRKOhaOSqH8xVkg3_7WNm3pNzAupd8_5lz9kyVlP4uqxqawDWkMAs_QbDfaVl53j8XmN72qoKKLMWPdrU_8mCC82yX6Y=)
- [glean.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFJ9hK2cextG0SIohDaN2BZr4daANebYbNz5J4akyk2TjCG3PprM5hI5CQxvjjncTeB3dYjtzzvJjwWtIByVBYceQaBSiQkUKUZB3fcFzbstN3A1v0QhdH0XQn969S-pHxPWN8Q0OBCPcQZOSG02OxnGyDfIQt4yEnS3puTt_1hLmLnFiRtxFQ2EnQ=)
- [amazon.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFV_ZVKzYvb_u0YraaOSgNOk-pTCLsLMb_NlBuyj4CsdpgjpB8bVsMZAGiweN5BCxjwsPXw6vcXHsief-FmznFIkuv36lmKv3vFK2ZhQUGPCI6nv1ArVTNLhnuLAbmUishk0V8Si-VLyZYvdWl6XR23xSRdvHsMugxMyB7bgU5__CVcLYiqAt1rtSsKRcJApMNDzxDT4-Yd6TyDquUKeFNUyevgTYH8Zu7Q)
- [wiz.io](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFc911lF5bdozteCqK3IUxayqNbzOK3A9G5bU8p7BZr5HhPL5SAvVK4XBQPwBgFrnqqB3qxMKClegQamMoy81_ZY6HQdVCbAx-7xYzsEpGbr5PnsWFMgO938fmJI2ahYNNTSeSNnyTsO_gG6xR1KqbJNGIf)
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFmSGWLbYXzSi-UuJleypClVOtA7FEfb5E_kdKNhGpBrAZRW1hH-KaxcaGSgEnQvu-J4dG33QGwwREBH0x6m3-3PXxyCLpdv-txYuPzgM03KaS34sWypytIFA2PWKgNNP_mQMve)
- [milvus.io](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG2Q7Ivw1VRz7gTGsuzBiUx026xtuzCq7INbsgQ83XmDVYFiq9Ocpsrg0FOIwv41o_n4_m5m76BjzxoXm4Wnj8--uZ102gLM4dniYFQZR2mgrIbcJtiyJ6ZYTHvDEKW_KGAsyfGluEBQ_FjJkkWnBghzqA5zRsQPsicUzVrsMZkWRJOJ2OLN93Verei)
- [dev.to](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFLwYYVO_2SQo7el6-2UbOOM-kIkcSFgCNVryfohs7JpSO_ngc8H0A4Izel10MpFU8LlrHBbFxMUgFMl5qL-XdSVd1o4hrsc1guGueIjDZnRSP7opmG1Jlx2Jca6iL2SEAkUD2L_NbkyYsxmYBs-3b1f6HBh4_C3qh3lF2tOprEPSOcLxNhaGK-XjdIhkQ=)
- [substack.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE5OiuBYgXRvjRaMw4kBuqluyS7eiB0fZ_7P-2vaG-nBK9S6MQlc2t1nms__0e6qWTiYBhZtGYfCn-1Yw_mqFPHUJ69fafSTLkDHEfMXWomjFq3jiMXIgjMDOZoGM92JuJxKTRT1UCjvSgFK6gU3TcNAIE=)
- [zscaler.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEQblfl590jMSP_nkcVBlgpDKFTQmT2OjWORctIpkOYy6wAcZ08mlQgF4pwCnG08qYwO7fLq09U02t0IOpVC0xb0PBoZzC7Vf8olp6Wi-NIagyfr2Y9sJ2OHHaT7oIExTiQoRJO88D4dhtX8YvsNjLhtg==)
- [obsidiansecurity.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFa21WgwUeFmiwVxKZvE9Eu2jpVXUdW-FVQkVw9_xaXX6t3rrJLbk1wQuJoJkGUrDWM6NPRAzEaVFl44FhY8P9o5zBlD3TBbFFadUezZOIb8cPomWMXphy9p6Wy9pn5MossrMFCMEGELYPyhrIMna0cIBViuaF7CA==)
- [substack.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHQhfxlDvN-6PwVqt95K7sus8vxtc7trRgPIVtZRufRKgayomLiVHGGo76tZdFZQgYMB6YnYdy5ONL_Kjjh2oM95V2UVNkG8Bh16Winrw1-BCKPvw4frZLvA_NckNiCPLfXi9mcZqo1O3aKiS31rMzlP6yn06p83U6FUPnchLVsxbBqjeFhdBoYutAYTg==)
- [geminicli.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG4ph7alPVXKIm8WoYLFfRbgxU_a-bZxNDs-jomCAxnVtD6bbm-VhUXrRBVTG0uarUc031-I3AooqDvCTnWVKq2Z10qD3IOgF0EvC1nD1M398jftHyhnHfKHHplw3hyG46BWLfZhI5gcOuatpXenHCN)
- [blog.google](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFMa_V1fWsduTUmWHRb3w1AIJly_b9CXb-QVJcMelA-OKIkTG0WxEAUgWJNzih7430-BDhEKYURhUPoBJToeBvvJ7kCITT7OPetje9QxnlklhgOG_Q_LkzF_EVuTt6rARccgFrp-us-CsJyj1CpCl5PgrvWg3ZLjbeBnebsmBkpODXWBdjYEjR3pTrEGo7VOJ2WzE4f5dE2FNj8MTNasSxxu7A5kXhLvb0n)
- [snyk.io](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEQuJneKDfurvXWbGOYxAp5MbmYt9Hho_czkfJvPKZQqZpMK9IDZonUMBfARqTk9MJXAyo8IeqQqc8i0EgSUZqmp8yor564RTlIY_AEzah_Byf5iaRxD2OiI0AatrIW24oi5K6ONlYMJXKQb2HAcLJ5WokJQsQL_j4n6eC5wFk=)
- [medium.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG8ACyELa1LKfPjqfFMIiIiqGrD172Rt-NblbygiHCuu6Vw7Jd1DNGnUHRuXEVpjv8otnWsYT0VTXridJcx0ghs1We5j0u_glIyp2BLxm2LkiITgLLU31Jt4LLXHCXX2C0vXdkdy4ItL3T8tWoJqcFgETs5Xnc9QAmvZG9KiM0MA4LjNEA6QO5lZUw-)
- [google.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFa-TMbG0SF9DAKjnIua3EtH75jSvU5Dlf4SxDxCi5RNXOQUmyIm8zEpYWk2bzUWJQQJYmfTTIiv4GzdRsGRycVLxzBfyLScgoO2IF4I1ueEraaCShfga_Eg92qKzufaNaa-i_d7LXCil-9OmcAfIFFTSB_wnfSnW1g-MM=)
