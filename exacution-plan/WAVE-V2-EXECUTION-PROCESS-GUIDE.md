# WAVE v2 Execution Process Guide

**Purpose:** Copy-paste commands for Claude Code to execute WAVE v2 autonomously  
**Scope:** Phase 2 (Pre-Flight) + Phase 3 (Execution) only  
**Version:** 1.0 | **Date:** 2026-01-29

---

## Prerequisites Assumed Complete

- [x] Phase 1: Planning done (PRD, Stories, Prototypes exist)
- [x] Project code exists with proper structure
- [x] API keys ready (Anthropic, Supabase, Slack, LangSmith)

---

## STEP 1: Environment Setup

### 1.1 Create/Verify .env File

**Copy to Claude Code:**
```
Create or verify .env file in project root with these variables:

# Required
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
WAVE_BUDGET_LIMIT=50.00

# LangSmith (Required for tracing)
LANGSMITH_API_KEY=ls-...
LANGSMITH_PROJECT=wave-footprint
LANGCHAIN_TRACING_V2=true

# Slack (Required for notifications)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../...
SLACK_CHANNEL=#wave-alerts

# Docker
COMPOSE_PROJECT_NAME=wave-footprint

Verify the file exists and has no empty values. Show me the result.
```

### 1.2 Verify Environment Variables Load

**Copy to Claude Code:**
```
Run this command to verify all required env vars are set:

source .env && echo "
=== WAVE Environment Check ===
ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:0:10}...
SUPABASE_URL: $SUPABASE_URL
LANGSMITH_PROJECT: $LANGSMITH_PROJECT
SLACK_WEBHOOK_URL: ${SLACK_WEBHOOK_URL:0:50}...
WAVE_BUDGET_LIMIT: $WAVE_BUDGET_LIMIT
"

All values should show (not empty). Report any missing.
```

---

## STEP 2: Validate AI Stories (Schema V4)

### 2.1 Create Story Schema Validator

**Copy to Claude Code:**
```
Create file: scripts/validate_stories.py

#!/usr/bin/env python3
"""
WAVE v2 Story Schema V4 Validator
Ensures all stories are correctly structured before execution
"""

import os
import json
import sys
from pathlib import Path
from typing import List, Dict, Any

SCHEMA_VERSION = "v4"

# Required fields for Schema V4
REQUIRED_FIELDS = {
    "story_id": str,
    "wave_number": int,
    "domain": str,
    "title": str,
    "description": str,
    "acceptance_criteria": list,
    "prototype_reference": str,
}

REQUIRED_STORY_DATA = {
    "objective": {
        "as_a": str,
        "i_want": str,
        "so_that": str
    },
    "files": {
        "create": list,
        "modify": list,
        "forbidden": list
    },
    "safety": {
        "stop_conditions": list,
        "escalation_triggers": list
    },
    "tdd": {
        "test_files": list,
        "coverage_target": int,
        "test_framework": str
    }
}

VALID_DOMAINS = [
    "auth", "authentication",
    "payments", "payment",
    "orders", "order",
    "users", "user", "profile",
    "admin", "administration",
    "notifications", "notification",
    "transform", "ai-transform",
    "shared", "common"
]

def validate_story(filepath: str) -> Dict[str, Any]:
    """Validate a single story file against Schema V4"""
    errors = []
    warnings = []
    
    try:
        with open(filepath, 'r') as f:
            story = json.load(f)
    except json.JSONDecodeError as e:
        return {
            "file": filepath,
            "valid": False,
            "errors": [f"Invalid JSON: {e}"],
            "warnings": []
        }
    
    # Check required top-level fields
    for field, expected_type in REQUIRED_FIELDS.items():
        if field not in story:
            errors.append(f"Missing required field: {field}")
        elif not isinstance(story[field], expected_type):
            errors.append(f"Field '{field}' should be {expected_type.__name__}, got {type(story[field]).__name__}")
    
    # Validate domain
    domain = story.get("domain", "").lower()
    if domain and domain not in VALID_DOMAINS:
        warnings.append(f"Unknown domain '{domain}'. Valid: {', '.join(VALID_DOMAINS)}")
    
    # Validate wave_number
    wave = story.get("wave_number", 0)
    if wave < 1 or wave > 10:
        errors.append(f"wave_number should be 1-10, got {wave}")
    
    # Validate acceptance_criteria
    ac = story.get("acceptance_criteria", [])
    if len(ac) < 1:
        errors.append("Must have at least 1 acceptance criterion")
    for i, criterion in enumerate(ac):
        if not isinstance(criterion, str) or len(criterion) < 10:
            warnings.append(f"Acceptance criterion {i+1} seems too short")
    
    # Validate prototype_reference
    proto_ref = story.get("prototype_reference", "")
    if proto_ref and not os.path.exists(proto_ref):
        warnings.append(f"Prototype file not found: {proto_ref}")
    
    # Validate story_data structure (if present)
    story_data = story.get("story_data", {})
    if story_data:
        # Check objective
        objective = story_data.get("objective", {})
        for key in ["as_a", "i_want", "so_that"]:
            if key not in objective:
                errors.append(f"story_data.objective missing '{key}'")
        
        # Check files
        files = story_data.get("files", {})
        for key in ["create", "modify", "forbidden"]:
            if key not in files:
                warnings.append(f"story_data.files missing '{key}'")
        
        # Check TDD
        tdd = story_data.get("tdd", {})
        if not tdd.get("test_files"):
            warnings.append("No test_files specified in story_data.tdd")
        coverage = tdd.get("coverage_target", 0)
        if coverage < 80:
            warnings.append(f"coverage_target is {coverage}%, should be >= 80%")
    else:
        warnings.append("story_data section missing (recommended for V4)")
    
    return {
        "file": filepath,
        "story_id": story.get("story_id", "UNKNOWN"),
        "domain": story.get("domain", "unknown"),
        "wave": story.get("wave_number", 0),
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }

def validate_all_stories(story_dir: str = "ai-prd/stories") -> Dict:
    """Validate all stories in directory"""
    
    if not os.path.exists(story_dir):
        return {
            "valid": False,
            "error": f"Story directory not found: {story_dir}",
            "stories": []
        }
    
    results = []
    story_files = list(Path(story_dir).glob("*.json"))
    
    if not story_files:
        return {
            "valid": False,
            "error": f"No story files found in {story_dir}",
            "stories": []
        }
    
    for filepath in sorted(story_files):
        result = validate_story(str(filepath))
        results.append(result)
    
    all_valid = all(r["valid"] for r in results)
    
    return {
        "valid": all_valid,
        "total": len(results),
        "valid_count": sum(1 for r in results if r["valid"]),
        "invalid_count": sum(1 for r in results if not r["valid"]),
        "stories": results
    }

def print_report(results: Dict):
    """Print formatted validation report"""
    
    print("\n" + "=" * 60)
    print(f"WAVE STORY VALIDATION (Schema {SCHEMA_VERSION})")
    print("=" * 60)
    
    if "error" in results:
        print(f"\n❌ ERROR: {results['error']}")
        return False
    
    # Group by wave and domain
    by_wave = {}
    by_domain = {}
    
    for story in results["stories"]:
        wave = story.get("wave", 0)
        domain = story.get("domain", "unknown")
        
        by_wave.setdefault(wave, []).append(story)
        by_domain.setdefault(domain, []).append(story)
    
    # Print by Wave
    print("\n📋 STORIES BY WAVE:")
    print("-" * 40)
    for wave in sorted(by_wave.keys()):
        stories = by_wave[wave]
        valid = sum(1 for s in stories if s["valid"])
        print(f"  Wave {wave}: {len(stories)} stories ({valid} valid)")
        for s in stories:
            icon = "✅" if s["valid"] else "❌"
            print(f"    {icon} {s['story_id']} [{s['domain']}]")
    
    # Print by Domain
    print("\n🏢 STORIES BY DOMAIN:")
    print("-" * 40)
    for domain in sorted(by_domain.keys()):
        stories = by_domain[domain]
        print(f"  {domain.upper()}: {len(stories)} stories")
    
    # Print errors and warnings
    print("\n⚠️  ISSUES:")
    print("-" * 40)
    
    has_issues = False
    for story in results["stories"]:
        if story["errors"] or story["warnings"]:
            has_issues = True
            print(f"\n  {story['story_id']}:")
            for err in story["errors"]:
                print(f"    ❌ {err}")
            for warn in story["warnings"]:
                print(f"    ⚠️  {warn}")
    
    if not has_issues:
        print("  No issues found!")
    
    # Summary
    print("\n" + "=" * 60)
    if results["valid"]:
        print(f"✅ ALL {results['total']} STORIES VALID")
    else:
        print(f"❌ {results['invalid_count']}/{results['total']} STORIES INVALID")
    print("=" * 60 + "\n")
    
    return results["valid"]

if __name__ == "__main__":
    story_dir = sys.argv[1] if len(sys.argv) > 1 else "ai-prd/stories"
    results = validate_all_stories(story_dir)
    success = print_report(results)
    sys.exit(0 if success else 1)

Make executable: chmod +x scripts/validate_stories.py

Show me the created file.
```

### 2.2 Create Execution Plan Validator

**Copy to Claude Code:**
```
Create file: scripts/validate_execution_plan.py

#!/usr/bin/env python3
"""
WAVE v2 Execution Plan Validator
Ensures stories are properly organized into Waves and Domains
"""

import os
import json
import sys
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Any

def load_all_stories(story_dir: str = "ai-prd/stories") -> List[Dict]:
    """Load all story files"""
    stories = []
    
    for filepath in Path(story_dir).glob("*.json"):
        with open(filepath) as f:
            story = json.load(f)
            story["_file"] = str(filepath)
            stories.append(story)
    
    return stories

def build_execution_plan(stories: List[Dict]) -> Dict:
    """Build execution plan from stories"""
    
    plan = {
        "waves": defaultdict(lambda: {"domains": defaultdict(list), "stories": []}),
        "domains": defaultdict(list),
        "dependencies": [],
        "issues": []
    }
    
    for story in stories:
        wave_num = story.get("wave_number", 1)
        domain = story.get("domain", "unknown").lower()
        story_id = story.get("story_id", "UNKNOWN")
        
        # Add to wave
        plan["waves"][wave_num]["stories"].append(story_id)
        plan["waves"][wave_num]["domains"][domain].append(story_id)
        
        # Add to domain
        plan["domains"][domain].append({
            "story_id": story_id,
            "wave": wave_num,
            "title": story.get("title", "Untitled")
        })
        
        # Check dependencies
        deps = story.get("dependencies", [])
        for dep in deps:
            plan["dependencies"].append({
                "story": story_id,
                "depends_on": dep,
                "wave": wave_num
            })
    
    return plan

def validate_execution_plan(plan: Dict) -> List[str]:
    """Validate the execution plan"""
    issues = []
    
    # Check wave ordering
    waves = sorted(plan["waves"].keys())
    if waves and waves[0] != 1:
        issues.append(f"Waves should start at 1, first wave is {waves[0]}")
    
    for i in range(len(waves) - 1):
        if waves[i+1] - waves[i] > 1:
            issues.append(f"Gap in wave sequence: {waves[i]} -> {waves[i+1]}")
    
    # Check each wave has stories
    for wave_num, wave_data in plan["waves"].items():
        if not wave_data["stories"]:
            issues.append(f"Wave {wave_num} has no stories")
    
    # Check domains are consistent
    for domain, stories in plan["domains"].items():
        waves_in_domain = set(s["wave"] for s in stories)
        if len(waves_in_domain) > 3:
            issues.append(f"Domain '{domain}' spans {len(waves_in_domain)} waves (consider splitting)")
    
    # Check dependencies don't cross waves incorrectly
    for dep in plan["dependencies"]:
        # Find the wave of the dependency
        dep_wave = None
        for wave_num, wave_data in plan["waves"].items():
            if dep["depends_on"] in wave_data["stories"]:
                dep_wave = wave_num
                break
        
        if dep_wave and dep_wave > dep["wave"]:
            issues.append(
                f"Invalid dependency: {dep['story']} (Wave {dep['wave']}) "
                f"depends on {dep['depends_on']} (Wave {dep_wave})"
            )
    
    return issues

def generate_execution_plan_md(plan: Dict, output_path: str = "ai-prd/EXECUTION-PLAN.md"):
    """Generate markdown execution plan"""
    
    lines = [
        "# WAVE Execution Plan",
        "",
        f"Generated: {__import__('datetime').datetime.now().isoformat()}",
        "",
        "## Summary",
        "",
        f"- **Total Waves:** {len(plan['waves'])}",
        f"- **Total Domains:** {len(plan['domains'])}",
        f"- **Total Stories:** {sum(len(w['stories']) for w in plan['waves'].values())}",
        "",
        "## Execution Order",
        ""
    ]
    
    for wave_num in sorted(plan["waves"].keys()):
        wave_data = plan["waves"][wave_num]
        lines.append(f"### Wave {wave_num}")
        lines.append("")
        lines.append(f"**Stories:** {len(wave_data['stories'])}")
        lines.append("")
        
        for domain in sorted(wave_data["domains"].keys()):
            stories = wave_data["domains"][domain]
            lines.append(f"#### {domain.upper()} Domain")
            lines.append("")
            for story_id in stories:
                lines.append(f"- [ ] `{story_id}`")
            lines.append("")
    
    lines.append("## Domain Breakdown")
    lines.append("")
    
    for domain in sorted(plan["domains"].keys()):
        stories = plan["domains"][domain]
        lines.append(f"### {domain.upper()}")
        lines.append("")
        lines.append("| Story ID | Wave | Title |")
        lines.append("|----------|------|-------|")
        for s in sorted(stories, key=lambda x: (x["wave"], x["story_id"])):
            lines.append(f"| {s['story_id']} | {s['wave']} | {s['title']} |")
        lines.append("")
    
    # Write file
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        f.write("\n".join(lines))
    
    return output_path

def print_report(plan: Dict, issues: List[str]):
    """Print formatted execution plan report"""
    
    print("\n" + "=" * 60)
    print("WAVE EXECUTION PLAN VALIDATION")
    print("=" * 60)
    
    # Summary
    total_stories = sum(len(w["stories"]) for w in plan["waves"].values())
    print(f"\n📊 SUMMARY:")
    print(f"   Total Waves: {len(plan['waves'])}")
    print(f"   Total Domains: {len(plan['domains'])}")
    print(f"   Total Stories: {total_stories}")
    
    # Wave breakdown
    print(f"\n📋 WAVE BREAKDOWN:")
    print("-" * 40)
    
    for wave_num in sorted(plan["waves"].keys()):
        wave_data = plan["waves"][wave_num]
        domains = list(wave_data["domains"].keys())
        print(f"\n  WAVE {wave_num}:")
        print(f"    Stories: {len(wave_data['stories'])}")
        print(f"    Domains: {', '.join(d.upper() for d in domains)}")
        
        for domain, stories in wave_data["domains"].items():
            print(f"      {domain}: {', '.join(stories)}")
    
    # Domain breakdown
    print(f"\n🏢 DOMAIN ASSIGNMENT:")
    print("-" * 40)
    
    for domain in sorted(plan["domains"].keys()):
        stories = plan["domains"][domain]
        waves = sorted(set(s["wave"] for s in stories))
        print(f"  {domain.upper()}: {len(stories)} stories in Waves {waves}")
    
    # Issues
    print(f"\n⚠️  VALIDATION ISSUES:")
    print("-" * 40)
    
    if issues:
        for issue in issues:
            print(f"  ❌ {issue}")
    else:
        print("  ✅ No issues found!")
    
    # Result
    print("\n" + "=" * 60)
    if issues:
        print(f"❌ EXECUTION PLAN HAS {len(issues)} ISSUES")
    else:
        print("✅ EXECUTION PLAN VALID")
    print("=" * 60 + "\n")
    
    return len(issues) == 0

if __name__ == "__main__":
    story_dir = sys.argv[1] if len(sys.argv) > 1 else "ai-prd/stories"
    
    # Load stories
    stories = load_all_stories(story_dir)
    
    if not stories:
        print(f"❌ No stories found in {story_dir}")
        sys.exit(1)
    
    # Build plan
    plan = build_execution_plan(stories)
    
    # Validate
    issues = validate_execution_plan(plan)
    
    # Generate markdown
    md_path = generate_execution_plan_md(plan)
    print(f"📄 Execution plan written to: {md_path}")
    
    # Print report
    success = print_report(plan, issues)
    
    sys.exit(0 if success else 1)

Make executable: chmod +x scripts/validate_execution_plan.py

Show me the created file.
```

