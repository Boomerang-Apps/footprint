#!/usr/bin/env python3
"""
WAVE v2 Story Schema V4 Validator (Extended)
Validates story files against Schema V4 with extensions for Footprint project.

Extensions from strict V4:
- Accepts 'backend', 'frontend' as valid domains
- Accepts top-level objective/files/tdd/safety (not nested under story_data)
- Accepts acceptance_criteria as objects with 'description' field
- Makes prototype_reference optional (warning only)
"""

import os
import json
import sys
from pathlib import Path
from typing import List, Dict, Any

SCHEMA_VERSION = "v4-extended"

# Extended valid domains (original V4 + practical additions)
VALID_DOMAINS = [
    # Original V4 domains
    "auth", "authentication",
    "payments", "payment",
    "orders", "order",
    "users", "user", "profile",
    "admin", "administration",
    "notifications", "notification",
    "transform", "ai-transform",
    "shared", "common",
    # Extended domains
    "backend", "frontend",
    "api", "ui",
]

# Required fields for Schema V4
REQUIRED_FIELDS = {
    "story_id": str,
    "wave_number": int,
    "domain": str,
    "title": str,
    "description": str,
    "acceptance_criteria": list,
}

# Optional but recommended fields
RECOMMENDED_FIELDS = [
    "prototype_reference",
    "priority",
    "estimated_points",
    "story_points",
    "dependencies",
]

# Required nested structures (can be at top-level OR under story_data)
REQUIRED_STRUCTURES = {
    "objective": ["as_a", "i_want", "so_that"],
    "files": ["create", "modify", "forbidden"],
    "safety": ["stop_conditions", "escalation_triggers"],
    "tdd": ["test_files", "coverage_target", "test_framework"],
}


def validate_acceptance_criteria(ac_list: list) -> tuple:
    """Validate acceptance criteria - accepts strings OR objects with description"""
    errors = []
    warnings = []

    if len(ac_list) < 1:
        errors.append("Must have at least 1 acceptance criterion")
        return errors, warnings

    for i, criterion in enumerate(ac_list):
        if isinstance(criterion, str):
            # Original V4 format - plain string
            if len(criterion) < 10:
                warnings.append(f"AC {i+1}: Criterion seems too short")
        elif isinstance(criterion, dict):
            # Extended format - object with description
            if "description" not in criterion:
                errors.append(f"AC {i+1}: Object missing 'description' field")
            elif len(criterion.get("description", "")) < 10:
                warnings.append(f"AC {i+1}: Description seems too short")
            # Bonus: check for test_approach (good practice)
            if "test_approach" not in criterion:
                warnings.append(f"AC {i+1}: Missing 'test_approach' (recommended)")
        else:
            errors.append(f"AC {i+1}: Must be string or object, got {type(criterion).__name__}")

    return errors, warnings


def validate_nested_structure(story: dict, name: str, required_keys: list) -> tuple:
    """Validate a nested structure (can be top-level or under story_data)"""
    errors = []
    warnings = []

    # Check top-level first, then story_data
    struct = story.get(name)
    if struct is None:
        story_data = story.get("story_data", {})
        struct = story_data.get(name)

    if struct is None:
        errors.append(f"Missing required structure: {name}")
        return errors, warnings

    if not isinstance(struct, dict):
        errors.append(f"{name} must be an object, got {type(struct).__name__}")
        return errors, warnings

    for key in required_keys:
        if key not in struct:
            errors.append(f"{name}.{key} is required")

    return errors, warnings


def validate_story(filepath: str) -> Dict[str, Any]:
    """Validate a single story file against Schema V4 Extended"""
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
    except Exception as e:
        return {
            "file": filepath,
            "valid": False,
            "errors": [f"Could not read file: {e}"],
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
        warnings.append(f"Unknown domain '{domain}'. Valid: {', '.join(sorted(set(VALID_DOMAINS)))}")

    # Validate wave_number
    wave = story.get("wave_number", 0)
    if wave < 1 or wave > 10:
        errors.append(f"wave_number should be 1-10, got {wave}")

    # Validate acceptance_criteria (extended: accepts objects)
    ac = story.get("acceptance_criteria", [])
    ac_errors, ac_warnings = validate_acceptance_criteria(ac)
    errors.extend(ac_errors)
    warnings.extend(ac_warnings)

    # Check recommended fields
    for field in RECOMMENDED_FIELDS:
        if field not in story:
            warnings.append(f"Missing recommended field: {field}")

    # Validate prototype_reference if present
    proto_ref = story.get("prototype_reference", "")
    if proto_ref and not proto_ref.startswith("design_mockups/"):
        warnings.append(f"prototype_reference should start with 'design_mockups/'")

    # Validate nested structures (extended: can be top-level)
    for name, required_keys in REQUIRED_STRUCTURES.items():
        struct_errors, struct_warnings = validate_nested_structure(story, name, required_keys)
        errors.extend(struct_errors)
        warnings.extend(struct_warnings)

    # Check TDD coverage target
    tdd = story.get("tdd") or story.get("story_data", {}).get("tdd", {})
    if tdd:
        coverage = tdd.get("coverage_target", 0)
        if coverage < 80:
            warnings.append(f"coverage_target is {coverage}%, should be >= 80%")

    return {
        "file": os.path.basename(filepath),
        "story_id": story.get("story_id", "UNKNOWN"),
        "domain": story.get("domain", "unknown"),
        "wave": story.get("wave_number", 0),
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }


def validate_all_stories(story_dir: str) -> Dict:
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
        "schema_version": SCHEMA_VERSION,
        "valid": all_valid,
        "total": len(results),
        "valid_count": sum(1 for r in results if r["valid"]),
        "invalid_count": sum(1 for r in results if not r["valid"]),
        "stories": results
    }


def print_report(results: Dict):
    """Print formatted validation report"""

    print("\n" + "=" * 70)
    print(f"WAVE STORY VALIDATION (Schema {results.get('schema_version', 'v4')})")
    print("=" * 70)

    if "error" in results:
        print(f"\n[X] ERROR: {results['error']}")
        return False

    print(f"\nTotal Stories: {results['total']}")
    print(f"Valid: {results['valid_count']}")
    print(f"Invalid: {results['invalid_count']}")
    print("-" * 70)

    for story in results["stories"]:
        status = "[OK]" if story["valid"] else "[FAIL]"
        print(f"\n{status} {story['story_id']} ({story['domain']}) - Wave {story['wave']}")
        print(f"    File: {story['file']}")

        if story["errors"]:
            print("    ERRORS:")
            for err in story["errors"]:
                print(f"      - {err}")

        if story["warnings"]:
            print("    WARNINGS:")
            for warn in story["warnings"]:
                print(f"      - {warn}")

    print("\n" + "=" * 70)
    if results["valid"]:
        print("RESULT: ALL STORIES VALID")
    else:
        print("RESULT: VALIDATION FAILED - Fix errors above")
    print("=" * 70 + "\n")

    return results["valid"]


def main():
    """Main entry point"""
    # Default story directory
    story_dir = "stories/wave4"

    # Check for command line argument
    if len(sys.argv) > 1:
        story_dir = sys.argv[1]

    # Try relative path from footprint directory
    if not os.path.exists(story_dir):
        # Try from project root
        alt_path = os.path.join(os.path.dirname(__file__), "..", story_dir)
        if os.path.exists(alt_path):
            story_dir = alt_path

    print(f"Validating stories in: {story_dir}")
    results = validate_all_stories(story_dir)
    success = print_report(results)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
