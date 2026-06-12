# Executable Node Format — Typed Schemas

Each skill as a callable diagnostic node with typed input/output schemas, handoff protocols, and sequencing enforcement.

> **Design principle:** Every skill has a typed input schema, typed output schema, explicit handoff protocol, and connected psychological principles. The `handoff_protocol` field enforces the Upstream Principle by blocking downstream skill execution when upstream resolution is incomplete.

---

## Skill 1: Build the User's 6P Story

**Skill ID:** `skill_01_6p_story`
**Phase:** Empathize

### Input Schema
```
{
  raw_research: {
    geq_responses: Array<{
      hope: string,
      pain: string,
      barrier: string
    }>,
    seq_responses?: Array<{
      task_context: string,
      specific_friction: string,
      workaround_used: string
    }>,
    support_tickets?: Array<string>,
    session_recordings?: Array<{ url: string, timestamp_notes: string }>
  }
}
```

### Output Schema
```
{
  story: {
    person: string,       // One specific individual
    problem: string,      // Their felt problem
    pursuit: string,      // What they're trying to do
    pitfall: string,      // Why it fails
    pivot: string,        // The moment of change
    payoff: string        // The emotional outcome
  },
  dominant_motivation_dyad: "sensation" | "anticipation" | "social",
  identified_ability_bottleneck: string,
  confidence: "high" | "medium" | "low",
  gap_warning?: string
}
```

### Handoff Protocol
```
IF output.confidence === "low":
  WARN: "6P story built from insufficient data. BMAP diagnosis may be unreliable."
  ALLOW: proceed to Skill 2 with warning flag
ELSE:
  PASS: output.story → Skill 2 input.user_context
  PASS: output.dominant_motivation_dyad → Skill 2 input.suspected_motivation
```

---

## Skill 2: Map the Behavior (BMAP)

**Skill ID:** `skill_02_bmap`
**Phase:** Empathize

### Input Schema
```
{
  user_context: {            // From Skill 1
    story: Story6P,
    dominant_motivation_dyad: string,
    identified_ability_bottleneck: string
  },
  target_behavior: {
    description: string,     // Specific behavior to trigger
    current_conversion: number?,  // Current rate if known
    context: string          // When/where this behavior occurs
  }
}
```

### Output Schema
```
{
  bmap_position: {
    zone: "A" | "B" | "C" | "D",
    motivation_level: "high" | "medium" | "low",
    ability_level: "high" | "medium" | "low",
    above_activation_threshold: boolean
  },
  weakest_variable: "motivation" | "ability" | "prompt",
  motivation_analysis: {
    dominant_dyad: "sensation" | "anticipation" | "social",
    active_lever: string,
    lever_strength: "strong" | "moderate" | "weak"
  },
  ability_analysis: {
    scarcest_resource: "time" | "money" | "physical" | "mental" | "social",
    constraint_description: string
  },
  recommended_fix_axis: "motivation" | "ability" | "prompt" | "reconsider",
  gap_warning?: string
}
```

### Handoff Protocol
```
IF input.user_context IS MISSING:
  GAP_WARNING: "No 6P Story provided. BMAP is plotting without emotional context."
IF output.zone === "D":
  WARN: "User is in Zone D. Downstream optimization unlikely to help. Reconsider the ask."
PASS: output.bmap_position → Skill 3 input.bmap_context
PASS: output.weakest_variable → Skill 3 input.focus_axis
```

---

## Skill 3: Score the Psych Budget (NPV)

**Skill ID:** `skill_03_npv`
**Phase:** Empathize

### Input Schema
```
{
  bmap_context: BMAPPosition,    // From Skill 2
  focus_axis: string,            // From Skill 2
  flow_touchpoints: Array<{
    step_id: string,
    description: string,
    user_action: string,
    system_response: string
  }>
}
```

### Output Schema
```
{
  psych_ledger: Array<{
    step_id: string,
    psych_variation: number,     // -5 to +5
    cumulative_npv: number,
    rationale: string,
    principle_applied: string
  }>,
  first_negative_point: string?,
  deepest_pit: { step_id: string, cumulative_npv: number },
  peak_moment: { step_id: string, cumulative_npv: number },
  end_moment: { step_id: string, cumulative_npv: number },
  compound_friction_risk: boolean,
  recommended_bias_phase: "block" | "interpret" | "act" | "store"
}
```

### Handoff Protocol
```
IF input.bmap_context IS MISSING:
  GAP_WARNING: "No BMAP context. NPV scoring without behavioral variable identification."
PASS: output.deepest_pit → Skill 4 input.priority_touchpoints[0]
PASS: output.recommended_bias_phase → Skills 4-7 (determines entry point)
```

---

## Skills 4–7: B.I.A.S. Audit Nodes

Each B.I.A.S. phase follows the same structural pattern:

### Generic B.I.A.S. Input Schema
```
{
  priority_touchpoints: Array<{
    step_id: string,
    cumulative_npv: number,
    element_description: string
  }>,
  upstream_audit_results?: AuditResult[],  // From previous B.I.A.S. phase
  upstream_resolved: boolean               // Sequencing enforcement
}
```

### Generic B.I.A.S. Output Schema
```
{
  failures: Array<{
    element: string,
    principle_violated: string,
    severity: "critical" | "major" | "minor",
    evidence: string,
    fix_direction: string,
    before_after?: { before: string, after: string }
  }>,
  passes: Array<{
    element: string,
    principle_applied: string,
    note: string
  }>,
  upstream_gap: boolean,
  phase_clear: boolean
}
```