### 2.3 Create Sample Story (Schema V4 Template)

**Copy to Claude Code:**
```
Create file: ai-prd/stories/WAVE1-AUTH-001.json

{
  "story_id": "WAVE1-AUTH-001",
  "wave_number": 1,
  "domain": "auth",
  "title": "User Authentication with Email/Password",
  "description": "Implement secure email/password authentication using Supabase Auth, including login, signup, and password reset flows.",
  "prototype_reference": "design_mockups/auth-flow.html",
  "acceptance_criteria": [
    "AC-001: User can sign up with email and password",
    "AC-002: User can log in with existing credentials",
    "AC-003: User can reset password via email link",
    "AC-004: Invalid credentials show appropriate error messages",
    "AC-005: Session persists across page refreshes",
    "AC-006: Logout clears session completely"
  ],
  "story_data": {
    "objective": {
      "as_a": "new user",
      "i_want": "to create an account and log in securely",
      "so_that": "I can access protected features of the application"
    },
    "files": {
      "create": [
        "app/auth/login/page.tsx",
        "app/auth/signup/page.tsx",
        "app/auth/reset-password/page.tsx",
        "components/auth/LoginForm.tsx",
        "components/auth/SignupForm.tsx",
        "lib/auth/supabase-auth.ts"
      ],
      "modify": [
        "app/layout.tsx",
        "middleware.ts"
      ],
      "forbidden": [
        ".env",
        ".env.local",
        "supabase/migrations/*"
      ]
    },
    "safety": {
      "stop_conditions": [
        "Safety score < 0.85",
        "Hardcoded credentials detected",
        "Direct database access without RLS"
      ],
      "escalation_triggers": [
        "Changes to authentication middleware",
        "New environment variables required"
      ]
    },
    "tdd": {
      "test_files": [
        "__tests__/auth/login.test.ts",
        "__tests__/auth/signup.test.ts",
        "__tests__/components/LoginForm.test.tsx"
      ],
      "coverage_target": 80,
      "test_framework": "vitest"
    }
  },
  "dependencies": [],
  "estimated_points": 5,
  "priority": "high"
}

Show me the created file.
```

### 2.4 Run Story Validation

**Copy to Claude Code:**
```
Validate all AI Stories against Schema V4:

python scripts/validate_stories.py

Expected output:
============================================================
WAVE STORY VALIDATION (Schema v4)
============================================================

📋 STORIES BY WAVE:
----------------------------------------
  Wave 1: X stories (X valid)
    ✅ WAVE1-AUTH-001 [auth]
    ...

🏢 STORIES BY DOMAIN:
----------------------------------------
  AUTH: X stories
  ORDERS: X stories
  ...

⚠️  ISSUES:
----------------------------------------
  No issues found!

============================================================
✅ ALL X STORIES VALID
============================================================

Report any errors or warnings.
```

### 2.5 Run Execution Plan Validation

**Copy to Claude Code:**
```
Validate and generate execution plan:

python scripts/validate_execution_plan.py

Expected output:
============================================================
WAVE EXECUTION PLAN VALIDATION
============================================================

📊 SUMMARY:
   Total Waves: X
   Total Domains: X
   Total Stories: X

📋 WAVE BREAKDOWN:
----------------------------------------
  WAVE 1:
    Stories: X
    Domains: AUTH, ORDERS, ...
      auth: WAVE1-AUTH-001, WAVE1-AUTH-002
      orders: WAVE1-ORDERS-001

🏢 DOMAIN ASSIGNMENT:
----------------------------------------
  AUTH: X stories in Waves [1, 2]
  ORDERS: X stories in Waves [1, 2, 3]

⚠️  VALIDATION ISSUES:
----------------------------------------
  ✅ No issues found!

============================================================
✅ EXECUTION PLAN VALID
============================================================

Also check that ai-prd/EXECUTION-PLAN.md was generated.
Report the results.
```

### 2.6 Story Schema V4 Reference

**For your reference - Schema V4 required structure:**

```json
{
  "story_id": "WAVE{N}-{DOMAIN}-{NUM}",    // Required: Unique ID
  "wave_number": 1,                         // Required: 1-10
  "domain": "auth",                         // Required: Business domain
  "title": "Short title",                   // Required: Human readable
  "description": "Full description",        // Required: What to build
  "prototype_reference": "path/to/html",    // Required: Link to mockup
  "acceptance_criteria": [                  // Required: At least 1
    "AC-001: Testable criterion"
  ],
  "story_data": {                           // Recommended
    "objective": {                          // User story format
      "as_a": "user type",
      "i_want": "to do something",
      "so_that": "I get value"
    },
    "files": {                              // File scope
      "create": [],
      "modify": [],
      "forbidden": []
    },
    "safety": {                             // Safety rules
      "stop_conditions": [],
      "escalation_triggers": []
    },
    "tdd": {                                // Test requirements
      "test_files": [],
      "coverage_target": 80,
      "test_framework": "vitest"
    }
  },
  "dependencies": [],                       // Optional: Story IDs
  "estimated_points": 5,                    // Optional: 1-13
  "priority": "high"                        // Optional: high/medium/low
}
```

---

## STEP 3: Validate Branching & TDD Setup

### 3.1 Create Git Worktree Validator

**Copy to Claude Code:**
```
Create file: scripts/validate_branching.py

#!/usr/bin/env python3
"""
WAVE v2 Branching Validator
Ensures Git worktrees and branch structure are correct for autonomous execution
"""

import os
import subprocess
import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

# Expected worktree structure per domain
AGENT_WORKTREES = ["cto", "pm", "fe-dev-1", "fe-dev-2", "be-dev-1", "be-dev-2", "qa"]

# Branch naming convention: wave{N}/{domain}/{story-id}
BRANCH_PATTERN = r"wave\d+/[a-z-]+/WAVE\d+-[A-Z]+-\d+"

def run_git_command(args: List[str], cwd: str = None) -> Tuple[bool, str]:
    """Run a git command and return success status and output"""
    try:
        result = subprocess.run(
            ["git"] + args,
            capture_output=True,
            text=True,
            cwd=cwd
        )
        return result.returncode == 0, result.stdout.strip()
    except Exception as e:
        return False, str(e)

def check_git_repo() -> Dict:
    """Verify we're in a git repository"""
    success, output = run_git_command(["rev-parse", "--git-dir"])
    
    if not success:
        return {
            "valid": False,
            "error": "Not a git repository"
        }
    
    # Get current branch
    success, branch = run_git_command(["branch", "--show-current"])
    
    # Get remote
    success, remote = run_git_command(["remote", "get-url", "origin"])
    
    # Check if clean
    success, status = run_git_command(["status", "--porcelain"])
    is_clean = len(status) == 0
    
    return {
        "valid": True,
        "current_branch": branch,
        "remote": remote,
        "is_clean": is_clean,
        "uncommitted_changes": len(status.split("\n")) if status else 0
    }

def get_existing_worktrees() -> List[Dict]:
    """Get list of existing worktrees"""
    success, output = run_git_command(["worktree", "list", "--porcelain"])
    
    if not success:
        return []
    
    worktrees = []
    current = {}
    
    for line in output.split("\n"):
        if line.startswith("worktree "):
            if current:
                worktrees.append(current)
            current = {"path": line[9:]}
        elif line.startswith("HEAD "):
            current["head"] = line[5:]
        elif line.startswith("branch "):
            current["branch"] = line[7:]
        elif line == "bare":
            current["bare"] = True
        elif line == "detached":
            current["detached"] = True
    
    if current:
        worktrees.append(current)
    
    return worktrees

def check_worktree_structure(domains: List[str]) -> Dict:
    """Check if worktrees are set up for each domain"""
    
    worktrees_dir = Path("worktrees")
    results = {
        "valid": True,
        "domains": {},
        "missing": [],
        "extra": []
    }
    
    existing = get_existing_worktrees()
    existing_paths = {w["path"] for w in existing}
    
    for domain in domains:
        domain_path = worktrees_dir / domain
        
        if not domain_path.exists():
            results["missing"].append(domain)
            results["valid"] = False
            results["domains"][domain] = {"exists": False, "agents": []}
        else:
            # Check for agent subdirectories
            agent_dirs = []
            for agent in AGENT_WORKTREES:
                agent_path = domain_path / agent
                if agent_path.exists():
                    agent_dirs.append(agent)
            
            results["domains"][domain] = {
                "exists": True,
                "agents": agent_dirs,
                "missing_agents": [a for a in AGENT_WORKTREES if a not in agent_dirs]
            }
            
            if len(agent_dirs) < len(AGENT_WORKTREES):
                results["valid"] = False
    
    return results

def create_worktrees_for_domain(domain: str, base_branch: str = "main") -> Dict:
    """Create worktree structure for a domain"""
    
    worktrees_dir = Path("worktrees") / domain
    worktrees_dir.mkdir(parents=True, exist_ok=True)
    
    results = {"domain": domain, "created": [], "errors": []}
    
    for agent in AGENT_WORKTREES:
        agent_path = worktrees_dir / agent
        branch_name = f"wave1/{domain}/{agent}"
        
        if agent_path.exists():
            results["created"].append({"agent": agent, "status": "exists"})
            continue
        
        # Create branch if it doesn't exist
        run_git_command(["branch", branch_name, base_branch])
        
        # Create worktree
        success, output = run_git_command([
            "worktree", "add", str(agent_path), branch_name
        ])
        
        if success:
            results["created"].append({"agent": agent, "status": "created", "path": str(agent_path)})
        else:
            results["errors"].append({"agent": agent, "error": output})
    
    return results

def validate_branch_naming(stories_dir: str = "ai-prd/stories") -> Dict:
    """Validate that branch names follow WAVE conventions"""
    
    success, output = run_git_command(["branch", "-a"])
    
    if not success:
        return {"valid": False, "error": "Failed to list branches"}
    
    branches = [b.strip().replace("* ", "") for b in output.split("\n") if b.strip()]
    
    results = {
        "valid": True,
        "wave_branches": [],
        "invalid_branches": [],
        "total_branches": len(branches)
    }
    
    import re
    pattern = re.compile(BRANCH_PATTERN)
    
    for branch in branches:
        # Skip remote tracking branches for now
        if branch.startswith("remotes/"):
            continue
        
        # Check if it's a wave branch
        if branch.startswith("wave"):
            if pattern.match(branch):
                results["wave_branches"].append(branch)
            else:
                results["invalid_branches"].append(branch)
                results["valid"] = False
    
    return results

def print_report(git_info: Dict, worktree_info: Dict, branch_info: Dict):
    """Print formatted branching validation report"""
    
    print("\n" + "=" * 60)
    print("WAVE BRANCHING VALIDATION")
    print("=" * 60)
    
    # Git repo info
    print("\n📂 GIT REPOSITORY:")
    print("-" * 40)
    if not git_info["valid"]:
        print(f"  ❌ {git_info['error']}")
        return False
    
    print(f"  Branch: {git_info['current_branch']}")
    print(f"  Remote: {git_info['remote']}")
    clean_icon = "✅" if git_info["is_clean"] else "⚠️"
    print(f"  {clean_icon} Working tree: {'clean' if git_info['is_clean'] else f'{git_info[\"uncommitted_changes\"]} uncommitted changes'}")
    
    # Worktree structure
    print("\n🌳 WORKTREE STRUCTURE:")
    print("-" * 40)
    
    for domain, info in worktree_info["domains"].items():
        if info["exists"]:
            agent_count = len(info["agents"])
            total = len(AGENT_WORKTREES)
            icon = "✅" if agent_count == total else "⚠️"
            print(f"  {icon} {domain.upper()}: {agent_count}/{total} agents")
            
            if info.get("missing_agents"):
                print(f"      Missing: {', '.join(info['missing_agents'])}")
        else:
            print(f"  ❌ {domain.upper()}: NOT CREATED")
    
    if worktree_info["missing"]:
        print(f"\n  Missing domains: {', '.join(worktree_info['missing'])}")
    
    # Branch naming
    print("\n🔀 BRANCH NAMING:")
    print("-" * 40)
    print(f"  Total branches: {branch_info['total_branches']}")
    print(f"  Wave branches: {len(branch_info['wave_branches'])}")
    
    if branch_info["wave_branches"]:
        print("  Valid wave branches:")
        for b in branch_info["wave_branches"][:5]:  # Show first 5
            print(f"    ✅ {b}")
        if len(branch_info["wave_branches"]) > 5:
            print(f"    ... and {len(branch_info['wave_branches']) - 5} more")
    
    if branch_info["invalid_branches"]:
        print("  ⚠️ Invalid branch names:")
        for b in branch_info["invalid_branches"]:
            print(f"    ❌ {b}")
    
    # Overall status
    print("\n" + "=" * 60)
    all_valid = git_info["valid"] and worktree_info["valid"] and branch_info["valid"]
    
    if all_valid:
        print("✅ BRANCHING VALIDATION PASSED")
    else:
        print("❌ BRANCHING VALIDATION FAILED")
        if not git_info["is_clean"]:
            print("   → Commit or stash changes before proceeding")
        if worktree_info["missing"]:
            print("   → Run: python scripts/validate_branching.py --setup")
    
    print("=" * 60 + "\n")
    
    return all_valid

def setup_worktrees(domains: List[str]):
    """Setup worktrees for all domains"""
    print("\n🔧 Setting up worktrees...")
    
    for domain in domains:
        print(f"\n  Creating worktrees for {domain.upper()}...")
        result = create_worktrees_for_domain(domain)
        
        for item in result["created"]:
            print(f"    ✅ {item['agent']}: {item['status']}")
        
        for item in result["errors"]:
            print(f"    ❌ {item['agent']}: {item['error']}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="WAVE Branching Validator")
    parser.add_argument("--domains", nargs="+", default=["auth", "orders", "payments", "admin"],
                        help="Domains to validate/setup")
    parser.add_argument("--setup", action="store_true", help="Create missing worktrees")
    args = parser.parse_args()
    
    # Validate
    git_info = check_git_repo()
    worktree_info = check_worktree_structure(args.domains)
    branch_info = validate_branch_naming()
    
    # Setup if requested
    if args.setup and worktree_info["missing"]:
        setup_worktrees(worktree_info["missing"])
        # Re-validate
        worktree_info = check_worktree_structure(args.domains)
    
    # Print report
    success = print_report(git_info, worktree_info, branch_info)
    
    sys.exit(0 if success else 1)

Make executable: chmod +x scripts/validate_branching.py

Show me the created file.
```

