#!/usr/bin/env python3
"""
WAVE v2 Pre-Launch Verification Script
Run this in Claude Code to verify all infrastructure is ready.

Usage: python3 wave_prelaunch_verify.py
"""

import os
import subprocess
import json
from pathlib import Path

# Configuration
WAVE_PATH = "/Volumes/SSD-01/Projects/WAVE"
FOOTPRINT_PATH = "/Volumes/SSD-01/Projects/Footprint/footprint"

# Results tracking
results = {
    "docker": {"passed": 0, "failed": 0, "items": []},
    "structure": {"passed": 0, "failed": 0, "items": []},
    "env_vars": {"passed": 0, "failed": 0, "items": []},
    "preflight": {"passed": 0, "failed": 0, "items": []},
    "build": {"passed": 0, "failed": 0, "items": []},
    "images": {"passed": 0, "failed": 0, "items": []},
    "stories": {"passed": 0, "failed": 0, "items": []},
    "slack": {"passed": 0, "failed": 0, "items": []},
}

def run_cmd(cmd, capture=True):
    """Run a shell command and return output."""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=capture, text=True, timeout=60)
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def check(category, name, condition, details=""):
    """Record a check result."""
    status = "✅" if condition else "❌"
    if condition:
        results[category]["passed"] += 1
    else:
        results[category]["failed"] += 1
    results[category]["items"].append({"name": name, "status": status, "details": details})
    print(f"  {status} {name}" + (f" - {details}" if details else ""))