### Sequencing Enforcement (applies to all B.I.A.S. nodes)
```
IF phase === "interpret" AND upstream_block.phase_clear === false:
  GAP_WARNING: "Block failures unresolved. Interpret fixes may be wasted."
IF phase === "act" AND upstream_interpret.phase_clear === false:
  GAP_WARNING: "Interpret failures unresolved. Act optimization targets wrong understanding."
IF phase === "store" AND upstream_act.phase_clear === false:
  GAP_WARNING: "Act failures unresolved. Store investment targets incomplete actions."
```

---

## Skill 8: Journey Map

**Skill ID:** `skill_08_journey_map`
**Phase:** Redesign

### Input Schema
```
{
  bias_audit: {
    block_results: AuditResult,
    interpret_results: AuditResult,
    act_results: AuditResult,
    store_results: AuditResult
  },
  full_journey: Array<{
    touchpoint_id: string,
    description: string,
    psych_level: number     // -5 to +5
  }>
}
```

### Output Schema
```
{
  journey_map: {
    pivotal_moments: Array<{
      touchpoint_id: string,
      type: "peak" | "pit" | "jump" | "drop" | "transition",
      psych_level: number,
      description: string,
      why_pivotal: string
    }>,    // Exactly 5-6 items
    biggest_pit: string,
    strongest_peak: string,
    end_moment: string,
    end_quality: "strong" | "weak" | "neutral"
  },
  compound_risks: Array<string>,     // Consecutive drops
  reorder_opportunities: Array<{
    current_sequence: string,
    proposed_sequence: string,
    expected_impact: string
  }>
}
```

---

## Skill 9: Journey Improve

**Skill ID:** `skill_09_journey_improve`
**Phase:** Redesign

### Input Schema
```
{
  journey_map: JourneyMapOutput,    // From Skill 8
  constraints: {
    can_remove_steps: boolean,
    can_reorder_steps: boolean,
    can_add_steps: boolean,
    timeline: string?,
    resource_level: "minimal" | "moderate" | "full"
  }
}
```

### Output Schema
```
{
  improvements: Array<{
    target: "fix_pit" | "amplify_peak" | "smooth_transition",
    touchpoint_id: string,
    method: "reorder" | "remove" | "add" | "modify",
    description: string,
    principle_applied: string,
    expected_psych_impact: number,
    effort_level: "low" | "medium" | "high",
    priority: number
  }>,
  new_journey_shape: Array<{ touchpoint_id: string, new_psych_level: number }>,
  peak_end_check: { peak_maintained: boolean, end_improved: boolean }
}
```

---

## Skill 10: Communicate

**Skill ID:** `skill_10_communicate`
**Phase:** Communicate

### Input Schema
```
{
  improvements: ImprovementList,    // From Skill 9
  stakeholders: Array<{
    name: string,
    role: string,
    primary_kpi: string,
    known_concerns: string[],
    communication_style: "data_driven" | "vision_driven" | "risk_averse" | "action_oriented"
  }>
}
```

### Output Schema
```
{
  communication_plan: {
    opening_frame: string,           // Problem statement, not solution
    key_insight: string,             // The one thing they'll remember
    supporting_data: Array<string>,
    anticipated_objections: Array<{
      objection: string,
      response: string,
      technique: string    // Which named technique to use
    }>,
    recommendation: string,
    bounded_alternatives: Array<string>,  // Max 2
    escape_hatch: string
  }
}
```

---

## Skill 11: Ethics

**Skill ID:** `skill_11_ethics`
**Phase:** Validate

### Input Schema
```
{
  design_elements: Array<{
    element: string,
    technique_used: string,
    intended_effect: string
  }>,
  improvements: ImprovementList     // From Skill 9
}
```

### Output Schema
```
{
  ethics_assessment: {
    regret_test: Array<{
      element: string,
      passes: boolean,
      rationale: string
    }>,
    manipulation_matrix: {
      quadrant: "facilitator" | "entertainer" | "dealer" | "exploiter",
      rationale: string
    },
    black_mirror_test: {
      scaled_risks: Array<string>,
      severity: "none" | "low" | "medium" | "high"
    },
    humane_design_check: {
      saves_time: boolean,
      values_attention: boolean,
      reflects_human_values: boolean,
      violations: Array<string>
    }
  },
  overall_verdict: "pass" | "flag" | "fail",
  required_changes: Array<string>
}
```

### Enforcement
```
IF output.overall_verdict === "fail":
  BLOCK: Do not proceed to Skill 12. Ethics failures must be resolved first.
IF output.overall_verdict === "flag":
  WARN: "Ethics concerns identified. Proceed with documented risk acceptance."
```

---

## Skill 12: Iterate

**Skill ID:** `skill_12_iterate`
**Phase:** Validate

### Input Schema
```
{
  shipped_change: {
    description: string,
    targeted_bias_phase: "block" | "interpret" | "act" | "store",
    targeted_metric: string,
    baseline_value: number
  },
  results: {
    metric_value: number,
    adjacent_metrics: Array<{ name: string, change: number }>,
    user_feedback?: Array<string>
  },
  ethics_clearance: EthicsOutput    // From Skill 11
}
```

### Output Schema
```
{
  sequencing_check: {
    correct_phase_targeted: boolean,
    upstream_gaps_found: Array<string>,
    v2_dip_detected: boolean,
    v2_dip_interpretation: string?
  },
  metric_assessment: {
    primary_moved: boolean,
    movement_magnitude: number,
    unexpected_effects: Array<string>
  },
  next_cycle: {
    recommended_focus: string,
    new_research_questions: Array<string>,
    kano_shift_check: string
  }
}
```

### Handoff Protocol
```
LOOP: output.next_cycle → Skill 1 input (new empathy research)
```