### 3.2 Create TDD Enforcement Validator

**Copy to Claude Code:**
```
Create file: scripts/validate_tdd.py

#!/usr/bin/env python3
"""
WAVE v2 TDD Enforcement Validator
Ensures Test-Driven Development requirements are met before execution
"""

import os
import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

# Test file patterns
TEST_PATTERNS = [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "__tests__/**/*.ts",
    "__tests__/**/*.tsx",
    "tests/**/*.py",
    "test_*.py"
]

# Supported test frameworks
TEST_FRAMEWORKS = {
    "vitest": {
        "config_files": ["vitest.config.ts", "vitest.config.js", "vite.config.ts"],
        "run_command": "npx vitest run --coverage",
        "coverage_command": "npx vitest run --coverage --reporter=json"
    },
    "jest": {
        "config_files": ["jest.config.js", "jest.config.ts", "jest.config.json"],
        "run_command": "npx jest --coverage",
        "coverage_command": "npx jest --coverage --json"
    },
    "pytest": {
        "config_files": ["pytest.ini", "pyproject.toml", "setup.cfg"],
        "run_command": "pytest --cov",
        "coverage_command": "pytest --cov --cov-report=json"
    }
}

def detect_test_framework() -> Dict:
    """Detect which test framework is configured"""
    
    for framework, config in TEST_FRAMEWORKS.items():
        for config_file in config["config_files"]:
            if os.path.exists(config_file):
                return {
                    "framework": framework,
                    "config_file": config_file,
                    "run_command": config["run_command"],
                    "coverage_command": config["coverage_command"]
                }
    
    # Check package.json for test script
    if os.path.exists("package.json"):
        with open("package.json") as f:
            pkg = json.load(f)
            scripts = pkg.get("scripts", {})
            
            if "test" in scripts:
                test_script = scripts["test"]
                if "vitest" in test_script:
                    return {**TEST_FRAMEWORKS["vitest"], "framework": "vitest"}
                elif "jest" in test_script:
                    return {**TEST_FRAMEWORKS["jest"], "framework": "jest"}
    
    return {"framework": None, "error": "No test framework detected"}

def find_test_files() -> List[str]:
    """Find all test files in the project"""
    
    test_files = []
    
    for pattern in TEST_PATTERNS:
        for path in Path(".").glob(pattern):
            if "node_modules" not in str(path) and ".next" not in str(path):
                test_files.append(str(path))
    
    return sorted(set(test_files))

def get_file_timestamps(files: List[str]) -> Dict[str, datetime]:
    """Get modification timestamps for files"""
    
    timestamps = {}
    for filepath in files:
        if os.path.exists(filepath):
            mtime = os.path.getmtime(filepath)
            timestamps[filepath] = datetime.fromtimestamp(mtime)
    
    return timestamps

def check_tests_written_first(story_file: str) -> Dict:
    """
    Check if tests were written before implementation for a story.
    Uses file timestamps and git history as heuristics.
    """
    
    with open(story_file) as f:
        story = json.load(f)
    
    story_id = story.get("story_id", "UNKNOWN")
    story_data = story.get("story_data", {})
    tdd_config = story_data.get("tdd", {})
    files_config = story_data.get("files", {})
    
    test_files = tdd_config.get("test_files", [])
    impl_files = files_config.get("create", []) + files_config.get("modify", [])
    
    result = {
        "story_id": story_id,
        "test_files": test_files,
        "impl_files": impl_files,
        "tests_exist": [],
        "tests_missing": [],
        "written_first": None,
        "issues": []
    }
    
    # Check which test files exist
    for test_file in test_files:
        if os.path.exists(test_file):
            result["tests_exist"].append(test_file)
        else:
            result["tests_missing"].append(test_file)
    
    # If we have both test and impl files, check timestamps
    if result["tests_exist"] and impl_files:
        test_timestamps = get_file_timestamps(result["tests_exist"])
        impl_timestamps = get_file_timestamps([f for f in impl_files if os.path.exists(f)])
        
        if test_timestamps and impl_timestamps:
            earliest_test = min(test_timestamps.values())
            earliest_impl = min(impl_timestamps.values())
            
            result["written_first"] = earliest_test <= earliest_impl
            
            if not result["written_first"]:
                result["issues"].append(
                    f"Tests written AFTER implementation (test: {earliest_test}, impl: {earliest_impl})"
                )
    
    return result

def run_tests_and_get_coverage() -> Dict:
    """Run tests and capture coverage"""
    
    framework = detect_test_framework()
    
    if not framework.get("framework"):
        return {
            "success": False,
            "error": framework.get("error", "No test framework"),
            "coverage": None
        }
    
    print(f"  Running {framework['framework']} tests...")
    
    try:
        result = subprocess.run(
            framework["run_command"].split(),
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        # Try to parse coverage from output
        coverage = None
        output = result.stdout + result.stderr
        
        # Look for coverage percentage in output
        import re
        coverage_match = re.search(r"(\d+(?:\.\d+)?)\s*%\s*(?:coverage|covered)", output, re.IGNORECASE)
        if coverage_match:
            coverage = float(coverage_match.group(1))
        
        return {
            "success": result.returncode == 0,
            "framework": framework["framework"],
            "coverage": coverage,
            "output": output[-1000:] if len(output) > 1000 else output,  # Last 1000 chars
            "exit_code": result.returncode
        }
    
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Tests timed out after 5 minutes",
            "coverage": None
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "coverage": None
        }

def validate_tdd_for_stories(story_dir: str = "ai-prd/stories") -> Dict:
    """Validate TDD requirements for all stories"""
    
    results = {
        "valid": True,
        "framework": None,
        "test_files_found": [],
        "stories": [],
        "coverage": None,
        "issues": []
    }
    
    # Detect framework
    framework = detect_test_framework()
    results["framework"] = framework
    
    if not framework.get("framework"):
        results["issues"].append("No test framework detected - install vitest, jest, or pytest")
        results["valid"] = False
    
    # Find all test files
    results["test_files_found"] = find_test_files()
    
    if not results["test_files_found"]:
        results["issues"].append("No test files found in project")
        results["valid"] = False
    
    # Check each story
    story_files = list(Path(story_dir).glob("*.json"))
    
    for story_file in story_files:
        story_result = check_tests_written_first(str(story_file))
        results["stories"].append(story_result)
        
        if story_result["tests_missing"]:
            results["issues"].append(
                f"{story_result['story_id']}: Missing tests: {', '.join(story_result['tests_missing'])}"
            )
            results["valid"] = False
        
        if story_result["written_first"] is False:
            results["issues"].append(
                f"{story_result['story_id']}: Tests written AFTER implementation (TDD violation)"
            )
            # Warning only, not blocking
    
    return results

def print_report(results: Dict, test_results: Dict = None):
    """Print formatted TDD validation report"""
    
    print("\n" + "=" * 60)
    print("WAVE TDD ENFORCEMENT VALIDATION")
    print("=" * 60)
    
    # Framework
    print("\n🧪 TEST FRAMEWORK:")
    print("-" * 40)
    
    framework = results.get("framework", {})
    if framework.get("framework"):
        print(f"  ✅ Framework: {framework['framework']}")
        print(f"     Config: {framework.get('config_file', 'N/A')}")
        print(f"     Command: {framework.get('run_command', 'N/A')}")
    else:
        print(f"  ❌ No test framework detected")
        print("     Install: npm install -D vitest @vitest/coverage-v8")
    
    # Test files
    print("\n📁 TEST FILES:")
    print("-" * 40)
    
    test_files = results.get("test_files_found", [])
    if test_files:
        print(f"  Found {len(test_files)} test files:")
        for tf in test_files[:10]:
            print(f"    ✅ {tf}")
        if len(test_files) > 10:
            print(f"    ... and {len(test_files) - 10} more")
    else:
        print("  ❌ No test files found")
    
    # Story TDD compliance
    print("\n📋 STORY TDD COMPLIANCE:")
    print("-" * 40)
    
    for story in results.get("stories", []):
        story_id = story["story_id"]
        tests_exist = len(story["tests_exist"])
        tests_total = len(story["test_files"])
        
        if tests_total == 0:
            print(f"  ⚠️  {story_id}: No test files specified in story")
        elif tests_exist == tests_total:
            icon = "✅" if story.get("written_first", True) else "⚠️"
            print(f"  {icon} {story_id}: {tests_exist}/{tests_total} test files exist")
        else:
            print(f"  ❌ {story_id}: {tests_exist}/{tests_total} test files exist")
            for missing in story["tests_missing"]:
                print(f"       Missing: {missing}")
    
    # Test execution results
    if test_results:
        print("\n🏃 TEST EXECUTION:")
        print("-" * 40)
        
        if test_results.get("success"):
            print(f"  ✅ Tests passed")
        else:
            print(f"  ❌ Tests failed: {test_results.get('error', 'Unknown error')}")
        
        coverage = test_results.get("coverage")
        if coverage is not None:
            icon = "✅" if coverage >= 80 else "⚠️" if coverage >= 60 else "❌"
            print(f"  {icon} Coverage: {coverage:.1f}% (target: 80%)")
    
    # Issues
    print("\n⚠️  ISSUES:")
    print("-" * 40)
    
    if results.get("issues"):
        for issue in results["issues"]:
            print(f"  ❌ {issue}")
    else:
        print("  ✅ No issues found")
    
    # Overall status
    print("\n" + "=" * 60)
    
    if results["valid"]:
        print("✅ TDD VALIDATION PASSED")
    else:
        print("❌ TDD VALIDATION FAILED")
        print("   → Create missing test files before proceeding")
        print("   → Run: npm test (to verify tests pass)")
    
    print("=" * 60 + "\n")
    
    return results["valid"]

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="WAVE TDD Validator")
    parser.add_argument("--run-tests", action="store_true", help="Actually run the tests")
    parser.add_argument("--stories", default="ai-prd/stories", help="Stories directory")
    args = parser.parse_args()
    
    # Validate TDD setup
    results = validate_tdd_for_stories(args.stories)
    
    # Run tests if requested
    test_results = None
    if args.run_tests and results.get("framework", {}).get("framework"):
        test_results = run_tests_and_get_coverage()
    
    # Print report
    success = print_report(results, test_results)
    
    sys.exit(0 if success else 1)

Make executable: chmod +x scripts/validate_tdd.py

Show me the created file.
```

