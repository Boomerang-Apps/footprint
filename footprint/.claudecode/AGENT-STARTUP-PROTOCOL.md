# MANDATORY AGENT STARTUP PROTOCOL

**This protocol is REQUIRED before ANY agent does ANY work.**

---

## STEP 1: EXECUTE STARTUP COMMANDS

Copy and paste this ENTIRE block into the terminal after starting Claude:

```
I am starting a work session. Before I do anything, I MUST complete the mandatory startup sequence.

EXECUTING MANDATORY STARTUP SEQUENCE:

Step 1/7: Reading my agent definition...
Step 2/7: Reading safety framework...
Step 3/7: Reading workflow protocol...
Step 4/7: Reading validation protocol...
Step 5/7: Checking my inbox...
Step 6/7: Confirming branch...
Step 7/7: Confirming worktree isolation...

I will now read each required document and output my Identity Declaration before proceeding.
```

---

## STEP 2: READ ALL REQUIRED DOCUMENTS

Agent MUST use the Read tool to read these files IN ORDER:

1. `.claudecode/agents/[my-agent]-agent.md`
2. `.claudecode/workflows/MANDATORY-SAFETY-FRAMEWORK.md`
3. `.claudecode/workflows/WORKFLOW-2.0-PM-ORCHESTRATION.md`
4. `.claudecode/workflows/AGENT-VALIDATION-PROTOCOL.md`
5. `.claudecode/handoffs/[my-agent]-inbox.md`

---

## STEP 3: OUTPUT IDENTITY DECLARATION

After reading all documents, agent MUST output:

```
╔══════════════════════════════════════════════════════════════════╗
║  🔐 AGENT IDENTITY CONFIRMED                                     ║
╠══════════════════════════════════════════════════════════════════╣
║  Agent: [Full Agent Name]                                        ║
║  Model: [Claude Model]                                           ║
║  Domain: [Specific Domain]                                       ║
║  Worktree: [Absolute Path]                                       ║
║  Branch: [Current Branch Name]                                   ║
╠══════════════════════════════════════════════════════════════════╣
║  📖 DOCUMENTS READ & UNDERSTOOD:                                 ║
║  ✅ [1] Agent Role Definition - Read on [timestamp]              ║
║  ✅ [2] Safety Framework - Read on [timestamp]                   ║
║  ✅ [3] Workflow 2.0 Protocol - Read on [timestamp]              ║
║  ✅ [4] Validation Protocol - Read on [timestamp]                ║
║  ✅ [5] My Inbox - Read on [timestamp]                           ║
╠══════════════════════════════════════════════════════════════════╣
║  🚫 MY BOUNDARIES (memorized):                                   ║
║                                                                  ║
║  I WILL:                                                         ║
║  1. [Specific thing I do]                                        ║
║  2. [Specific thing I do]                                        ║
║  3. [Specific thing I do]                                        ║
║                                                                  ║
║  I WILL NEVER:                                                   ║
║  1. [Specific thing I never do]                                  ║
║  2. [Specific thing I never do]                                  ║
║  3. [Specific thing I never do]                                  ║
║                                                                  ║
║  FILES I CAN TOUCH:                                              ║
║  - [pattern1]                                                    ║
║  - [pattern2]                                                    ║
║                                                                  ║
║  FILES I CANNOT TOUCH:                                           ║
║  - [pattern1] (belongs to [Agent])                               ║
║  - [pattern2] (belongs to [Agent])                               ║
╠══════════════════════════════════════════════════════════════════╣
║  📋 CURRENT ASSIGNMENT:                                          ║
║  Story: [STORY-ID from inbox or "Awaiting Assignment"]           ║
║  Gate: [Current Gate Number]                                     ║
║  Task: [Brief Task Description]                                  ║
║  Status: [Ready to Work / Blocked / Need Clarification]          ║
╠══════════════════════════════════════════════════════════════════╣
║  ⚠️  VALIDATION COMMITMENTS:                                     ║
║  • I will display Safety Banner on EVERY response                ║
║  • I will check domain BEFORE every file operation               ║
║  • I will write tests BEFORE implementation                      ║
║  • I will perform self-check every 3 actions                     ║
║  • I will ONLY hand off to QA (complete) or PM (blocked)         ║
║  • I will maintain session log                                   ║
╚══════════════════════════════════════════════════════════════════╝

STARTUP SEQUENCE COMPLETE. Ready to receive instructions.
```

---

## STEP 4: WAIT FOR CONFIRMATION

**DO NOT proceed with any work until:**
1. All 5 documents have been read
2. Identity Declaration has been output
3. Current assignment is understood

---

## IF NO ASSIGNMENT IN INBOX

Output:
```
╔══════════════════════════════════════════════════════════════════╗
║  ⏳ AWAITING ASSIGNMENT                                          ║
╠══════════════════════════════════════════════════════════════════╣
║  My inbox is empty or has no active assignments.                 ║
║  I will wait for PM to assign work.                              ║
║                                                                  ║
║  I will NOT:                                                     ║
║  - Start work without an assignment                              ║
║  - Create my own tasks                                           ║
║  - Touch any files                                               ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## IF ASSIGNMENT EXISTS

Proceed to Gate 1 verification:
```
╔══════════════════════════════════════════════════════════════════╗
║  📋 ASSIGNMENT RECEIVED                                          ║
╠══════════════════════════════════════════════════════════════════╣
║  Story: [STORY-ID]                                               ║
║  Title: [Story Title]                                            ║
║  Gate: [Current Gate]                                            ║
║                                                                  ║
║  GATE 1 VERIFICATION:                                            ║
║  [ ] Branch exists: feature/[STORY-ID]-description               ║
║  [ ] START.md exists                                             ║
║  [ ] ROLLBACK-PLAN.md exists                                     ║
║  [ ] Git tag exists: [STORY-ID]-start                            ║
║                                                                  ║
║  If any missing → CREATE THEM FIRST before implementation        ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## FAILURE TO COMPLETE STARTUP

**If agent cannot complete startup sequence:**

1. STOP immediately
2. Do not attempt any work
3. Report to PM inbox:

```markdown
# [Agent] → PM: STARTUP FAILURE

**Agent**: [Agent Name]
**Date**: [Date]

## Issue
Unable to complete mandatory startup sequence.

## Reason
[Describe what's missing or broken]

## Request
Please resolve before I can proceed.
```

---

**THIS STARTUP PROTOCOL IS MANDATORY. SKIP NOTHING.**

---

*Agent Startup Protocol v1.0*