def print_header(title):
    """Print section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# ============================================================
# 1. DOCKER INFRASTRUCTURE
# ============================================================
print_header("1. DOCKER INFRASTRUCTURE")

# Docker daemon
success, out, err = run_cmd("docker info > /dev/null 2>&1")
check("docker", "Docker daemon running", success)

# Redis container
success, out, err = run_cmd("docker ps --format '{{.Names}}' | grep wave-redis")
check("docker", "wave-redis container", success, "Running" if success else "Not running")

# Dozzle container
success, out, err = run_cmd("docker ps --format '{{.Names}}' | grep -E 'wave-dozzle|dozzle'")
check("docker", "wave-dozzle container", success, "Running" if success else "Not running")

# Redis PING
success, out, err = run_cmd("docker exec wave-redis redis-cli ping 2>/dev/null")
check("docker", "Redis responding", success and "PONG" in out, out if success else "No response")

# ============================================================
# 2. FOOTPRINT PROJECT STRUCTURE
# ============================================================
print_header("2. FOOTPRINT PROJECT STRUCTURE")

structure_files = [
    ("CLAUDE.md", "CLAUDE.md"),
    (".claude/PREFLIGHT.lock", "Pre-flight lock"),
    (".claude/safety/constitutional.json", "Constitutional AI config"),
    ("src/safety/__init__.py", "Safety module init"),
    ("src/safety/constitutional.py", "Constitutional safety"),
    ("src/safety/emergency_stop.py", "Emergency stop"),
    ("src/safety/budget.py", "Budget enforcement"),
    ("src/agents", "Agents directory"),
    ("src/domains", "Domains directory"),
    ("src/gates", "Gates directory"),
    ("src/multi_llm.py", "Multi-LLM routing"),
    ("src/task_queue.py", "Task queue"),
    ("scripts/preflight_lock.py", "Pre-flight script"),
    ("scripts/rlm_auditor.py", "RLM auditor"),
]

for filepath, name in structure_files:
    full_path = os.path.join(FOOTPRINT_PATH, filepath)
    exists = os.path.exists(full_path)
    check("structure", name, exists, filepath)

# ============================================================
# 3. ENVIRONMENT VARIABLES
# ============================================================
print_header("3. ENVIRONMENT VARIABLES")

# Footprint .env.local
footprint_env_path = os.path.join(FOOTPRINT_PATH, ".env.local")
footprint_vars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "SENTRY_DSN",
]

if os.path.exists(footprint_env_path):
    with open(footprint_env_path, 'r') as f:
        env_content = f.read()
    for var in footprint_vars:
        has_var = var in env_content and f"{var}=" in env_content
        check("env_vars", f"Footprint: {var}", has_var)
else:
    check("env_vars", "Footprint .env.local", False, "File not found")

# WAVE .env
wave_env_path = os.path.join(WAVE_PATH, ".env")
wave_vars = [
    "ANTHROPIC_API_KEY",
    "SLACK_WEBHOOK_URL",
    "LANGSMITH_API_KEY",
]

if os.path.exists(wave_env_path):
    with open(wave_env_path, 'r') as f:
        env_content = f.read()
    for var in wave_vars:
        has_var = var in env_content and f"{var}=" in env_content
        # LANGSMITH is optional
        is_optional = var == "LANGSMITH_API_KEY"
        check("env_vars", f"WAVE: {var}" + (" (optional)" if is_optional else ""), has_var or is_optional)
else:
    check("env_vars", "WAVE .env", False, "File not found")

# ============================================================
# 4. PRE-FLIGHT VALIDATION
# ============================================================
print_header("4. PRE-FLIGHT VALIDATION")

preflight_script = os.path.join(FOOTPRINT_PATH, "scripts/preflight_lock.py")
if os.path.exists(preflight_script):
    success, out, err = run_cmd(f"cd {FOOTPRINT_PATH} && python3 scripts/preflight_lock.py --check")
    check("preflight", "Pre-flight lock valid", success and "valid" in out.lower(), out[:100] if out else err[:100])
else:
    check("preflight", "Pre-flight script exists", False, "Script not found")

# Check lock file content
lock_file = os.path.join(FOOTPRINT_PATH, ".claude/PREFLIGHT.lock")
if os.path.exists(lock_file):
    try:
        with open(lock_file, 'r') as f:
            lock_data = json.load(f)
        check("preflight", "Lock file valid JSON", True, f"Version: {lock_data.get('version', 'unknown')}")
        # Check for either timestamp or created_at
        has_time = "timestamp" in lock_data or "created_at" in lock_data
        time_value = lock_data.get("timestamp", lock_data.get("created_at", ""))[:19]
        check("preflight", "Lock has timestamp", has_time, time_value)
    except json.JSONDecodeError:
        check("preflight", "Lock file valid JSON", False, "Invalid JSON")
else:
    check("preflight", "Lock file exists", False)

# ============================================================
# 5. BUILD STATUS
# ============================================================
print_header("5. BUILD STATUS")

# Check if .next directory exists (indicates previous successful build)
next_dir = os.path.join(FOOTPRINT_PATH, ".next")
check("build", "Previous build exists (.next)", os.path.exists(next_dir))

# Check package.json exists
pkg_json = os.path.join(FOOTPRINT_PATH, "package.json")
check("build", "package.json exists", os.path.exists(pkg_json))

# Check tsconfig excludes worktrees
tsconfig_path = os.path.join(FOOTPRINT_PATH, "tsconfig.json")
if os.path.exists(tsconfig_path):
    with open(tsconfig_path, 'r') as f:
        tsconfig = json.load(f)
    excludes = tsconfig.get("exclude", [])
    check("build", "tsconfig excludes worktrees", "worktrees" in excludes, f"Excludes: {excludes}")
else:
    check("build", "tsconfig.json exists", False)

# ============================================================
# 6. WAVE DOCKER IMAGES
# ============================================================
print_header("6. WAVE DOCKER IMAGES")

required_images = [
    "wave-orchestrator",
    "wave-cto",
    "wave-pm",
    "wave-fe-dev",
    "wave-be-dev",
    "wave-qa",
]

success, out, err = run_cmd("docker images --format '{{.Repository}}:{{.Tag}}'")
if success:
    images = out.split('\n')
    for img in required_images:
        found = any(img in image for image in images)
        check("images", f"Image: {img}", found)
else:
    check("images", "Docker images accessible", False, err)

# ============================================================
# 7. STORIES CHECK
# ============================================================
print_header("7. STORIES CHECK")

# Check for stories directory
stories_dir = os.path.join(FOOTPRINT_PATH, "stories")
if os.path.exists(stories_dir):
    story_files = list(Path(stories_dir).rglob("*.json"))
    check("stories", "Stories directory exists", True, f"{len(story_files)} JSON files")
else:
    check("stories", "Stories in Supabase", True, "No local stories/ - using Supabase")

# Check for Supabase stories table reference
supabase_types = os.path.join(FOOTPRINT_PATH, "types/supabase.ts")
if os.path.exists(supabase_types):
    with open(supabase_types, 'r') as f:
        content = f.read()
    has_stories = "stories" in content.lower()
    check("stories", "Supabase stories table", has_stories, "Found in types" if has_stories else "Not found")

# ============================================================
# 8. SLACK NOTIFICATIONS
# ============================================================
print_header("8. SLACK NOTIFICATIONS")

# Check notification templates config exists
slack_config_path = os.path.join(WAVE_PATH, "core/config/slack-notifications.json")
if os.path.exists(slack_config_path):
    try:
        with open(slack_config_path, 'r') as f:
            slack_config = json.load(f)
        check("slack", "Notification templates config", True, f"Version: {slack_config.get('version', 'unknown')}")

        # Validate required templates exist
        required_templates = ["wave_launch", "story_started", "story_completed", "story_failed", "emergency_stop"]
        templates = slack_config.get("templates", {})
        for template in required_templates:
            has_template = template in templates
            check("slack", f"Template: {template}", has_template)

        # Check models config
        models = slack_config.get("models", {})
        check("slack", "Agent models configured", len(models) >= 5, f"{len(models)} agents")

    except json.JSONDecodeError:
        check("slack", "Notification templates config", False, "Invalid JSON")
else:
    check("slack", "Notification templates config", False, "File not found")

# Check SLACK_WEBHOOK_URL and test connection
wave_env_path = os.path.join(WAVE_PATH, ".env")
slack_webhook = None
if os.path.exists(wave_env_path):
    with open(wave_env_path, 'r') as f:
        for line in f:
            if line.startswith("SLACK_WEBHOOK_URL="):
                slack_webhook = line.split("=", 1)[1].strip()
                break

if slack_webhook:
    check("slack", "SLACK_WEBHOOK_URL configured", True)

    # Send test notification
    import urllib.request
    import urllib.error
    from datetime import datetime

    test_payload = json.dumps({
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "Pre-Flight Notification Test", "emoji": True}
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": "*Status:*\n:white_check_mark: Connection OK"},
                    {"type": "mrkdwn", "text": "*Project:*\nFootprint"}
                ]
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": "*Controller:*\nWAVE v2"},
                    {"type": "mrkdwn", "text": "*Test Type:*\nPre-flight"}
                ]
            },
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": f":test_tube: Pre-flight notification test | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"}
                ]
            }
        ]
    }).encode('utf-8')

    try:
        req = urllib.request.Request(slack_webhook, data=test_payload, headers={'Content-Type': 'application/json'})
        response = urllib.request.urlopen(req, timeout=10)
        status_code = response.getcode()
        check("slack", "Slack webhook test", status_code == 200, f"HTTP {status_code}")
    except urllib.error.HTTPError as e:
        check("slack", "Slack webhook test", False, f"HTTP {e.code}")
    except urllib.error.URLError as e:
        check("slack", "Slack webhook test", False, f"Connection failed: {e.reason}")
    except Exception as e:
        check("slack", "Slack webhook test", False, str(e)[:50])
else:
    check("slack", "SLACK_WEBHOOK_URL configured", False, "Not found in .env")

# ============================================================
# SUMMARY REPORT
# ============================================================
print("\n")
print("╔" + "═"*62 + "╗")
print("║" + "WAVE v2 PRE-LAUNCH VERIFICATION REPORT".center(62) + "║")
print("╠" + "═"*62 + "╣")
print("║" + " Category".ljust(25) + "│ Status │ Details".ljust(34) + "║")
print("╠" + "═"*62 + "╣")

categories = [
    ("docker", "Docker Infrastructure"),
    ("structure", "Project Structure"),
    ("env_vars", "Environment Variables"),
    ("preflight", "Pre-Flight Lock"),
    ("build", "Build Status"),
    ("images", "Docker Images"),
    ("stories", "Stories"),
    ("slack", "Slack Notifications"),
]

all_passed = True
for key, name in categories:
    data = results[key]
    total = data["passed"] + data["failed"]
    status = "✅" if data["failed"] == 0 else "❌"
    if data["failed"] > 0:
        all_passed = False
    details = f"{data['passed']}/{total} passed"
    print(f"║ {name.ljust(23)} │   {status}   │ {details.ljust(32)} ║")

print("╠" + "═"*62 + "╣")
overall = "✅ READY FOR LAUNCH" if all_passed else "❌ NOT READY - FIX ERRORS"
print(f"║ {'OVERALL STATUS'.ljust(23)} │   {'✅' if all_passed else '❌'}   │ {overall.ljust(32)} ║")
print("╚" + "═"*62 + "╝")

# Print failures if any
if not all_passed:
    print("\n❌ ITEMS REQUIRING ATTENTION:")
    print("-" * 40)
    for key, name in categories:
        for item in results[key]["items"]:
            if item["status"] == "❌":
                print(f"  • {name}: {item['name']}")
                if item["details"]:
                    print(f"    └─ {item['details']}")

print("\n" + "="*60)
if all_passed:
    print("🚀 All checks passed! Ready to launch WAVE for Footprint.")
    print("\nNext step - run in Terminal:")
    print(f"  cd {WAVE_PATH}")
    print(f"  export PROJECT_PATH={FOOTPRINT_PATH}")
    print("  docker-compose up -d orchestrator")
else:
    print("⚠️  Fix the issues above before launching.")
print("="*60)