### 3.3 Create Combined Branching + TDD Check Script

**Copy to Claude Code:**
```
Create file: scripts/validate_dev_setup.py

#!/usr/bin/env python3
"""
WAVE v2 Development Setup Validator
Combined validation for Branching + TDD before story execution
"""

import subprocess
import sys

def run_validator(script: str, args: list = None) -> bool:
    """Run a validation script and return success status"""
    cmd = ["python", script] + (args or [])
    result = subprocess.run(cmd)
    return result.returncode == 0

def main():
    print("\n" + "=" * 60)
    print("WAVE v2 DEVELOPMENT SETUP VALIDATION")
    print("=" * 60)
    
    all_passed = True
    
    # 1. Branching validation
    print("\n" + "─" * 60)
    print("STEP 1: BRANCHING VALIDATION")
    print("─" * 60)
    
    if not run_validator("scripts/validate_branching.py"):
        all_passed = False
        print("\n⚠️  Fix branching issues before proceeding")
        print("   Run: python scripts/validate_branching.py --setup")
    
    # 2. TDD validation
    print("\n" + "─" * 60)
    print("STEP 2: TDD VALIDATION")
    print("─" * 60)
    
    if not run_validator("scripts/validate_tdd.py"):
        all_passed = False
        print("\n⚠️  Fix TDD issues before proceeding")
    
    # Final status
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL DEVELOPMENT CHECKS PASSED")
        print("   Ready for story execution!")
    else:
        print("❌ DEVELOPMENT SETUP INCOMPLETE")
        print("   Fix the issues above before running stories")
    print("=" * 60 + "\n")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

Make executable: chmod +x scripts/validate_dev_setup.py

Show me the created file.
```

### 3.4 Run Branching Validation

**Copy to Claude Code:**
```
Validate Git branching structure:

python scripts/validate_branching.py --domains auth orders payments admin

Expected output:
============================================================
WAVE BRANCHING VALIDATION
============================================================

📂 GIT REPOSITORY:
----------------------------------------
  Branch: main
  Remote: https://github.com/...
  ✅ Working tree: clean

🌳 WORKTREE STRUCTURE:
----------------------------------------
  ✅ AUTH: 7/7 agents
  ✅ ORDERS: 7/7 agents
  ✅ PAYMENTS: 7/7 agents
  ✅ ADMIN: 7/7 agents

🔀 BRANCH NAMING:
----------------------------------------
  Total branches: X
  Wave branches: X
  Valid wave branches:
    ✅ wave1/auth/WAVE1-AUTH-001
    ...

============================================================
✅ BRANCHING VALIDATION PASSED
============================================================

If worktrees are missing, run:
python scripts/validate_branching.py --domains auth orders payments admin --setup

Report the results.
```

### 3.5 Run TDD Validation

**Copy to Claude Code:**
```
Validate TDD setup:

python scripts/validate_tdd.py --stories ai-prd/stories

Expected output:
============================================================
WAVE TDD ENFORCEMENT VALIDATION
============================================================

🧪 TEST FRAMEWORK:
----------------------------------------
  ✅ Framework: vitest
     Config: vitest.config.ts
     Command: npx vitest run --coverage

📁 TEST FILES:
----------------------------------------
  Found X test files:
    ✅ __tests__/auth/login.test.ts
    ...

📋 STORY TDD COMPLIANCE:
----------------------------------------
  ✅ WAVE1-AUTH-001: 3/3 test files exist
  ✅ WAVE1-AUTH-002: 2/2 test files exist
  ...

⚠️  ISSUES:
----------------------------------------
  ✅ No issues found

============================================================
✅ TDD VALIDATION PASSED
============================================================

If you want to also run the tests:
python scripts/validate_tdd.py --stories ai-prd/stories --run-tests

Report the results.
```

### 3.6 Run Combined Development Check

**Copy to Claude Code:**
```
Run combined branching + TDD validation:

python scripts/validate_dev_setup.py

This runs both validators in sequence and gives you a GO/NO-GO status.

Expected:
============================================================
WAVE v2 DEVELOPMENT SETUP VALIDATION
============================================================

────────────────────────────────────────────────────────────
STEP 1: BRANCHING VALIDATION
────────────────────────────────────────────────────────────
[branching output]

────────────────────────────────────────────────────────────
STEP 2: TDD VALIDATION
────────────────────────────────────────────────────────────
[tdd output]

============================================================
✅ ALL DEVELOPMENT CHECKS PASSED
   Ready for story execution!
============================================================

Report the results.
```

### 3.7 Setup Missing Worktrees (If Needed)

**Copy to Claude Code (only if worktrees are missing):**
```
Create worktrees for all domains:

python scripts/validate_branching.py --domains auth orders payments admin --setup

This will create:
worktrees/
├── auth/
│   ├── cto/
│   ├── pm/
│   ├── fe-dev-1/
│   ├── fe-dev-2/
│   ├── be-dev-1/
│   ├── be-dev-2/
│   └── qa/
├── orders/
│   └── [same structure]
├── payments/
│   └── [same structure]
└── admin/
    └── [same structure]

Each worktree will be on its own branch:
- wave1/auth/cto
- wave1/auth/pm
- wave1/auth/fe-dev-1
- etc.

Report the results.
```

### 3.8 TDD Quick Reference

**Expected TDD Flow:**

```
GATE 2: TDD (RED Phase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
│  1. QA Agent reads story acceptance criteria
│  2. QA Agent writes failing tests in test_files
│  3. Tests MUST FAIL at this point (no implementation yet)
│  4. Gate 2 passes only if:
│     - All test files exist
│     - Tests run without errors (but fail assertions)
│
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                           ↓
GATE 3: Branching
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
│  1. Create feature branch from main
│  2. Branch name: wave{N}/{domain}/{story-id}
│  3. Each agent works in their worktree
│
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                           ↓
GATE 4: Develop (GREEN Phase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│
│  1. FE/BE Agents implement code
│  2. Goal: Make the failing tests PASS
│  3. Gate 4 passes only if:
│     - All tests pass
│     - Coverage >= 80%
│
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STEP 4: Validate RLM (Context Management)

### 4.1 Create RLM Configuration Validator

**Copy to Claude Code:**
```
Create file: scripts/validate_rlm.py

#!/usr/bin/env python3
"""
WAVE v2 RLM (Recursive Language Model) Validator
Ensures context management is properly configured for autonomous execution
"""

import os
import json
import sys
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# RLM Configuration defaults
RLM_CONFIG = {
    "budget_limit_tokens": 100000,      # Max tokens per session
    "warning_threshold": 0.8,            # 80% triggers warning
    "prune_threshold": 0.9,              # 90% triggers auto-prune
    "snapshot_interval": 10,             # Snapshot every 10 operations
    "essential_keys": [                  # Keys to preserve during pruning
        "wave_state",
        "agent_memory", 
        "current_gate",
        "story_id",
        "domain",
        "acceptance_criteria"
    ]
}

# Required RLM files
RLM_FILES = {
    "p_variable": "orchestrator/p_variable.py",
    "rlm_auditor": "scripts/rlm_auditor.py",
    "snapshots_dir": ".claude/snapshots"
}

def estimate_token_count(obj: Any) -> int:
    """Estimate tokens for any object (~4 chars per token)"""
    try:
        json_str = json.dumps(obj, default=str)
        return len(json_str) // 4
    except:
        return len(str(obj)) // 4

def check_rlm_files() -> Dict:
    """Check if RLM files exist"""
    results = {
        "valid": True,
        "files": {},
        "missing": []
    }
    
    for name, path in RLM_FILES.items():
        exists = os.path.exists(path)
        results["files"][name] = {
            "path": path,
            "exists": exists
        }
        if not exists:
            results["missing"].append(path)
            if name != "snapshots_dir":  # Snapshots dir is optional initially
                results["valid"] = False
    
    return results

def check_p_variable_structure(p_variable_path: str = None) -> Dict:
    """Validate P Variable structure and functions"""
    
    if p_variable_path is None:
        p_variable_path = RLM_FILES["p_variable"]
    
    if not os.path.exists(p_variable_path):
        return {
            "valid": False,
            "error": f"P Variable file not found: {p_variable_path}"
        }
    
    with open(p_variable_path, 'r') as f:
        content = f.read()
    
    required_functions = [
        "check_rlm_budget",
        "prune_p_variable",
        "estimate_token_count",
        "save_snapshot",
        "load_snapshot"
    ]
    
    required_classes = [
        "RLMBudgetTracker"
    ]
    
    results = {
        "valid": True,
        "functions": {},
        "classes": {},
        "missing": []
    }
    
    for func in required_functions:
        found = f"def {func}" in content
        results["functions"][func] = found
        if not found:
            results["missing"].append(f"function: {func}")
            results["valid"] = False
    
    for cls in required_classes:
        found = f"class {cls}" in content
        results["classes"][cls] = found
        if not found:
            results["missing"].append(f"class: {cls}")
            results["valid"] = False
    
    return results

def check_snapshots_directory() -> Dict:
    """Check snapshots directory structure"""
    
    snapshots_dir = Path(RLM_FILES["snapshots_dir"])
    
    if not snapshots_dir.exists():
        return {
            "valid": True,  # Will be created on first run
            "exists": False,
            "snapshots": [],
            "message": "Directory will be created on first run"
        }
    
    snapshots = list(snapshots_dir.glob("*.json"))
    
    return {
        "valid": True,
        "exists": True,
        "snapshots": [s.name for s in snapshots[-10:]],  # Last 10
        "total_count": len(snapshots),
        "total_size_kb": sum(s.stat().st_size for s in snapshots) // 1024
    }

def check_env_variables() -> Dict:
    """Check RLM-related environment variables"""
    
    env_vars = {
        "RLM_BUDGET_LIMIT": os.getenv("RLM_BUDGET_LIMIT", "100000"),
        "RLM_WARNING_THRESHOLD": os.getenv("RLM_WARNING_THRESHOLD", "0.8"),
        "RLM_PRUNE_THRESHOLD": os.getenv("RLM_PRUNE_THRESHOLD", "0.9"),
        "RLM_SNAPSHOT_INTERVAL": os.getenv("RLM_SNAPSHOT_INTERVAL", "10"),
        "RLM_ENABLED": os.getenv("RLM_ENABLED", "true")
    }
    
    return {
        "valid": True,
        "variables": env_vars,
        "enabled": env_vars["RLM_ENABLED"].lower() == "true"
    }

def simulate_budget_check(test_context: Dict = None) -> Dict:
    """Simulate a budget check with test context"""
    
    if test_context is None:
        # Create sample context similar to real execution
        test_context = {
            "wave_state": {
                "current_wave": 1,
                "current_story": "WAVE1-AUTH-001",
                "current_gate": 2,
                "status": "in_progress"
            },
            "agent_memory": {
                "cto": {"decisions": [], "validations": []},
                "pm": {"assignments": [], "status_updates": []},
                "fe_dev_1": {"files_created": [], "components": []},
                "fe_dev_2": {"files_created": [], "components": []},
                "be_dev_1": {"files_created": [], "endpoints": []},
                "be_dev_2": {"files_created": [], "endpoints": []},
                "qa": {"tests_written": [], "coverage": 0}
            },
            "story_context": {
                "acceptance_criteria": ["AC-001", "AC-002", "AC-003"],
                "files_to_create": ["page.tsx", "api.ts", "test.ts"],
                "prototype_reference": "design_mockups/auth.html"
            },
            "execution_log": [
                {"timestamp": "2026-01-29T10:00:00", "action": "story_started"},
                {"timestamp": "2026-01-29T10:05:00", "action": "gate_1_passed"}
            ]
        }
    
    token_count = estimate_token_count(test_context)
    budget_limit = int(os.getenv("RLM_BUDGET_LIMIT", "100000"))
    warning_threshold = float(os.getenv("RLM_WARNING_THRESHOLD", "0.8"))
    
    usage_percent = token_count / budget_limit
    
    if usage_percent > 1.0:
        status = "HALT"
    elif usage_percent > warning_threshold:
        status = "WARNING"
    else:
        status = "SAFE"
    
    return {
        "token_count": token_count,
        "budget_limit": budget_limit,
        "usage_percent": round(usage_percent * 100, 2),
        "status": status,
        "can_proceed": status != "HALT"
    }

def simulate_context_prune(context: Dict) -> Dict:
    """Simulate context pruning"""
    
    essential_keys = RLM_CONFIG["essential_keys"]
    
    original_tokens = estimate_token_count(context)
    
    # Prune to essential keys only
    pruned = {}
    for key in essential_keys:
        if key in context:
            pruned[key] = context[key]
    
    pruned_tokens = estimate_token_count(pruned)
    
    reduction = ((original_tokens - pruned_tokens) / original_tokens) * 100 if original_tokens > 0 else 0
    
    return {
        "original_tokens": original_tokens,
        "pruned_tokens": pruned_tokens,
        "reduction_percent": round(reduction, 2),
        "keys_preserved": list(pruned.keys()),
        "keys_removed": [k for k in context.keys() if k not in essential_keys]
    }

