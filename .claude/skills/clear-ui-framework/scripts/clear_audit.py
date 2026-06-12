#!/usr/bin/env python3
"""
C.L.E.A.R. UI Audit Script
Generates a structured audit template for any UI screen.

Usage:
    python clear_audit.py "Screen Name"
    python clear_audit.py "Screen Name" --scores 3,2,1,4,2
    python clear_audit.py "Screen Name" --json
"""

import argparse
import json
import sys
from datetime import datetime

PILLARS = [
    {
        "code": "C",
        "name": "Copywriting",
        "questions": [
            "Is every piece of text earning its place?",
            "Are labels unambiguous to a new user?",
            "Do CTAs describe benefits, not just features?",
            "Does the copy pass the Barstool Test?",
            "Are user anxieties proactively addressed?"
        ],
        "tests": ["Blur Test", "Barstool Test", "Copy Swap Test", "Write-With-Eraser"]
    },
    {
        "code": "L",
        "name": "Layout",
        "questions": [
            "Are related elements visually grouped (Proximity)?",
            "Do same-role elements look identical (Similarity)?",
            "Is the layout free of unnecessary decoration (Simplicity)?",
            "Do edges and baselines align on a grid (Alignment)?",
            "Can the user find what they need in 2 seconds (Continuity)?"
        ],
        "tests": ["F-Pattern Scan"]
    },
    {
        "code": "E",
        "name": "Emphasis",
        "questions": [
            "Is there one unmistakable primary element?",
            "Are emphasis tools appropriate for the content type?",
            "Is the primary/secondary difference dramatic enough?",
            "Is emphasis reserved for what matters (not screaming)?",
            "Does emphasis serve the user's status and action goals?"
        ],
        "tests": ["Foggy Glasses Test", "Relative Emphasis Check"]
    },
    {
        "code": "A",
        "name": "Accessibility",
        "questions": [
            "Does text contrast meet WCAG 2.1 AA (4.5:1)?",
            "Are touch/click targets at least 44x44px?",
            "Does meaning survive without color?",
            "Can all elements be reached via keyboard?",
            "Does the UI work for tired or distracted users?"
        ],
        "tests": []
    },
    {
        "code": "R",
        "name": "Reward",
        "questions": [
            "Does the user receive positive feedback within 30 seconds?",
            "Does the user feel in control (Safety, Certainty, Agency)?",
            "Does the interface confirm the user is doing well?",
            "Does the interface acknowledge the user's identity or effort?",
            "Do rewards serve the user, not just the business?"
        ],
        "tests": ["30-Second Reward Test"]
    }
]


def generate_audit(screen_name: str, scores: list[int] | None = None, as_json: bool = False):
    """Generate a CLEAR audit for the given screen."""
    audit = {
        "screen": screen_name,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "pillars": [],
        "total": 0,
        "max": 25,
        "priority": None
    }

    lowest_score = 6
    lowest_pillar = None

    for i, pillar in enumerate(PILLARS):
        score = scores[i] if scores else 0
        entry = {
            "code": pillar["code"],
            "name": pillar["name"],
            "score": score,
            "questions": pillar["questions"],
            "tests": pillar["tests"],
            "notes": "",
            "changes": []
        }
        audit["pillars"].append(entry)
        audit["total"] += score

        if score < lowest_score and score > 0:
            lowest_score = score
            lowest_pillar = pillar["name"]

    audit["priority"] = lowest_pillar or "Score all pillars first"

    if as_json:
        print(json.dumps(audit, indent=2))
        return

    # Markdown output
    print(f"# CLEAR Audit: {screen_name}")
    print(f"**Date:** {audit['date']}")
    print()

    print("## Scorecard")
    print("| Pillar | Score | Key Issue |")
    print("|--------|-------|-----------|")
    for p in audit["pillars"]:
        score_display = f"{p['score']}/5" if p['score'] > 0 else "_/5"
        print(f"| {p['code']} ({p['name']}) | {score_display} | |")
    total_display = f"{audit['total']}/25" if any(p['score'] > 0 for p in audit['pillars']) else "_/25"
    print(f"| **Total** | **{total_display}** | |")
    print()

    if audit["priority"]:
        print(f"**Priority pillar:** {audit['priority']}")
        print()

    print("## Pillar Details")
    print()
    for p in audit["pillars"]:
        print(f"### {p['code']}: {p['name']}")
        print()
        print("**Scoring questions:**")
        for q in p["questions"]:
            print(f"- [ ] {q}")
        if p["tests"]:
            print()
            print(f"**Diagnostic tests:** {', '.join(p['tests'])}")
        print()
        print("**Notes:**")
        print()
        print("**Proposed changes:**")
        print("- Before → After (Rationale)")
        print()

    print("---")
    print()
    print("## Cross-Pillar Flags")
    print("*(Note any issues surfaced in one pillar that belong to another)*")
    print()
    print("## Re-Score After Changes")
    print("| Pillar | Before | After | Delta |")
    print("|--------|--------|-------|-------|")
    for p in audit["pillars"]:
        score_display = f"{p['score']}" if p['score'] > 0 else "_"
        print(f"| {p['code']} | {score_display} | _ | _ |")


def main():
    parser = argparse.ArgumentParser(description="Generate a C.L.E.A.R. UI Audit template")
    parser.add_argument("screen", help="Name of the screen or component to audit")
    parser.add_argument("--scores", help="Comma-separated scores for C,L,E,A,R (e.g., 3,2,1,4,2)")
    parser.add_argument("--json", action="store_true", help="Output as JSON instead of Markdown")

    args = parser.parse_args()

    scores = None
    if args.scores:
        scores = [int(s) for s in args.scores.split(",")]
        if len(scores) != 5:
            print("Error: --scores must have exactly 5 values (C,L,E,A,R)", file=sys.stderr)
            sys.exit(1)
        if any(s < 0 or s > 5 for s in scores):
            print("Error: each score must be between 0 and 5", file=sys.stderr)
            sys.exit(1)

    generate_audit(args.screen, scores, args.json)


if __name__ == "__main__":
    main()