def print_report(
    files_result: Dict,
    structure_result: Dict,
    snapshots_result: Dict,
    env_result: Dict,
    budget_result: Dict,
    prune_result: Dict
):
    """Print formatted RLM validation report"""
    
    print("\n" + "=" * 60)
    print("WAVE RLM (CONTEXT MANAGEMENT) VALIDATION")
    print("=" * 60)
    
    # Files check
    print("\n📁 RLM FILES:")
    print("-" * 40)
    
    for name, info in files_result["files"].items():
        icon = "✅" if info["exists"] else "❌"
        print(f"  {icon} {name}: {info['path']}")
    
    # P Variable structure
    print("\n🔧 P_VARIABLE STRUCTURE:")
    print("-" * 40)
    
    if "error" in structure_result:
        print(f"  ❌ {structure_result['error']}")
    else:
        print("  Functions:")
        for func, found in structure_result["functions"].items():
            icon = "✅" if found else "❌"
            print(f"    {icon} {func}()")
        
        print("  Classes:")
        for cls, found in structure_result["classes"].items():
            icon = "✅" if found else "❌"
            print(f"    {icon} {cls}")
    
    # Snapshots
    print("\n📸 SNAPSHOTS:")
    print("-" * 40)
    
    if snapshots_result["exists"]:
        print(f"  ✅ Directory exists")
        print(f"     Total snapshots: {snapshots_result['total_count']}")
        print(f"     Total size: {snapshots_result['total_size_kb']} KB")
        if snapshots_result["snapshots"]:
            print(f"     Recent: {', '.join(snapshots_result['snapshots'][:3])}")
    else:
        print(f"  ⚠️  Directory not created yet (OK for first run)")
    
    # Environment
    print("\n🌍 ENVIRONMENT:")
    print("-" * 40)
    
    enabled_icon = "✅" if env_result["enabled"] else "❌"
    print(f"  {enabled_icon} RLM Enabled: {env_result['enabled']}")
    print(f"  Budget Limit: {env_result['variables']['RLM_BUDGET_LIMIT']} tokens")
    print(f"  Warning Threshold: {float(env_result['variables']['RLM_WARNING_THRESHOLD']) * 100}%")
    print(f"  Prune Threshold: {float(env_result['variables']['RLM_PRUNE_THRESHOLD']) * 100}%")
    
    # Budget simulation
    print("\n💰 BUDGET SIMULATION:")
    print("-" * 40)
    
    status_icons = {"SAFE": "✅", "WARNING": "⚠️", "HALT": "❌"}
    print(f"  Test context tokens: {budget_result['token_count']}")
    print(f"  Budget limit: {budget_result['budget_limit']}")
    print(f"  Usage: {budget_result['usage_percent']}%")
    print(f"  {status_icons[budget_result['status']]} Status: {budget_result['status']}")
    
    # Prune simulation
    print("\n✂️  PRUNE SIMULATION:")
    print("-" * 40)
    
    print(f"  Original: {prune_result['original_tokens']} tokens")
    print(f"  After prune: {prune_result['pruned_tokens']} tokens")
    print(f"  Reduction: {prune_result['reduction_percent']}%")
    print(f"  Keys preserved: {', '.join(prune_result['keys_preserved'])}")
    
    # Overall status
    print("\n" + "=" * 60)
    
    all_valid = (
        files_result["valid"] and
        structure_result.get("valid", False) and
        env_result["enabled"] and
        budget_result["can_proceed"]
    )
    
    if all_valid:
        print("✅ RLM VALIDATION PASSED")
    else:
        print("❌ RLM VALIDATION FAILED")
        if not files_result["valid"]:
            print("   → Create missing RLM files")
        if not structure_result.get("valid", False):
            print("   → Add missing functions to p_variable.py")
        if not env_result["enabled"]:
            print("   → Set RLM_ENABLED=true in .env")
    
    print("=" * 60 + "\n")
    
    return all_valid

if __name__ == "__main__":
    # Run all validations
    files_result = check_rlm_files()
    structure_result = check_p_variable_structure()
    snapshots_result = check_snapshots_directory()
    env_result = check_env_variables()
    budget_result = simulate_budget_check()
    prune_result = simulate_context_prune(budget_result.get("test_context", {}))
    
    success = print_report(
        files_result,
        structure_result,
        snapshots_result,
        env_result,
        budget_result,
        prune_result
    )
    
    sys.exit(0 if success else 1)

Make executable: chmod +x scripts/validate_rlm.py

Show me the created file.
```

### 4.2 Create P Variable Module

**Copy to Claude Code:**
```
Create file: orchestrator/p_variable.py

#!/usr/bin/env python3
"""
WAVE v2 P Variable (Persistent Variable) Module
Manages context across agent interactions to prevent context rot
"""

import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

# Configuration
BUDGET_LIMIT = int(os.getenv("RLM_BUDGET_LIMIT", "100000"))
WARNING_THRESHOLD = float(os.getenv("RLM_WARNING_THRESHOLD", "0.8"))
PRUNE_THRESHOLD = float(os.getenv("RLM_PRUNE_THRESHOLD", "0.9"))
SNAPSHOT_DIR = Path(os.getenv("RLM_SNAPSHOT_DIR", ".claude/snapshots"))

# Essential keys to preserve during pruning
ESSENTIAL_KEYS = [
    "wave_state",
    "agent_memory",
    "current_gate",
    "story_id",
    "domain",
    "acceptance_criteria",
    "safety_state"
]

@dataclass
class BudgetStatus:
    token_count: int
    budget_limit: int
    usage_percent: float
    status: str  # 'safe' | 'warning' | 'halt'
    can_proceed: bool

class RLMBudgetTracker:
    """Track token usage across the session"""
    
    def __init__(self, limit_per_minute: int = 100000):
        self.limit = limit_per_minute
        self.usage_history: List[Dict] = []
        self.total_tokens = 0
        self.session_start = datetime.now()
    
    def add_usage(self, tokens: int, source: str = "unknown"):
        """Record token usage"""
        self.usage_history.append({
            "timestamp": datetime.now().isoformat(),
            "tokens": tokens,
            "source": source
        })
        self.total_tokens += tokens
    
    def get_current_usage(self) -> int:
        """Get total tokens used in session"""
        return self.total_tokens
    
    def can_proceed(self, estimated_tokens: int) -> bool:
        """Check if we can proceed with estimated token usage"""
        return (self.total_tokens + estimated_tokens) < self.limit
    
    def get_status(self) -> BudgetStatus:
        """Get current budget status"""
        usage_percent = self.total_tokens / self.limit
        
        if usage_percent > 1.0:
            status = "halt"
        elif usage_percent > WARNING_THRESHOLD:
            status = "warning"
        else:
            status = "safe"
        
        return BudgetStatus(
            token_count=self.total_tokens,
            budget_limit=self.limit,
            usage_percent=round(usage_percent * 100, 2),
            status=status,
            can_proceed=status != "halt"
        )
    
    def reset(self):
        """Reset usage tracking"""
        self.usage_history = []
        self.total_tokens = 0
        self.session_start = datetime.now()

# Global tracker instance
_budget_tracker: Optional[RLMBudgetTracker] = None

def get_budget_tracker() -> RLMBudgetTracker:
    """Get or create the global budget tracker"""
    global _budget_tracker
    if _budget_tracker is None:
        _budget_tracker = RLMBudgetTracker(BUDGET_LIMIT)
    return _budget_tracker

def estimate_token_count(obj: Any) -> int:
    """
    Estimate tokens for any object
    Approximation: ~4 characters per token
    """
    try:
        json_str = json.dumps(obj, default=str)
        return len(json_str) // 4
    except:
        return len(str(obj)) // 4

def check_rlm_budget(p_variable: Dict) -> str:
    """
    Check if P Variable is within budget
    Returns: 'safe' | 'warning' | 'halt'
    """
    token_count = estimate_token_count(p_variable)
    tracker = get_budget_tracker()
    
    # Add current context to usage
    tracker.add_usage(token_count, "p_variable_check")
    
    status = tracker.get_status()
    
    if status.status == "halt":
        print(f"⛔ RLM BUDGET EXCEEDED: {status.usage_percent}%")
    elif status.status == "warning":
        print(f"⚠️  RLM Budget Warning: {status.usage_percent}%")
    
    return status.status

def prune_p_variable(p: Dict, aggressive: bool = False) -> Dict:
    """
    Prune P Variable to essential keys only
    Returns pruned context with 30%+ reduction
    """
    original_tokens = estimate_token_count(p)
    
    # Always preserve essential keys
    pruned = {}
    for key in ESSENTIAL_KEYS:
        if key in p:
            pruned[key] = p[key]
    
    if aggressive:
        # Further prune agent_memory to just latest entries
        if "agent_memory" in pruned:
            for agent, memory in pruned["agent_memory"].items():
                if isinstance(memory, dict):
                    for mem_key, mem_val in memory.items():
                        if isinstance(mem_val, list) and len(mem_val) > 5:
                            memory[mem_key] = mem_val[-5:]  # Keep last 5
    
    pruned_tokens = estimate_token_count(pruned)
    reduction = ((original_tokens - pruned_tokens) / original_tokens) * 100 if original_tokens > 0 else 0
    
    print(f"✂️  Context pruned: {original_tokens} → {pruned_tokens} tokens ({reduction:.1f}% reduction)")
    
    # Add metadata
    pruned["_pruned_at"] = datetime.now().isoformat()
    pruned["_original_tokens"] = original_tokens
    pruned["_pruned_tokens"] = pruned_tokens
    
    return pruned

def save_snapshot(p_variable: Dict, story_id: str, gate: int) -> str:
    """
    Save a snapshot of the P Variable
    Returns snapshot filename
    """
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{story_id}_gate{gate}_{timestamp}.json"
    filepath = SNAPSHOT_DIR / filename
    
    snapshot = {
        "timestamp": datetime.now().isoformat(),
        "story_id": story_id,
        "gate": gate,
        "token_count": estimate_token_count(p_variable),
        "p_variable": p_variable
    }
    
    with open(filepath, 'w') as f:
        json.dump(snapshot, f, indent=2, default=str)
    
    print(f"📸 Snapshot saved: {filename}")
    
    return str(filepath)

def load_snapshot(filepath: str) -> Dict:
    """Load a snapshot from file"""
    
    with open(filepath, 'r') as f:
        snapshot = json.load(f)
    
    return snapshot.get("p_variable", {})

def list_snapshots(story_id: str = None) -> List[Dict]:
    """List available snapshots"""
    
    if not SNAPSHOT_DIR.exists():
        return []
    
    snapshots = []
    pattern = f"{story_id}_*.json" if story_id else "*.json"
    
    for filepath in sorted(SNAPSHOT_DIR.glob(pattern)):
        try:
            with open(filepath) as f:
                data = json.load(f)
                snapshots.append({
                    "filename": filepath.name,
                    "filepath": str(filepath),
                    "timestamp": data.get("timestamp"),
                    "story_id": data.get("story_id"),
                    "gate": data.get("gate"),
                    "token_count": data.get("token_count")
                })
        except:
            pass
    
    return snapshots

def create_initial_p_variable(story: Dict, domain: str) -> Dict:
    """Create initial P Variable for a story"""
    
    return {
        "wave_state": {
            "current_wave": story.get("wave_number", 1),
            "current_story": story.get("story_id"),
            "current_gate": 0,
            "status": "initialized",
            "started_at": datetime.now().isoformat()
        },
        "story_id": story.get("story_id"),
        "domain": domain,
        "acceptance_criteria": story.get("acceptance_criteria", []),
        "agent_memory": {
            "cto": {"decisions": [], "validations": []},
            "pm": {"assignments": [], "status_updates": []},
            "fe_dev_1": {"files_created": [], "components": []},
            "fe_dev_2": {"files_created": [], "components": []},
            "be_dev_1": {"files_created": [], "endpoints": []},
            "be_dev_2": {"files_created": [], "endpoints": []},
            "qa": {"tests_written": [], "coverage": 0, "results": []}
        },
        "safety_state": {
            "score": 1.0,
            "violations": [],
            "last_check": None
        },
        "files": {
            "created": [],
            "modified": [],
            "deleted": []
        },
        "_created_at": datetime.now().isoformat(),
        "_version": "1.0"
    }

def update_p_variable(p: Dict, updates: Dict) -> Dict:
    """
    Update P Variable with new data
    Handles nested updates and triggers pruning if needed
    """
    
    def deep_update(base: Dict, updates: Dict) -> Dict:
        for key, value in updates.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                deep_update(base[key], value)
            else:
                base[key] = value
        return base
    
    p = deep_update(p, updates)
    p["_updated_at"] = datetime.now().isoformat()
    
    # Check if pruning needed
    status = check_rlm_budget(p)
    if status == "warning":
        p = prune_p_variable(p, aggressive=False)
    elif status == "halt":
        p = prune_p_variable(p, aggressive=True)
    
    return p

# Utility function for agents
def get_agent_context(p_variable: Dict, agent: str) -> Dict:
    """Extract relevant context for a specific agent"""
    
    return {
        "story_id": p_variable.get("story_id"),
        "domain": p_variable.get("domain"),
        "current_gate": p_variable.get("wave_state", {}).get("current_gate"),
        "acceptance_criteria": p_variable.get("acceptance_criteria", []),
        "my_memory": p_variable.get("agent_memory", {}).get(agent, {}),
        "files": p_variable.get("files", {}),
        "safety_score": p_variable.get("safety_state", {}).get("score", 1.0)
    }

Show me the created file.
```

### 4.3 Create RLM Auditor Script

**Copy to Claude Code:**
```
Create file: scripts/rlm_auditor.py

#!/usr/bin/env python3
"""
WAVE v2 RLM Real-Time Auditor
Monitors context usage and alerts when thresholds are reached
"""

import os
import sys
import time
import json
import argparse
from datetime import datetime
from pathlib import Path

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from orchestrator.p_variable import (
        estimate_token_count,
        get_budget_tracker,
        list_snapshots,
        BUDGET_LIMIT,
        WARNING_THRESHOLD
    )
except ImportError:
    # Fallback definitions
    BUDGET_LIMIT = 100000
    WARNING_THRESHOLD = 0.8
    
    def estimate_token_count(obj):
        return len(json.dumps(obj, default=str)) // 4

class RLMAuditor:
    """Real-time RLM usage monitor"""
    
    def __init__(self, project_path: str, interval: int = 30):
        self.project_path = Path(project_path)
        self.interval = interval
        self.alert_history = []
        self.slack_webhook = os.getenv("SLACK_WEBHOOK_URL")
    
    def get_current_context_size(self) -> dict:
        """Estimate current context size from various sources"""
        
        total_tokens = 0
        breakdown = {}
        
        # Check P Variable snapshots
        snapshots_dir = self.project_path / ".claude" / "snapshots"
        if snapshots_dir.exists():
            snapshots = list(snapshots_dir.glob("*.json"))
            if snapshots:
                latest = max(snapshots, key=lambda p: p.stat().st_mtime)
                with open(latest) as f:
                    data = json.load(f)
                    breakdown["p_variable"] = data.get("token_count", 0)
                    total_tokens += breakdown["p_variable"]
        
        # Check agent memory files
        memory_dir = self.project_path / ".claude" / "memory"
        if memory_dir.exists():
            for mem_file in memory_dir.glob("*.json"):
                with open(mem_file) as f:
                    data = json.load(f)
                    tokens = estimate_token_count(data)
                    breakdown[f"memory:{mem_file.stem}"] = tokens
                    total_tokens += tokens
        
        # Check signal files
        signals_dir = self.project_path / ".claude" / "signals"
        if signals_dir.exists():
            for sig_file in signals_dir.glob("*.json"):
                with open(sig_file) as f:
                    data = json.load(f)
                    tokens = estimate_token_count(data)
                    breakdown[f"signal:{sig_file.stem}"] = tokens
                    total_tokens += tokens
        
        return {
            "total_tokens": total_tokens,
            "budget_limit": BUDGET_LIMIT,
            "usage_percent": round((total_tokens / BUDGET_LIMIT) * 100, 2),
            "breakdown": breakdown
        }
    
    def check_thresholds(self, usage: dict) -> str:
        """Check if thresholds are exceeded"""
        
        percent = usage["usage_percent"]
        
        if percent >= 100:
            return "HALT"
        elif percent >= WARNING_THRESHOLD * 100:
            return "WARNING"
        elif percent >= 60:
            return "ELEVATED"
        else:
            return "SAFE"
    
    def send_alert(self, status: str, usage: dict):
        """Send alert via Slack"""
        
        if not self.slack_webhook:
            return
        
        import httpx
        
        colors = {
            "HALT": "#F44336",
            "WARNING": "#FF9800",
            "ELEVATED": "#2196F3",
            "SAFE": "#4CAF50"
        }
        
        payload = {
            "attachments": [{
                "color": colors.get(status, "#607D8B"),
                "title": f"🧠 RLM Alert: {status}",
                "fields": [
                    {"title": "Usage", "value": f"{usage['usage_percent']}%", "short": True},
                    {"title": "Tokens", "value": f"{usage['total_tokens']:,}", "short": True},
                    {"title": "Limit", "value": f"{usage['budget_limit']:,}", "short": True}
                ],
                "footer": "WAVE RLM Auditor",
                "ts": int(datetime.now().timestamp())
            }]
        }
        
        try:
            httpx.post(self.slack_webhook, json=payload, timeout=5)
        except:
            pass
    
    def print_status(self, usage: dict, status: str):
        """Print current status to console"""
        
        icons = {
            "HALT": "🛑",
            "WARNING": "⚠️",
            "ELEVATED": "📊",
            "SAFE": "✅"
        }
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        icon = icons.get(status, "❓")
        
        print(f"[{timestamp}] {icon} {status}: {usage['usage_percent']}% ({usage['total_tokens']:,}/{usage['budget_limit']:,} tokens)")
        
        if usage["breakdown"]:
            for source, tokens in sorted(usage["breakdown"].items(), key=lambda x: -x[1])[:5]:
                print(f"           └─ {source}: {tokens:,} tokens")
    
    def run(self, continuous: bool = True):
        """Run the auditor"""
        
        print("\n" + "=" * 50)
        print("WAVE RLM AUDITOR")
        print(f"Monitoring: {self.project_path}")
        print(f"Interval: {self.interval}s")
        print(f"Budget: {BUDGET_LIMIT:,} tokens")
        print(f"Warning at: {WARNING_THRESHOLD * 100}%")
        print("=" * 50 + "\n")
        
        last_status = None
        
        while True:
            try:
                usage = self.get_current_context_size()
                status = self.check_thresholds(usage)
                
                self.print_status(usage, status)
                
                # Send alert on status change (warning or higher)
                if status != last_status and status in ["WARNING", "HALT"]:
                    self.send_alert(status, usage)
                    self.alert_history.append({
                        "timestamp": datetime.now().isoformat(),
                        "status": status,
                        "usage": usage
                    })
                
                last_status = status
                
                if not continuous:
                    return usage, status
                
                time.sleep(self.interval)
                
            except KeyboardInterrupt:
                print("\n\nAuditor stopped.")
                break
            except Exception as e:
                print(f"Error: {e}")
                if not continuous:
                    raise
                time.sleep(self.interval)

def main():
    parser = argparse.ArgumentParser(description="WAVE RLM Auditor")
    parser.add_argument("--project", default=".", help="Project path")
    parser.add_argument("--interval", type=int, default=30, help="Check interval in seconds")
    parser.add_argument("--once", action="store_true", help="Run once and exit")
    parser.add_argument("--slack-alerts", action="store_true", help="Enable Slack alerts")
    args = parser.parse_args()
    
    auditor = RLMAuditor(args.project, args.interval)
    
    if args.once:
        usage, status = auditor.run(continuous=False)
        sys.exit(0 if status in ["SAFE", "ELEVATED"] else 1)
    else:
        auditor.run(continuous=True)

if __name__ == "__main__":
    main()

Make executable: chmod +x scripts/rlm_auditor.py

Show me the created file.
```

### 4.4 Add RLM Environment Variables to .env

**Copy to Claude Code:**
```
Add these RLM configuration variables to your .env file:

# RLM (Context Management) Configuration
RLM_ENABLED=true
RLM_BUDGET_LIMIT=100000
RLM_WARNING_THRESHOLD=0.8
RLM_PRUNE_THRESHOLD=0.9
RLM_SNAPSHOT_INTERVAL=10
RLM_SNAPSHOT_DIR=.claude/snapshots

Verify the variables are added:

grep "RLM_" .env

Report the result.
```

### 4.5 Create Snapshots Directory

**Copy to Claude Code:**
```
Create the RLM snapshots directory structure:

mkdir -p .claude/snapshots
mkdir -p .claude/memory
mkdir -p .claude/signals

echo '{"initialized": true, "timestamp": "'$(date -Iseconds)'"}' > .claude/snapshots/.gitkeep.json

Verify structure:

ls -la .claude/

Expected:
.claude/
├── CLAUDE.md (if exists)
├── snapshots/
│   └── .gitkeep.json
├── memory/
└── signals/

Report the result.
```

### 4.6 Run RLM Validation

**Copy to Claude Code:**
```
Validate RLM configuration:

python scripts/validate_rlm.py

Expected output:
============================================================
WAVE RLM (CONTEXT MANAGEMENT) VALIDATION
============================================================

📁 RLM FILES:
----------------------------------------
  ✅ p_variable: orchestrator/p_variable.py
  ✅ rlm_auditor: scripts/rlm_auditor.py
  ✅ snapshots_dir: .claude/snapshots

🔧 P_VARIABLE STRUCTURE:
----------------------------------------
  Functions:
    ✅ check_rlm_budget()
    ✅ prune_p_variable()
    ✅ estimate_token_count()
    ✅ save_snapshot()
    ✅ load_snapshot()
  Classes:
    ✅ RLMBudgetTracker

📸 SNAPSHOTS:
----------------------------------------
  ✅ Directory exists

🌍 ENVIRONMENT:
----------------------------------------
  ✅ RLM Enabled: True
  Budget Limit: 100000 tokens
  Warning Threshold: 80.0%
  Prune Threshold: 90.0%

💰 BUDGET SIMULATION:
----------------------------------------
  Test context tokens: ~500
  Budget limit: 100000
  Usage: 0.5%
  ✅ Status: SAFE

✂️  PRUNE SIMULATION:
----------------------------------------
  Original: ~500 tokens
  After prune: ~300 tokens
  Reduction: 40.0%

============================================================
✅ RLM VALIDATION PASSED
============================================================

Report the result.
```

### 4.7 Test RLM Auditor (Quick Check)

**Copy to Claude Code:**
```
Run RLM auditor once to verify it works:

python scripts/rlm_auditor.py --project . --once

Expected output:
==================================================
WAVE RLM AUDITOR
Monitoring: .
Interval: 30s
Budget: 100,000 tokens
Warning at: 80.0%
==================================================

[HH:MM:SS] ✅ SAFE: X.X% (XXX/100,000 tokens)

Report the result.
```

### 4.8 RLM Quick Reference

**How RLM Prevents Context Rot:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    RLM CONTEXT LIFECYCLE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. INITIALIZE                                                   │
│     └─ create_initial_p_variable(story, domain)                 │
│        Creates clean context with essential keys                 │
│                                                                  │
│  2. UPDATE (Each Agent Action)                                   │
│     └─ update_p_variable(p, updates)                            │
│        Merges new data, auto-checks budget                       │
│                                                                  │
│  3. MONITOR (Continuous)                                         │
│     └─ rlm_auditor.py --interval 30                             │
│        Watches usage, alerts at 80%                              │
│                                                                  │
│  4. PRUNE (When Warning)                                         │
│     └─ prune_p_variable(p, aggressive=False)                    │
│        Removes non-essential keys, 30%+ reduction                │
│                                                                  │
│  5. SNAPSHOT (Every N Operations)                                │
│     └─ save_snapshot(p, story_id, gate)                         │
│        Saves state for recovery                                  │
│                                                                  │
│  6. RECOVER (If Needed)                                          │
│     └─ load_snapshot(filepath)                                  │
│        Restores from known good state                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Budget Thresholds:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  0-60%   │ ✅ SAFE      │ Normal operation
 60-80%   │ 📊 ELEVATED  │ Monitor closely
 80-90%   │ ⚠️ WARNING   │ Auto-prune triggered, Slack alert
 90-100%  │ ⛔ CRITICAL  │ Aggressive prune
  >100%   │ 🛑 HALT      │ Stop execution, manual intervention
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## STEP 5: Docker Images

### 5.1 Create Base Dockerfile for Agents

**Copy to Claude Code:**
```
Create file: docker/Dockerfile.agent

FROM node:20-slim

# Install Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Install Python for scripts
RUN apt-get update && apt-get install -y python3 python3-pip git curl jq && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files (mounted at runtime)
# COPY . .

# CRITICAL: Enable autonomous execution
ENTRYPOINT ["claude", "--dangerously-skip-permissions"]

Show me the created file.
```

### 5.2 Create docker-compose.yml

**Copy to Claude Code:**
```
Create file: docker-compose.yml

version: '3.8'

services:
  # ===================
  # INFRASTRUCTURE
  # ===================
  redis:
    image: redis:7-alpine
    container_name: wave-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

  dozzle:
    image: amir20/dozzle:latest
    container_name: wave-dozzle
    ports:
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - DOZZLE_LEVEL=info
      - DOZZLE_TAILSIZE=300

  # ===================
  # ORCHESTRATOR
  # ===================
  orchestrator:
    build:
      context: .
      dockerfile: docker/Dockerfile.orchestrator
    container_name: wave-orchestrator
    env_file: .env
    volumes:
      - .:/app
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      redis:
        condition: service_healthy
    ports:
      - "8000:8000"

  # ===================
  # DOMAIN AGENTS (Template - spawn per domain)
  # ===================
  agent-auth:
    build:
      context: .
      dockerfile: docker/Dockerfile.agent
    container_name: wave-agent-auth
    env_file: .env
    volumes:
      - .:/app
      - ./worktrees/auth:/worktree
    working_dir: /worktree
    depends_on:
      - redis
      - orchestrator
    profiles:
      - auth

  agent-orders:
    build:
      context: .
      dockerfile: docker/Dockerfile.agent
    container_name: wave-agent-orders
    env_file: .env
    volumes:
      - .:/app
      - ./worktrees/orders:/worktree
    working_dir: /worktree
    depends_on:
      - redis
      - orchestrator
    profiles:
      - orders

  agent-payments:
    build:
      context: .
      dockerfile: docker/Dockerfile.agent
    container_name: wave-agent-payments
    env_file: .env
    volumes:
      - .:/app
      - ./worktrees/payments:/worktree
    working_dir: /worktree
    depends_on:
      - redis
      - orchestrator
    profiles:
      - payments

Show me the created file.
```

### 5.3 Create Orchestrator Dockerfile

**Copy to Claude Code:**
```
Create file: docker/Dockerfile.orchestrator

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN pip install \
    anthropic \
    langsmith \
    langchain \
    redis \
    fastapi \
    uvicorn \
    httpx \
    python-dotenv

# Copy orchestrator code
COPY orchestrator/ /app/orchestrator/
COPY scripts/ /app/scripts/

# Health check endpoint
EXPOSE 8000

CMD ["uvicorn", "orchestrator.main:app", "--host", "0.0.0.0", "--port", "8000"]

Show me the created file.
```

### 5.4 Build Docker Images

**Copy to Claude Code:**
```
Build all Docker images:

docker-compose build

Then verify images exist:

docker images | grep wave

Expected output should show:
- wave-footprint-orchestrator
- wave-footprint-agent-auth
- wave-footprint-agent-orders
- wave-footprint-agent-payments

Report the results.
```

---

## STEP 6: Start Infrastructure

### 6.1 Start Core Services

**Copy to Claude Code:**
```
Start Redis and Dozzle:

docker-compose up -d redis dozzle

Verify they're running:

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Expected:
- wave-redis: Up, healthy
- wave-dozzle: Up, port 8080

Report status.
```

### 6.2 Verify Dozzle Access

**Copy to Claude Code:**
```
Test Dozzle is accessible:

curl -s -o /dev/null -w "%{http_code}" http://localhost:8080

Expected: 200

If 200, Dozzle is ready at http://localhost:8080
Report the result.
```

### 6.3 Verify Redis Connection

**Copy to Claude Code:**
```
Test Redis connection:

docker exec wave-redis redis-cli ping

Expected: PONG

Then test pub/sub:

docker exec wave-redis redis-cli PUBLISH wave-test "hello"

Expected: (integer) 0 or 1

Report results.
```

---

## STEP 7: LangSmith Connection

### 7.1 Create LangSmith Test Script

**Copy to Claude Code:**
```
Create file: scripts/test_langsmith.py

import os
from dotenv import load_dotenv

load_dotenv()

def test_langsmith():
    """Verify LangSmith connection"""
    from langsmith import Client
    
    api_key = os.getenv("LANGSMITH_API_KEY")
    project = os.getenv("LANGSMITH_PROJECT")
    
    if not api_key:
        print("❌ LANGSMITH_API_KEY not set")
        return False
    
    if not project:
        print("❌ LANGSMITH_PROJECT not set")
        return False
    
    try:
        client = Client()
        # Try to list projects to verify connection
        projects = list(client.list_projects(limit=1))
        print(f"✅ LangSmith connected")
        print(f"   API Key: {api_key[:10]}...")
        print(f"   Project: {project}")
        print(f"   Connection: OK")
        return True
    except Exception as e:
        print(f"❌ LangSmith connection failed: {e}")
        return False

if __name__ == "__main__":
    test_langsmith()

Show me the created file.
```

### 7.2 Run LangSmith Test

**Copy to Claude Code:**
```
Install langsmith and test connection:

pip install langsmith python-dotenv

python scripts/test_langsmith.py

Expected output:
✅ LangSmith connected
   API Key: ls-...
   Project: wave-footprint
   Connection: OK

Report the result.
```

### 7.3 Create LangSmith Tracing Wrapper

**Copy to Claude Code:**
```
Create file: orchestrator/tracing.py

import os
from functools import wraps
from langsmith import traceable
from langsmith.run_trees import RunTree

TRACING_ENABLED = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"

def trace_agent_run(agent_name: str, story_id: str):
    """Decorator to trace agent runs in LangSmith"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not TRACING_ENABLED:
                return func(*args, **kwargs)
            
            with RunTree(
                name=f"{agent_name}:{story_id}",
                run_type="chain",
                inputs={"args": str(args), "kwargs": str(kwargs)}
            ) as rt:
                try:
                    result = func(*args, **kwargs)
                    rt.end(outputs={"result": str(result)})
                    return result
                except Exception as e:
                    rt.end(error=str(e))
                    raise
        return wrapper
    return decorator

def log_trace(message: str, metadata: dict = None):
    """Log a trace event to LangSmith"""
    if not TRACING_ENABLED:
        return
    
    from langsmith import Client
    client = Client()
    # Log as feedback or custom event
    print(f"[TRACE] {message} | {metadata}")

Show me the created file.
```

---

## STEP 8: Slack Notifications

### 8.1 Create Slack Notification Module

**Copy to Claude Code:**
```
Create file: orchestrator/notifications.py

import os
import json
import httpx
from datetime import datetime
from typing import Literal

SLACK_WEBHOOK = os.getenv("SLACK_WEBHOOK_URL")
SLACK_CHANNEL = os.getenv("SLACK_CHANNEL", "#wave-alerts")

MessageType = Literal[
    "story_started",
    "story_completed", 
    "gate_passed",
    "gate_failed",
    "safety_violation",
    "budget_warning",
    "budget_exceeded",
    "emergency_stop",
    "agent_error",
    "merge_ready",
    "deploy_complete"
]

EMOJI_MAP = {
    "story_started": "🚀",
    "story_completed": "✅",
    "gate_passed": "✓",
    "gate_failed": "❌",
    "safety_violation": "🚨",
    "budget_warning": "⚠️",
    "budget_exceeded": "💰",
    "emergency_stop": "🛑",
    "agent_error": "💥",
    "merge_ready": "🔀",
    "deploy_complete": "🎉"
}

COLOR_MAP = {
    "story_started": "#2196F3",    # Blue
    "story_completed": "#4CAF50",  # Green
    "gate_passed": "#8BC34A",      # Light Green
    "gate_failed": "#F44336",      # Red
    "safety_violation": "#9C27B0", # Purple
    "budget_warning": "#FF9800",   # Orange
    "budget_exceeded": "#F44336",  # Red
    "emergency_stop": "#F44336",   # Red
    "agent_error": "#FF5722",      # Deep Orange
    "merge_ready": "#00BCD4",      # Cyan
    "deploy_complete": "#4CAF50"   # Green
}

async def send_slack_notification(
    message_type: MessageType,
    title: str,
    details: dict,
    story_id: str = None,
    agent: str = None
):
    """Send formatted notification to Slack"""
    
    if not SLACK_WEBHOOK:
        print(f"[SLACK] Webhook not configured, skipping: {title}")
        return False
    
    emoji = EMOJI_MAP.get(message_type, "📢")
    color = COLOR_MAP.get(message_type, "#607D8B")
    
    # Build fields from details
    fields = []
    for key, value in details.items():
        fields.append({
            "title": key.replace("_", " ").title(),
            "value": str(value),
            "short": len(str(value)) < 30
        })
    
    # Add metadata fields
    if story_id:
        fields.append({"title": "Story", "value": story_id, "short": True})
    if agent:
        fields.append({"title": "Agent", "value": agent, "short": True})
    
    payload = {
        "channel": SLACK_CHANNEL,
        "username": "WAVE Bot",
        "icon_emoji": ":ocean:",
        "attachments": [
            {
                "color": color,
                "title": f"{emoji} {title}",
                "fields": fields,
                "footer": "WAVE v2 Orchestrator",
                "ts": int(datetime.now().timestamp())
            }
        ]
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(SLACK_WEBHOOK, json=payload)
            return response.status_code == 200
    except Exception as e:
        print(f"[SLACK] Error sending notification: {e}")
        return False

# Convenience functions
async def notify_story_started(story_id: str, domain: str, agents: list):
    await send_slack_notification(
        "story_started",
        f"Story Started: {story_id}",
        {"Domain": domain, "Agents": ", ".join(agents)},
        story_id=story_id
    )

async def notify_story_completed(story_id: str, duration: str, coverage: float):
    await send_slack_notification(
        "story_completed",
        f"Story Completed: {story_id}",
        {"Duration": duration, "Coverage": f"{coverage}%"},
        story_id=story_id
    )

async def notify_gate_passed(story_id: str, gate: int, gate_name: str):
    await send_slack_notification(
        "gate_passed",
        f"Gate {gate} Passed: {gate_name}",
        {"Status": "PASSED"},
        story_id=story_id
    )

async def notify_gate_failed(story_id: str, gate: int, gate_name: str, reason: str):
    await send_slack_notification(
        "gate_failed",
        f"Gate {gate} Failed: {gate_name}",
        {"Reason": reason},
        story_id=story_id
    )

async def notify_safety_violation(story_id: str, violation: str, file: str, line: int):
    await send_slack_notification(
        "safety_violation",
        "Safety Violation Detected",
        {"Violation": violation, "File": file, "Line": line},
        story_id=story_id
    )

async def notify_emergency_stop(reason: str, triggered_by: str):
    await send_slack_notification(
        "emergency_stop",
        "🛑 EMERGENCY STOP ACTIVATED",
        {"Reason": reason, "Triggered By": triggered_by}
    )

Show me the created file.
```

### 8.2 Create Slack Test Script

**Copy to Claude Code:**
```
Create file: scripts/test_slack.py

import os
import asyncio
from dotenv import load_dotenv

load_dotenv()

# Add parent to path for imports
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from orchestrator.notifications import send_slack_notification

async def test_slack():
    """Send test notification to Slack"""
    
    webhook = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook:
        print("❌ SLACK_WEBHOOK_URL not set")
        return False
    
    print(f"Testing Slack webhook: {webhook[:50]}...")
    
    result = await send_slack_notification(
        message_type="story_started",
        title="WAVE Test Notification",
        details={
            "Status": "Testing Slack Integration",
            "Project": "Footprint",
            "Environment": "Development"
        },
        story_id="TEST-001"
    )
    
    if result:
        print("✅ Slack notification sent successfully!")
        print("   Check your Slack channel for the message.")
    else:
        print("❌ Failed to send Slack notification")
    
    return result

if __name__ == "__main__":
    asyncio.run(test_slack())

Show me the created file.
```

### 8.3 Test Slack Notification

**Copy to Claude Code:**
```
Test Slack integration:

pip install httpx

python scripts/test_slack.py

Expected:
✅ Slack notification sent successfully!
   Check your Slack channel for the message.

Verify the message appears in your Slack channel.
Report the result.
```

---

## STEP 9: Container Health & Cleanup

### 9.1 Create Container Validator

**Copy to Claude Code:**
```
Create file: scripts/container_validator.py

import subprocess
import json
import sys

REQUIRED_CONTAINERS = {
    "CRITICAL": ["wave-redis", "wave-orchestrator"],
    "REQUIRED": ["wave-dozzle"],
    "OPTIONAL": []
}

def get_container_status(name: str) -> dict:
    """Get status of a container"""
    try:
        result = subprocess.run(
            ["docker", "inspect", name],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            return {"name": name, "exists": False, "running": False, "healthy": False}
        
        data = json.loads(result.stdout)[0]
        state = data.get("State", {})
        
        return {
            "name": name,
            "exists": True,
            "running": state.get("Running", False),
            "healthy": state.get("Health", {}).get("Status") == "healthy" if "Health" in state else state.get("Running", False),
            "status": state.get("Status", "unknown")
        }
    except Exception as e:
        return {"name": name, "exists": False, "running": False, "healthy": False, "error": str(e)}

def validate_all() -> dict:
    """Validate all required containers"""
    results = {
        "CRITICAL": [],
        "REQUIRED": [],
        "OPTIONAL": [],
        "overall": "GO"
    }
    
    for tier, containers in REQUIRED_CONTAINERS.items():
        for container in containers:
            status = get_container_status(container)
            results[tier].append(status)
            
            if tier == "CRITICAL" and not status["healthy"]:
                results["overall"] = "NO-GO"
            elif tier == "REQUIRED" and not status["running"]:
                results["overall"] = "WARNING"
    
    return results

def print_report(results: dict):
    """Print formatted validation report"""
    print("\n" + "=" * 50)
    print("WAVE CONTAINER VALIDATION REPORT")
    print("=" * 50)
    
    for tier in ["CRITICAL", "REQUIRED", "OPTIONAL"]:
        if not results[tier]:
            continue
        print(f"\n{tier}:")
        for container in results[tier]:
            status_icon = "✅" if container["healthy"] else "❌"
            print(f"  {status_icon} {container['name']}: {container.get('status', 'not found')}")
    
    print("\n" + "-" * 50)
    overall = results["overall"]
    icon = "✅" if overall == "GO" else "⚠️" if overall == "WARNING" else "❌"
    print(f"OVERALL STATUS: {icon} {overall}")
    print("=" * 50 + "\n")
    
    return results["overall"] == "GO"

if __name__ == "__main__":
    results = validate_all()
    success = print_report(results)
    sys.exit(0 if success else 1)

Show me the created file.
```

### 9.2 Create Cleanup Script

**Copy to Claude Code:**
```
Create file: scripts/cleanup_containers.py

import subprocess
import sys

def cleanup_wave_containers(force: bool = False):
    """Stop and remove all WAVE containers"""
    
    print("🧹 Cleaning up WAVE containers...")
    
    # Get all wave containers
    result = subprocess.run(
        ["docker", "ps", "-a", "--filter", "name=wave-", "--format", "{{.Names}}"],
        capture_output=True,
        text=True
    )
    
    containers = result.stdout.strip().split("\n")
    containers = [c for c in containers if c]  # Remove empty strings
    
    if not containers:
        print("No WAVE containers found.")
        return
    
    print(f"Found {len(containers)} containers: {', '.join(containers)}")
    
    if not force:
        confirm = input("Stop and remove these containers? [y/N]: ")
        if confirm.lower() != 'y':
            print("Cancelled.")
            return
    
    # Stop containers
    print("Stopping containers...")
    subprocess.run(["docker", "stop"] + containers, capture_output=True)
    
    # Remove containers
    print("Removing containers...")
    subprocess.run(["docker", "rm"] + containers, capture_output=True)
    
    # Remove volumes (optional)
    print("Removing orphan volumes...")
    subprocess.run(["docker", "volume", "prune", "-f"], capture_output=True)
    
    print("✅ Cleanup complete!")

if __name__ == "__main__":
    force = "--force" in sys.argv or "-f" in sys.argv
    cleanup_wave_containers(force=force)

Show me the created file.
```

### 9.3 Run Container Validation

**Copy to Claude Code:**
```
Validate all containers are ready:

python scripts/container_validator.py

Expected output:
==================================================
WAVE CONTAINER VALIDATION REPORT
==================================================

CRITICAL:
  ✅ wave-redis: running
  ✅ wave-orchestrator: running

REQUIRED:
  ✅ wave-dozzle: running

--------------------------------------------------
OVERALL STATUS: ✅ GO
==================================================

If any show ❌, we need to fix before proceeding.
Report the result.
```

---

## STEP 10: Pre-Flight Lock

### 10.1 Create Pre-Flight Lock Script

**Copy to Claude Code:**
```
Create file: scripts/preflight_lock.py

#!/usr/bin/env python3
"""
WAVE v2 Pre-Flight Lock System
Ensures architecture compliance before agent dispatch
"""

import os
import json
import hashlib
import sys
from datetime import datetime
from pathlib import Path

LOCK_FILE = ".claude/PREFLIGHT.lock"
VERSION = "1.5.0"

# Files to hash for drift detection
CRITICAL_FILES = [
    ".claude/CLAUDE.md",
    "ai-prd/AI-PRD.md",
    "docker-compose.yml",
    "orchestrator/notifications.py",
    "orchestrator/tracing.py",
]

# Patterns that must exist
REQUIRED_PATTERNS = [
    "ai-prd/stories/WAVE*.json",
    ".env",
]

def compute_hash(filepath: str) -> str:
    """Compute SHA256 hash of a file"""
    if not os.path.exists(filepath):
        return "FILE_NOT_FOUND"
    
    with open(filepath, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()[:12]

def validate_files() -> tuple[bool, list]:
    """Validate all critical files exist and are valid"""
    errors = []
    
    for filepath in CRITICAL_FILES:
        if not os.path.exists(filepath):
            errors.append(f"Missing: {filepath}")
    
    for pattern in REQUIRED_PATTERNS:
        import glob
        matches = glob.glob(pattern)
        if not matches:
            errors.append(f"No files matching: {pattern}")
    
    return len(errors) == 0, errors

def create_lock() -> dict:
    """Create a new lock file"""
    hashes = {}
    for filepath in CRITICAL_FILES:
        hashes[filepath] = compute_hash(filepath)
    
    lock_data = {
        "version": VERSION,
        "timestamp": datetime.now().isoformat(),
        "hashes": hashes,
        "validated_by": "preflight_lock.py",
        "checklist_version": f"v{VERSION}"
    }
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(LOCK_FILE), exist_ok=True)
    
    with open(LOCK_FILE, 'w') as f:
        json.dump(lock_data, f, indent=2)
    
    return lock_data

def check_lock() -> tuple[bool, list]:
    """Check if current state matches lock"""
    if not os.path.exists(LOCK_FILE):
        return False, ["Lock file not found. Run --validate --lock first."]
    
    with open(LOCK_FILE, 'r') as f:
        lock_data = json.load(f)
    
    errors = []
    for filepath, expected_hash in lock_data.get("hashes", {}).items():
        current_hash = compute_hash(filepath)
        if current_hash != expected_hash:
            errors.append(f"Drift detected: {filepath} (was {expected_hash}, now {current_hash})")
    
    return len(errors) == 0, errors

def main():
    import argparse
    parser = argparse.ArgumentParser(description="WAVE Pre-Flight Lock System")
    parser.add_argument("--validate", action="store_true", help="Validate architecture")
    parser.add_argument("--lock", action="store_true", help="Create lock file")
    parser.add_argument("--check", action="store_true", help="Check lock validity")
    args = parser.parse_args()
    
    print("\n" + "=" * 50)
    print(f"WAVE PRE-FLIGHT LOCK v{VERSION}")
    print("=" * 50)
    
    if args.validate:
        print("\n🔍 Validating architecture...")
        valid, errors = validate_files()
        
        if valid:
            print("✅ All critical files present")
        else:
            print("❌ Validation failed:")
            for error in errors:
                print(f"   - {error}")
            sys.exit(1)
        
        if args.lock:
            print("\n🔒 Creating lock file...")
            lock_data = create_lock()
            print(f"✅ Lock created: {LOCK_FILE}")
            print(f"   Timestamp: {lock_data['timestamp']}")
            print(f"   Files locked: {len(lock_data['hashes'])}")
    
    elif args.check:
        print("\n🔍 Checking lock...")
        valid, errors = check_lock()
        
        if valid:
            print("✅ Lock valid - OK to proceed")
            sys.exit(0)
        else:
            print("❌ Lock invalid - BLOCKED")
            for error in errors:
                print(f"   - {error}")
            print("\nRun: python scripts/preflight_lock.py --validate --lock")
            sys.exit(1)
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()

Make the script executable:
chmod +x scripts/preflight_lock.py

Show me the created file.
```

### 10.2 Run Pre-Flight Validation

**Copy to Claude Code:**
```
Run full pre-flight validation and create lock:

python scripts/preflight_lock.py --validate --lock

Expected:
==================================================
WAVE PRE-FLIGHT LOCK v1.5.0
==================================================

🔍 Validating architecture...
✅ All critical files present

🔒 Creating lock file...
✅ Lock created: .claude/PREFLIGHT.lock
   Timestamp: 2026-01-29T...
   Files locked: 5

Report the result.
```

---

## STEP 11: Start Orchestrator

### 11.1 Create Minimal Orchestrator

**Copy to Claude Code:**
```
Create file: orchestrator/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
import subprocess
from datetime import datetime

app = FastAPI(title="WAVE Orchestrator", version="1.5.0")

class StoryDispatch(BaseModel):
    story_id: str
    domain: str = None
    dry_run: bool = False

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    tracing: bool
    redis: bool

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    
    # Check Redis
    redis_ok = False
    try:
        import redis
        r = redis.Redis(host='wave-redis', port=6379)
        redis_ok = r.ping()
    except:
        pass
    
    return HealthResponse(
        status="healthy" if redis_ok else "degraded",
        version="1.5.0",
        timestamp=datetime.now().isoformat(),
        tracing=os.getenv("LANGCHAIN_TRACING_V2", "").lower() == "true",
        redis=redis_ok
    )

@app.get("/stories")
async def list_stories():
    """List available stories"""
    stories = []
    story_dir = "ai-prd/stories"
    
    if os.path.exists(story_dir):
        for filename in os.listdir(story_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(story_dir, filename)
                with open(filepath) as f:
                    story = json.load(f)
                    stories.append({
                        "id": story.get("story_id", filename),
                        "title": story.get("title", "Untitled"),
                        "domain": story.get("domain", "unknown"),
                        "wave": story.get("wave_number", 1)
                    })
    
    return {"stories": stories, "count": len(stories)}

@app.post("/dispatch")
async def dispatch_story(dispatch: StoryDispatch):
    """Dispatch agents for a story"""
    
    # Check pre-flight lock
    lock_check = subprocess.run(
        ["python", "scripts/preflight_lock.py", "--check"],
        capture_output=True,
        text=True
    )
    
    if lock_check.returncode != 0:
        raise HTTPException(
            status_code=400,
            detail=f"Pre-flight lock invalid: {lock_check.stdout}"
        )
    
    if dispatch.dry_run:
        return {
            "status": "dry_run",
            "story_id": dispatch.story_id,
            "message": "Dry run complete - lock valid, ready to dispatch"
        }
    
    # TODO: Actual agent dispatch logic
    return {
        "status": "dispatched",
        "story_id": dispatch.story_id,
        "message": "Agents dispatched"
    }

@app.post("/emergency-stop")
async def emergency_stop():
    """Trigger emergency stop"""
    stop_file = ".claude/EMERGENCY-STOP"
    
    with open(stop_file, 'w') as f:
        f.write(datetime.now().isoformat())
    
    return {"status": "stopped", "message": "Emergency stop activated"}

@app.delete("/emergency-stop")
async def clear_emergency_stop():
    """Clear emergency stop"""
    stop_file = ".claude/EMERGENCY-STOP"
    
    if os.path.exists(stop_file):
        os.remove(stop_file)
    
    return {"status": "cleared", "message": "Emergency stop cleared"}

Show me the created file.
```

### 11.2 Create __init__.py

**Copy to Claude Code:**
```
Create file: orchestrator/__init__.py

# WAVE Orchestrator Package

Show me the created file.
```

### 11.3 Start Orchestrator

**Copy to Claude Code:**
```
Start the orchestrator:

docker-compose up -d orchestrator

Wait 10 seconds for startup, then verify:

curl -s http://localhost:8000/health | jq

Expected:
{
  "status": "healthy",
  "version": "1.5.0",
  "timestamp": "...",
  "tracing": true,
  "redis": true
}

Report the result.
```

---

## STEP 12: Final Validation

### 12.1 Run Complete System Check

**Copy to Claude Code:**
```
Run all validation checks:

echo "=== WAVE v2 System Validation ==="
echo ""

echo "1. Container Status:"
python scripts/container_validator.py

echo ""
echo "2. Pre-Flight Lock:"
python scripts/preflight_lock.py --check

echo ""
echo "3. Orchestrator Health:"
curl -s http://localhost:8000/health | jq

echo ""
echo "4. Available Stories:"
curl -s http://localhost:8000/stories | jq

echo ""
echo "5. Dozzle Access:"
curl -s -o /dev/null -w "   HTTP Status: %{http_code}\n" http://localhost:8080

echo ""
echo "=== Validation Complete ==="

Report all results.
```

### 12.2 Test Story Dispatch (Dry Run)

**Copy to Claude Code:**
```
Test dispatching a story (dry run):

curl -X POST http://localhost:8000/dispatch \
  -H "Content-Type: application/json" \
  -d '{"story_id": "WAVE1-AUTH-001", "dry_run": true}' | jq

Expected:
{
  "status": "dry_run",
  "story_id": "WAVE1-AUTH-001",
  "message": "Dry run complete - lock valid, ready to dispatch"
}

Report the result.
```

---

## STEP 13: Ready for Execution

### Summary Checklist

**Copy to Claude Code:**
```
Print final readiness checklist:

echo "
╔════════════════════════════════════════════════════════╗
║           WAVE v2 EXECUTION READINESS                  ║
╠════════════════════════════════════════════════════════╣
"

# Check each component
check_item() {
    if [ "$2" = "true" ]; then
        echo "║  ✅ $1"
    else
        echo "║  ❌ $1"
    fi
}

# Run checks
REDIS=$(docker ps --filter "name=wave-redis" --filter "status=running" -q)
DOZZLE=$(docker ps --filter "name=wave-dozzle" --filter "status=running" -q)
ORCH=$(curl -s http://localhost:8000/health 2>/dev/null | grep -q "healthy" && echo "true" || echo "")
LOCK=$(python scripts/preflight_lock.py --check 2>/dev/null && echo "true" || echo "")
SLACK=$([ -n "$SLACK_WEBHOOK_URL" ] && echo "true" || echo "")
LANG=$([ -n "$LANGSMITH_API_KEY" ] && echo "true" || echo "")

check_item "Redis Running" "$([ -n "$REDIS" ] && echo true)"
check_item "Dozzle Running" "$([ -n "$DOZZLE" ] && echo true)"
check_item "Orchestrator Healthy" "$ORCH"
check_item "Pre-Flight Lock Valid" "$LOCK"
check_item "Slack Configured" "$SLACK"
check_item "LangSmith Configured" "$LANG"

echo "║"
echo "╠════════════════════════════════════════════════════════╣"

# Overall status
if [ -n "$REDIS" ] && [ -n "$DOZZLE" ] && [ -n "$ORCH" ] && [ -n "$LOCK" ]; then
    echo "║           STATUS: ✅ GO FOR LAUNCH                     ║"
else
    echo "║           STATUS: ❌ NOT READY                         ║"
fi

echo "╚════════════════════════════════════════════════════════╝
"

Report the final status.
```

---

## Quick Reference: Copy-Paste Commands

### Start Everything
```bash
docker-compose up -d redis dozzle orchestrator
```

### Validate System
```bash
python scripts/container_validator.py && \
python scripts/preflight_lock.py --check && \
curl -s http://localhost:8000/health | jq
```

### Dispatch Story (Dry Run)
```bash
curl -X POST http://localhost:8000/dispatch \
  -H "Content-Type: application/json" \
  -d '{"story_id": "WAVE1-AUTH-001", "dry_run": true}'
```

### Dispatch Story (Real)
```bash
curl -X POST http://localhost:8000/dispatch \
  -H "Content-Type: application/json" \
  -d '{"story_id": "WAVE1-AUTH-001", "dry_run": false}'
```

### Emergency Stop
```bash
curl -X POST http://localhost:8000/emergency-stop
```

### Clear Emergency Stop
```bash
curl -X DELETE http://localhost:8000/emergency-stop
```

### View Logs
```bash
# All logs (Dozzle)
open http://localhost:8080

# Orchestrator logs
docker logs -f wave-orchestrator
```

### Cleanup
```bash
python scripts/cleanup_containers.py --force
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Redis not starting | `docker-compose up -d redis` then check logs |
| Orchestrator unhealthy | Check `.env` file, rebuild image |
| Lock invalid | `python scripts/preflight_lock.py --validate --lock` |
| Slack not sending | Verify `SLACK_WEBHOOK_URL` in `.env` |
| LangSmith not tracing | Check `LANGCHAIN_TRACING_V2=true` |

---

**End of Execution Process Guide**

*Follow steps 1-10 in order. Each step has copy-paste commands for Claude Code.*
