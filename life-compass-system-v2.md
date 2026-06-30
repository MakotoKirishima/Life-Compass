# Life-Compass: Career Intelligence System
## Architecture & Design Specification — v2.0

---

> *"A career recommendation without a time dimension, a gap plan, and honest difficulty is a horoscope with a spreadsheet behind it."*

---

## Preface: Why the Current System Falls Short

The current system is technically functional. The math works. The scores calculate. The labels appear. But something crucial is missing — and it can be articulated precisely.

**The current system answers:** *"Which careers match what you selected?"*

**The question people are actually asking is:** *"What should I do with my life, why, what will it take, and can I trust this answer?"*

Career matching is not a filtering problem. It is a navigation problem. Users don't feel trust because the system gives them a ranked list without earning it — no depth of reasoning, no gap analysis, no honest difficulty assessment, no sense that the system truly understood them as individuals. The result feels like a personality quiz wrapped in a spreadsheet. For something as consequential as a person's career, that is not enough.

This document describes a system designed to replace that with something genuinely trustworthy — complex where it needs to be, transparent about its reasoning, honest about hard truths, and useful far beyond the first recommendation.

---

## Table of Contents

1. [Foundational Principles](#1-foundational-principles)
2. [User Assessment Framework](#2-user-assessment-framework)
3. [Enhanced Career Data Model](#3-enhanced-career-data-model)
4. [Three-Pass Scoring Engine](#4-three-pass-scoring-engine)
5. [Career Intelligence Report — Output Architecture](#5-career-intelligence-report--output-architecture)
6. [Gap Analysis System](#6-gap-analysis-system)
7. [Hiring Readiness Module](#7-hiring-readiness-module)
8. [Trust Architecture](#8-trust-architecture)
9. [The Living Profile — Adaptive System](#9-the-living-profile--adaptive-system)
10. [Full Data Schemas](#10-full-data-schemas)
11. [Assessment Experience Design](#11-assessment-experience-design)
12. [Ethical Framework](#12-ethical-framework)
13. [Career Database Architecture](#13-career-database-architecture)
14. [Integration & Expansion Roadmap](#14-integration--expansion-roadmap)
15. [Migration from v1 to v2](#15-migration-from-v1-to-v2)
16. [Summary: What Changes, and Why](#16-summary-what-changes-and-why)

---

## 1. Foundational Principles

Before any architecture decision, five philosophical principles define what this system must be.

### 1.1 Temporal Honesty

A career recommendation is a snapshot claim about a dynamic reality. The system must reflect that careers evolve, job markets shift, and users change. Every recommendation must include a time dimension: *"This career fits you now,"* or *"This career is where you're heading in 18 months,"* or *"This career was strong 5 years ago — here is what it looks like now."* A system that ignores time is giving advice in the dark.

### 1.2 Honest Difficulty

The single greatest failure mode of career guidance systems is optimism bias. Telling someone that software engineering is a good fit without telling them about the 6–18 month learning curve, the 50–200 job applications before a first offer, and the brutal technical interview culture is not helpful — it is harmful. This system commits to communicating the full picture: what a career costs to enter, what it costs to sustain, and where it might hit ceilings or face disruption.

### 1.3 Trust Through Specificity and Transparency

Generic results feel untrue, even when they are statistically accurate. Trust is earned through specificity: *"Your Interest Resonance score for UX Design is 81/100 because you described enjoying understanding how people make decisions, and the activity cluster in UX — research, synthesis, prototyping — aligns directly with that. The gap is visual design, which is a real requirement."* When users can see exactly why a score is what it is, and challenge it if they disagree, they trust the system. Opacity destroys credibility.

### 1.4 Agency Preservation

This system must expand a user's self-understanding, not replace their judgment. The output is a structured intelligence brief, not a verdict. Users are the final decision-makers. The system's job is to make them the most informed version of themselves at the moment of decision.

### 1.5 Career as Journey, Not Destination

No recommendation system should deliver a single answer. Careers are navigated over time through decisions, pivots, setbacks, and evolution. The system must map the terrain — showing bridge careers, pivot opportunities, adjacent paths, and realistic timelines — not just hand someone a destination and wish them luck.

---

## 2. User Assessment Framework

The current 8-question model is replaced by a **seven-phase structured assessment** producing a rich, multi-dimensional user profile. The full assessment takes 45–75 minutes. An Express Mode (20 questions, ~15 minutes) is available with clearly flagged lower-confidence output.

---

### Phase 1: Foundational Context and Anchoring
**Purpose:** Establish the framing before any matching begins. Understand urgency, runway, and what the user actually means by "career success."
**Questions:** 7 | **Time:** 5–8 minutes

| # | Question | What It Captures | Data Output |
|---|---|---|---|
| 1 | What stage best describes you right now? | Life and career stage | `life_stage: enum` |
| 2 | What is your current situation in one sentence? | Urgency, pressure, context | `urgency_level: 1–5`, `situation_summary: text` |
| 3 | What does "career success" mean to you, in your own words? | Personally defined success metrics | `success_definition: text` (semantically analyzed) |
| 4 | If money and other people's opinions disappeared, what would you be doing? | Aspirational/suppressed interests | `aspirational_self: text` (semantically analyzed) |
| 5 | What has stopped you from pursuing that? | Perceived barriers and fears | `perceived_barriers: text[]` |
| 6 | How many hours per week can you realistically invest in building skills or transitioning? | Path feasibility calibration | `weekly_hours_available: number` |
| 7 | How much financial runway do you have before income becomes critical? | Urgency calibration | `runway_months: enum` |

**Why Phase 1 matters:** Questions 3, 4, and 5 are the most important in the entire assessment. They surface the gap between what users say they want and what they actually want — a gap that standard career assessments never probe. Open-text responses are semantically analyzed and cross-referenced throughout all subsequent scoring.

---

### Phase 2: Psychological and Cognitive Profile
**Purpose:** Understand how the user thinks, works, and relates to uncertainty — factors that predict fit more reliably than stated interests alone.
**Questions:** 14 scenario-based questions | **Time:** 12–18 minutes

These are not "Do you prefer X or Y?" questions. They are behavioral scenarios requiring the user to describe what they would actually do.

#### 2.1 Eight Cognitive Dimensions Measured

| Dimension | What Is Measured | Scoring Poles |
|---|---|---|
| Structure Preference | Defined tasks vs. open-ended exploration | `structured ↔ open-ended` |
| Collaboration Mode | Solo, small team, large group | `independent ↔ collaborative` |
| Risk Tolerance | Certainty vs. uncertainty as energizer/drainer | `risk-averse ↔ risk-seeking` |
| Feedback Sensitivity | Seeks continuous validation vs. self-directed work | `feedback-dependent ↔ internally validated` |
| Learning Mode | Doing, reading, watching, teaching | `experiential ↔ theoretical` |
| Time Horizon | Motivated by immediate results vs. long-horizon projects | `short-cycle ↔ long-cycle` |
| Ambiguity Tolerance | Comfort when the "right answer" is undefined | `low tolerance ↔ high tolerance` |
| Authority Relationship | Autonomy, structure, or collaborative accountability | `autonomous ↔ structured` |

**Output:** `cognitive_profile: CognitiveVector` — an 8-dimensional numeric vector ranging from -1.0 to +1.0 per dimension. This vector is used in Dimension 4 (Cognitive Fit) scoring.

#### 2.2 Six Emotional and Motivational Dimensions

| Dimension | What Is Measured |
|---|---|
| Resilience Pattern | How the user responds to setbacks and failure |
| Intrinsic vs. Extrinsic Motivation | Does reward come from the work itself or from outcomes? |
| Identity Relationship to Work | Is career central to identity, or instrumental? |
| Pressure Response | Performance under deadline vs. open-ended pressure |
| Change Orientation | Thrives on change vs. prefers stability |
| Competitive Drive | Internal competition (vs. self) vs. external (vs. others) |

**Output:** `motivation_profile: MotivationVector` — a 6-dimensional vector used in Cognitive Fit and Values Alignment scoring.

**Sample Scenario Question:**

> *"You've been working on a project for three weeks. Your manager tells you the direction is changing and you'll need to start over. Which response is closest to your first reaction?"*
>
> A. Frustrated — that's time wasted and I like finishing what I start.
> B. Curious — what caused the change? I want to understand the new direction.
> C. Indifferent — I care more about doing good work than which version survives.
> D. Energized — I'll approach the new direction with fresh eyes.

No answer here is "better." Each reveals a genuine cognitive trait relevant to specific career environments.

---

### Phase 3: Multi-Tier Skills Inventory
**Purpose:** Move beyond a checkbox list. Capture not just what skills users claim, but what they have actually demonstrated — and surface skills they may not realize they have.
**Structure:** Variable (20–50 items depending on profile) | **Time:** 10–20 minutes

The current system accepts claimed skills at face value. This system assesses skills across four tiers:

#### Tier 1 — Claimed Skills
User selects from a structured, hierarchical skills taxonomy (not a flat list). Skills are organized into clusters:

- **Analytical:** data analysis, research, critical thinking, problem-solving, logical reasoning
- **Technical-Digital:** programming, software tools, database management, systems thinking
- **Creative:** design thinking, writing, visual communication, ideation, storytelling
- **Interpersonal:** communication, negotiation, teaching/training, empathy, conflict resolution
- **Organizational:** project management, process design, strategic planning, prioritization
- **Scientific:** experimentation, observation, quantitative analysis, literature review
- **Financial:** budgeting, financial modeling, forecasting, accounting
- **Physical/Manual:** physical precision, spatial reasoning, equipment operation, craftsmanship

#### Tier 2 — Demonstrated Skills
For each claimed skill, the system asks a verification question:

> *"Have you used [skill] in a real situation — a job, school project, volunteer role, or personal project?"*

- **Yes, with outcomes I can describe** → High-confidence demonstrated skill; brief description captured
- **Yes, but casually/informally** → Medium-confidence demonstrated skill
- **Not yet, but I'm learning it** → In-progress skill (flagged separately)
- **I selected it but I'm not confident** → Moved to aspirational/claimed-only

Demonstrated skills carry 2x the scoring weight of claimed-only skills.

#### Tier 3 — Implied Skills (System-Inferred)
Based on education, work history, and prior answers, the system infers likely skills the user hasn't claimed. These are presented for user confirmation:

> *"Based on your background in [field], you've likely developed [skill]. Does that sound right?"*

Confirmed implied skills are added to the profile at medium confidence.

#### Tier 4 — Anti-Skills (Explicitly Disavowed)
Users are prompted to identify genuine weaknesses or aversions:

> *"Are there any skills or task types you actively struggle with or dislike? This information helps us avoid recommending careers where these are central requirements."*

Anti-skills generate penalties in scoring. This is more accurate than simply noting an absence of a skill — "I don't have accounting" is different from "I find number-heavy work genuinely unpleasant."

**Output:**
```
skills: {
  claimed:       Skill[]     // selected, unverified
  demonstrated:  DemonstratedSkill[]  // verified with evidence
  implied:       Skill[]     // system-inferred, user-confirmed
  in_progress:   ProgressSkill[]      // learning, with timeline
  anti_skills:   string[]    // aversions and genuine weaknesses
}
```

---

### Phase 4: Multi-Dimensional Interest Mapping
**Purpose:** Replace surface-level keyword interest selection with a structured, three-axis interest architecture.
**Questions:** 14 | **Time:** 8–12 minutes

#### Axis 1 — Domain Interests (What fields attract you?)
Not simply "I like technology." Instead, users respond to curated domain descriptions and rate resonance on a scale:

Examples: *Digital systems and how software shapes behavior. The science of the body and how health systems work. How economies function and how money moves through societies. How people communicate across cultures and through media.*

#### Axis 2 — Activity Interests (What actions do you enjoy doing?)
This axis is more predictive than domain because a person can find any domain interesting in a documentary but only certain activities satisfying to do for 8 hours a day.

Activity clusters include: **Analyzing** (breaking down complexity), **Creating** (generating new things), **Organizing** (bringing order to systems), **Persuading** (influencing others), **Building** (making tangible things), **Caring** (supporting people), **Investigating** (discovering answers), **Teaching** (transferring knowledge), **Executing** (implementing and getting things done), **Leading** (directing others toward goals).

#### Axis 3 — Problem Interests (What kinds of problems excite you?)
A deeper signal than domain or activity. Some people are energized by social problems. Others by optimization problems. Others by creative challenges.

Categories: *Social and human problems, Technical and systems problems, Creative and aesthetic problems, Scientific and discovery problems, Organizational and efficiency problems, Financial and resource allocation problems.*

#### Holland Code Inference
The system infers a RIASEC (Holland Code) profile from the pattern of Phase 2–4 answers without explicitly asking. This is a validated psychological model with strong career prediction power.

| Code | Type | Examples |
|---|---|---|
| R — Realistic | Hands-on, practical, things-oriented | Engineer, carpenter, pilot |
| I — Investigative | Analytical, intellectual, research-oriented | Scientist, analyst, programmer |
| A — Artistic | Creative, expressive, unstructured | Designer, writer, musician |
| S — Social | People-oriented, helping, teaching | Counselor, teacher, nurse |
| E — Enterprising | Leadership, persuasion, business | Manager, salesperson, entrepreneur |
| C — Conventional | Organized, detail-oriented, structured | Accountant, administrator, data entry |

**Output:**
```
interests: {
  domains:             string[]        // rated resonance per domain
  activities:          ActivityRating[]
  problems:            ProblemRating[]
  inferred_holland:    HollandCode     // two-letter primary code (e.g., "IA", "SC")
  holland_confidence:  number          // 0.0–1.0
}
```

---

### Phase 5: Values Archaeology
**Purpose:** Move beyond flat value selection ("I value high salary") to a structured value hierarchy revealed through trade-off reasoning.
**Questions:** 10 forced-choice trade-off scenarios | **Time:** 8–12 minutes

The most common failure in values assessment is asking people to select values from a list. Everyone selects "meaningful work," "good salary," "work-life balance," and "growth opportunities." These responses are nearly useless for differentiation.

Trade-off scenarios reveal actual priorities:

**Sample Trade-Off Scenarios:**

> *Scenario A: Two job offers. Job 1 pays $120,000. The work is fine — competent, professionally respected, but not particularly meaningful to you. Job 2 pays $75,000. The work genuinely excites you and aligns with what you care about. Neither offers more stability than the other. Which do you choose?*

> *Scenario B: You have the chance to become one of the world's top experts in a narrow technical domain, or to be a generalist leader who shapes strategy across many areas. You cannot do both. Which path?*

> *Scenario C: You can work for an organization making a clear positive impact in the world, or build your own business with full autonomy. You cannot do both at this stage. Which?*

> *Scenario D: A stable, well-paying role at a large company with job security for the next decade, or a higher-risk role at an early-stage startup where you could earn 10x as much — or nothing at all — in 5 years. Which?*

**Value Dimensions Revealed:**

| Value | Operationalized As |
|---|---|
| Financial Security | Stable income > variable ceiling |
| Financial Ambition | Variable ceiling > stable income |
| Autonomy | Self-direction > structured accountability |
| Security | Certainty > risk |
| Impact | Positive external change > personal advancement |
| Recognition | Visibility and status > quiet contribution |
| Mastery | Deep expertise > broad influence |
| Variety | Diverse challenges > consistent specialization |
| Purpose | Mission alignment > compensation optimization |
| Connection | Relationships at work > independent contribution |

**Output:**
```
values: {
  hierarchy:             ValueItem[]        // ordered by revealed priority
  trade_off_responses:   TradeOffResponse[] // raw scenario answers
  dominant_cluster:      ValueCluster       // e.g., "purpose-over-compensation"
  financial_ambition:    1–5
  autonomy_index:        1–5
  risk_appetite:         1–5
}
```

---

### Phase 6: Constraint Mapping — Depth and Nuance
**Purpose:** Capture the full reality of what limits (and sometimes expands) the user's options, with severity, permanence, and addressability all tracked.
**Questions:** 8–12 | **Time:** 5–8 minutes

The current system treats constraints as penalty triggers. This system models them as nuanced realities with different natures:

#### Constraint Classification

| Type | Examples | Scoring Treatment |
|---|---|---|
| **Psychological** | Fear of math, public speaking anxiety, discomfort with conflict | Penalty + note on addressability |
| **Physical** | Disability, chronic illness, physical limitations | Penalty + adjusted feasibility |
| **Geographic** | Location-locked, immigration status, no relocation possible | Feasibility flag + regional demand check |
| **Educational** | No degree, wrong field of study | Conditional penalty (addressable) |
| **Financial** | Debt burden, high income urgency, no runway | Urgency weight modifier |
| **Personal** | Primary caregiver, dependents, health of family member | Time constraint modifier |
| **Legal** | Background check concerns, licensing limitations | Feasibility flag |
| **Temporal** | Need income within X months | Urgency weight modifier |

#### Constraint Schema
Each constraint is captured as:
```
Constraint {
  type:           ConstraintType
  description:    string           // user's own words
  severity:       1–5
  is_permanent:   bool
  is_addressable: bool
  address_timeline: string?        // "6 months" / "2 years" / "unknown"
  scoring_treatment: "penalty" | "modifier" | "advantage" | "neutral"
}
```

**Advantage Constraints:** Some constraints are actually beneficial in certain contexts. *"I prefer working alone"* is a constraint in many roles but an advantage in careers with high independent work. *"I have a physical disability that requires remote work"* aligns with careers with strong remote availability. The system detects and scores these correctly.

---

### Phase 7: Work Environment Preferences — Scenario-Based
**Purpose:** Replace checklist selections ("remote/startup/corporate") with richer environment profiling.
**Questions:** 5 scenario-based open questions + 6 structured | **Time:** 5–8 minutes

**Open Scenario Questions:**

> *"It's 10 AM on a Tuesday. You're in a job you genuinely like. Describe what you're doing and who you're with."*

> *"A colleague disagrees with your approach to a project. Describe the best possible version of that conversation."*

> *"You're three months into a new role. Describe what a good week looks like — not what you'd ideally want, but what you're actually hoping to experience."*

**Structured Environment Preferences:**

- Physical workspace: Home / Coworking / Office / Field / Mixed
- Team size: Solo, 2–5, 6–15, 16–50, 50+
- Work pace: Measured and consistent / Variable / Fast and high-pressure
- Communication style: Async-first / Sync-heavy / Mixed
- Industry culture: Startup, corporate, nonprofit, government, agency, freelance
- Schedule flexibility: Structured hours / Flexible hours / Unpredictable

**Output:** `environment_preferences: EnvironmentProfile` — a structured profile used in Dimension 7 scoring.

---

## 3. Enhanced Career Data Model

Each career is no longer a flat record with 7–10 fields. It is a **rich, multi-layer entity** representing the full reality of a career — including its trajectory, culture, difficulty, and relationships to adjacent careers.

### 3.1 Full Career Entity Schema

```typescript
interface Career {
  id: string;
  metadata: CareerMetadata;
  skills: SkillRequirements;
  education: EducationRequirements;
  market: MarketProfile;
  compensation: CompensationProfile;
  entry_reality: EntryRealityProfile;
  trajectory: CareerTrajectory;
  culture: CultureProfile;
  psychological_fit: PsychologicalFitProfile;
  relationships: CareerRelationships;
}

interface CareerMetadata {
  name: string;
  category: string;
  subcategories: string[];
  aliases: string[];           // alternate titles used in job postings
  description: string;         // what this career actually is
  day_in_the_life: string;     // realistic daily description (not marketing copy)
  common_misconceptions: string[];  // what people get wrong about this career
  last_updated: Date;
}

interface SkillRequirements {
  required_core: Skill[];           // blocking — must have to enter
  required_technical: Skill[];      // domain-specific technical requirements
  optional_accelerators: Skill[];   // not required, but meaningfully speed up progression
  soft_skills: Skill[];             // interpersonal/behavioral requirements
  anti_skills: string[];            // traits/tendencies that predict poor fit
  skill_ceiling: string;            // what mastery looks like at senior level
}

interface EducationRequirements {
  minimum_viable: EducationLevel;   // what's actually possible (not what's typical)
  typical: EducationLevel;          // what most practitioners have
  alternative_paths: AlternativePath[];
  path_success_rates: Record<string, number>;  // bootcamp: 0.65, self_taught: 0.40, etc.
  credential_weight: number;        // 1–5: how much degrees matter vs. portfolio
}

interface MarketProfile {
  global_demand: DemandLevel;
  regional_variance: VarianceLevel;  // "high" = location matters enormously
  growth_rate_5yr: string;           // "+22%" / "flat" / "-8%"
  saturation_risk: RiskLevel;
  hiring_cycle: string;              // "2–4 weeks" / "3–6 months"
  ai_displacement_risk: {
    score: number;                   // 0.0–1.0
    timeline: string;                // "2–4 years" / "5–10 years" / "uncertain"
    affected_tasks: string[];        // which specific tasks AI is automating
    resilient_tasks: string[];       // which tasks remain human-dependent
    net_job_outlook: string;         // "shrinking" / "stable" / "growing" / "transforming"
    commentary: string;
  };
  remote_availability: AvailabilityLevel;
  geographic_hotspots: string[];     // cities/regions with highest demand
}

interface CompensationProfile {
  entry_level:    { min: number; max: number; typical: number };
  mid_level:      { min: number; max: number; typical: number };
  senior_level:   { min: number; max: number; typical: number };
  expert_ceiling: { min: number; max: number; typical: number };
  income_trajectory_curve: "linear" | "exponential" | "plateau" | "variable";
  currency_note: string;
  non_monetary_benefits: string[];
  freelance_potential: "low" | "medium" | "high";
  equity_potential: "rare" | "possible" | "common";
}

interface EntryRealityProfile {
  time_to_first_job: Record<string, string>;  // per education path
  portfolio_requirements: string[];
  credential_requirements: string[];
  interview_difficulty: 1 | 2 | 3 | 4 | 5;  // 5 = FAANG-style technical
  interview_format: string[];               // "technical screen, system design, behavioral"
  typical_application_count: string;       // "50–200 applications before first offer"
  gatekeeping_factors: string[];            // honest barriers to entry
  experience_catch_22_severity: number;    // 1–5: how hard "needs experience" paradox is
  entry_strategies: EntryStrategy[];       // concrete first-step strategies
}

interface CareerTrajectory {
  career_ladder: LadderLevel[];
  time_to_senior: string;
  time_to_expert: string;
  ceiling_analysis: string;
  individual_contributor_track: boolean;
  management_track: boolean;
  entrepreneurial_exit_potential: "low" | "medium" | "high";
  common_pivots_from: string[];   // careers people commonly come from
  common_pivots_to: string[];     // careers people commonly move into
  specialization_options: string[];
}

interface CultureProfile {
  typical_team_size: string;
  pace: "slow" | "measured" | "moderate" | "fast" | "high-pressure";
  autonomy_level: 1 | 2 | 3 | 4 | 5;
  feedback_frequency: "rarely" | "quarterly" | "monthly" | "weekly" | "continuous";
  learning_culture: 1 | 2 | 3 | 4 | 5;
  bureaucracy_level: 1 | 2 | 3 | 4 | 5;  // 5 = highly regulated/structured
  creative_expression: 1 | 2 | 3 | 4 | 5;
  physical_demands: string;
  work_life_balance_typical: 1 | 2 | 3 | 4 | 5;  // 5 = excellent balance
  travel_requirement: "none" | "occasional" | "frequent" | "extensive";
}

interface PsychologicalFitProfile {
  thrives_on: string[];           // genuine satisfiers
  struggles_with: string[];       // genuine frustrations (honest)
  personality_indicators: {
    holland_codes: HollandCode[];
    cognitive_preferences: string[];
    risk_tolerance_fit: number;       // 1–5
    ambiguity_tolerance_fit: number;  // 1–5
  };
  burnout_risk_factors: string[];     // conditions that lead to burnout in this career
  longevity_predictors: string[];     // what keeps people in this career long-term
}

interface CareerRelationships {
  adjacent_careers: string[];       // similar skills, different domain — lateral
  bridge_careers: string[];         // stepping stones TO this career
  pivot_from_careers: string[];     // careers THIS pivots into
  aspiration_careers: string[];     // what this career can grow toward
  cluster: string;                  // career cluster grouping for graph visualization
}
```

### 3.2 Career Relationship Graph

Each career exists within a navigable network — not just a flat list. The system maintains a directed graph:

```
Career Graph Edges:
  A → ADJACENT → B    (lateral move; similar skills, different domain)
  A → BRIDGE → B      (A is a common stepping stone to reach B)
  A → LEADS_TO → B    (A commonly transitions into B with experience)
  A → ASPIRATION → B  (B is what senior A practitioners often become)
  A → CLUSTER → B     (A and B are in the same career ecosystem)
```

This graph enables multi-hop recommendations:

> *"You're not ready for Cybersecurity Analyst today. But IT Support Engineer is a strong bridge career — people commonly move from IT Support into Cybersecurity after 1–2 years. Here's the path."*

---

## 4. Three-Pass Scoring Engine

The current system runs 6 dimensions once and sums the result. This system uses a **three-pass architecture** producing a more nuanced, reliable, and interpretable score.

---

### Pass 1 — Feasibility Gate

Before any dimension scoring occurs, each career is evaluated against the user's hard constraints to determine its **Feasibility Category.** This is not elimination — all careers proceed to scoring — but the feasibility category becomes a multiplier on the final score and a major component of the recommendation label.

| Feasibility Flag | Meaning | Score Multiplier |
|---|---|---|
| `REACHABLE_NOW` | No significant barriers; user is close to qualified | 1.00 |
| `REACHABLE_NEAR` | Achievable with 6–18 months of focused effort | 0.92 |
| `REACHABLE_LONG` | Requires 2–5 years of deliberate development | 0.80 |
| `CONDITIONAL` | Reachable only if a specific constraint is resolved | 0.70 |
| `ASPIRATIONAL` | Significant gap; shown for inspiration and long-term planning | 0.55 |

Feasibility is determined by evaluating:
- Education gap (does user meet minimum viable path?)
- Critical skill gap (are core blocking skills absent?)
- Hard constraint conflicts (geographic, legal, physical)
- Timeline feasibility given stated urgency and runway

**No career is hidden.** Even `ASPIRATIONAL` careers appear in the output, clearly labeled, with a path that gets there from the user's current position.

---

### Pass 2 — Nine-Dimension Scoring

Each dimension produces:
- A **raw score** (0–100)
- A **confidence score** (0.0–1.0 — how certain the system is given the data quality)
- A **dimension weight** (dynamically adjusted per user context — see Pass 3)
- A **human-readable reasoning summary** (used in the output report)

---

#### Dimension 1: Skills Alignment
**Default Weight: 22%**

Not a binary "has it or doesn't" — a proximity calculation that honors the quality and depth of each skill tier.

**Formula:**
```
Skills Score =

  REQUIRED CORE:
    confirmed_skills ∩ required_core          × 3.0 (each match)
    demonstrated_skills ∩ required_core       × 2.5
    claimed_skills ∩ required_core            × 1.5
    implied_skills ∩ required_core            × 1.0

  REQUIRED TECHNICAL:
    confirmed_skills ∩ required_technical     × 2.5
    demonstrated_skills ∩ required_technical  × 2.0
    claimed_skills ∩ required_technical       × 1.0

  ACCELERATORS:
    any tier ∩ optional_accelerators          × 0.8 (each match)

  IN-PROGRESS:
    in_progress_skills ∩ required_core        × 0.5 (weighted by estimated completion)

  PENALTIES:
    anti_skills ∩ career.required_core        × -3.0 (each conflict)
    anti_skills ∩ career.soft_skills          × -1.5

  → Weighted sum normalized to 0–100
  → Confidence: based on ratio of confirmed/demonstrated vs. claimed-only skills
```

**Output includes:**
- Which specific skills matched (named)
- Which critical skills are missing (named + gap severity)
- Which anti-skills conflict (named + penalty amount)

---

#### Dimension 2: Interest Resonance
**Default Weight: 18%**

Multi-layer matching across all three interest axes plus Holland Code alignment.

**Formula:**
```
Interest Score =

  DOMAIN MATCH:
    semantic_similarity(user.domains, career.category + career.subcategories) × 0.20

  ACTIVITY MATCH:
    semantic_similarity(user.activities, career.day_in_the_life) × 0.35
    (Activities are more predictive than domain — a person can find anything interesting
    to read about but only certain actions satisfying to do repeatedly)

  PROBLEM MATCH:
    semantic_similarity(user.problems, career.psychological_fit.thrives_on) × 0.25

  HOLLAND ALIGNMENT:
    holland_overlap(user.inferred_holland, career.personality_indicators.holland_codes) × 0.20
    (Two-letter codes: full match = 1.0, one match = 0.6, adjacent = 0.3, no match = 0.0)

  ASPIRATIONAL SIGNAL:
    if career_mentioned_in(user.aspirational_self): + 12 bonus points (raw)

  → Weighted sum normalized to 0–100
  → Confidence: based on completeness of interest mapping and text quality
```

---

#### Dimension 3: Values Alignment
**Default Weight: 20%**

The user's revealed value hierarchy (from trade-off scenarios) is compared to the career's measured ability to deliver on each value. The *ranking* matters — a #1 value that the career delivers on counts more than a #5 value that the career excels at.

**Value Delivery Proxies per Career:**

| User Value | Career Delivery Measured By |
|---|---|
| Financial Security | `compensation.entry_level.typical` vs. local median |
| Financial Ambition | `compensation.expert_ceiling.typical` + `equity_potential` |
| Autonomy | `culture.autonomy_level` (1–5 score) |
| Security | `market.global_demand` + `market.saturation_risk` |
| Impact | `social_impact_score` (separate rating per career) |
| Recognition | `compensation.career_ceiling` + `expert_visibility_score` |
| Mastery | `culture.learning_culture` + `trajectory.time_to_expert` |
| Variety | inverse of `role_specialization_index` |
| Purpose | `mission_alignment_score` (separate rating per career) |
| Connection | inverse of `culture.autonomy_level` + `team_size` |

**Formula:**
```
Values Score =

  For each value in user.values.hierarchy:
    position_weight = 1.0 / rank_index    (rank 1 = 1.0, rank 2 = 0.5, rank 3 = 0.33...)
    delivery_score  = career.value_delivery[value]  (0–1.0)
    contribution    = position_weight × delivery_score

  → Sum of contributions, normalized to 0–100
  → Confidence: based on completion of trade-off scenarios
```

---

#### Dimension 4: Cognitive Fit *(New)*
**Default Weight: 12%**

The user's 8-dimensional cognitive vector (Phase 2 output) is compared to the career's psychological fit profile. This is the most novel dimension — existing systems don't model it.

**Formula:**
```
Cognitive Score =

  cosine_similarity(
    user.cognitive_profile.vector,         // [structure, collab, risk, feedback, learning,
                                           //  time_horizon, ambiguity, authority]
    career.psychological_fit.cognitive_profile_vector
  ) × 100

  Penalty adjustment:
    for each burnout_risk_factor in career.burnout_risk_factors:
      if user_profile_matches(burnout_risk_factor): − penalty_weight

  → Normalized to 0–100
  → Confidence: based on completeness of Phase 2 psychological questions
```

**Why this matters:** Two people can have identical skills and interests but radically different cognitive styles. A highly structured, detail-oriented person may find data analysis careers deeply satisfying; a highly ambiguous-tolerant, self-directed person may find the same roles stifling. This dimension captures that distinction.

---

#### Dimension 5: Education Alignment
**Default Weight: 8%**

Not binary, but a readiness spectrum that accounts for alternative paths.

| User's Education Level | Career's Minimum Viable Path | Score | Flag |
|---|---|---|---|
| Meets or exceeds typical requirement | Any | 100 | — |
| Has relevant alternative (bootcamp/cert) | Accepts alternative | 88 | — |
| Has alternative, career values alternatives less | Degree preferred | 70 | Note |
| No formal credential; career is self-taught accessible | Self-taught viable | 62 | CONDITIONAL |
| No degree; career typically requires one | Bachelor minimum | 38 | CONDITIONAL |
| Overqualified (PhD for role needing Bachelor) | Lower than actual | 80 | Note: career ceiling risk |
| In-progress credential | Any | 75% of above | REACHABLE_NEAR flag |

**Special Cases:**
- **Bootcamp graduates** are evaluated against `education.path_success_rates.bootcamp`
- **Self-taught practitioners** are evaluated against `education.credential_weight` — lower credential weight = higher score for non-traditional paths
- **Wrong-field degrees** receive a partial credit if skills from the field transfer

---

#### Dimension 6: Constraint Impact
**Default Weight: 10%**

Constraints are no longer just penalties. Each constraint is evaluated for its *treatment type* (from the constraint schema) and scored accordingly:

**Formula:**
```
Constraint Score = 100

  For each constraint in user.constraints:

    if treatment == "penalty":
      deduction = severity (1–5) × permanence_weight × career_relevance_weight
      Score -= deduction × 4  (max deduction: 20 per hard constraint)

    if treatment == "modifier":
      Score × modifier_multiplier  (e.g., urgency × 0.9 if time-limited career path)

    if treatment == "advantage":
      Score += severity × 2  (constraint becomes a differentiator in this career)

    if treatment == "neutral":
      No change

  → Floor at 0, Ceiling at 100
  → Confidence: based on specificity of constraint descriptions
```

**Example Advantage Constraint:**
User constraint: *"I have a hearing impairment and work best in writing-based communication."*
Career: Technical Writer → Remote-friendly, async-first, writing-based → *Advantage* rather than penalty.

---

#### Dimension 7: Work Environment Fit
**Default Weight: 5%**

**Formula:**
```
Environment Score =

  remote_match:     (user.remote_pref matches career.remote_availability) × 0.25
  team_size_match:  (user.team_pref matches career.typical_team_size) × 0.15
  pace_match:       (user.pace_pref matches career.culture.pace) × 0.20
  autonomy_match:   (user.autonomy_pref matches career.culture.autonomy_level) × 0.20
  culture_match:    (user.culture_pref matches career.culture subtype) × 0.20

  → Weighted sum normalized to 0–100
  → Confidence: based on scenario question completeness
```

---

#### Dimension 8: Market Timing *(New)*
**Default Weight: 3%**

Adjusts score to reflect real-world conditions that make this career more or less advisable *right now.*

**Adjustments:**
- High 5-year growth rate (+5%): Small bonus
- Saturation risk (high): Penalty, magnitude based on severity
- AI displacement within 3 years: Moderate penalty (score × 0.85)
- Regional vacancy (user is in low-demand geography for this career): Penalty + flag
- Geographic hotspot (user's location is high-demand): Small bonus

**Why keep this weight low (3%):** Market timing should inform, not dominate, a career decision. A career with a slightly declining market that is an excellent fit is still worth pursuing. This dimension prevents enthusiastic recommendations of careers in structural decline, but doesn't override fit signals.

---

#### Dimension 9: Trajectory Alignment *(New)*
**Default Weight: 2%**

Does this career's path match where the user wants to go?

**Matching signals from user context:**
- User mentioned entrepreneurial goals → Does this career have high `entrepreneurial_exit_potential`?
- User values leadership → Does this career have a clear management track?
- User wants to go deep technically → Does this career have a strong individual contributor ceiling?
- User's `aspirational_self` mentions a related field → Do pivot opportunities from this career lead there?

**Formula:**
```
Trajectory Score =

  leadership_match:         (user wants leadership) × (career.management_track) × weight
  ic_match:                 (user wants depth) × (career.ic_ceiling_score) × weight
  entrepreneurial_match:    (user.values.entrepreneurial) × (career.entrepreneurial_exit) × weight
  aspiration_path_match:    path_distance(this_career, user.aspiration_career) × weight

  → Normalized to 0–100
```

---

### Pass 3 — Synthesis and Dynamic Weighting

Dimension weights are not static. They adjust based on user context, life stage, and urgency level.

#### Weight Adjustment Table

| User Context | Dimension Adjustments |
|---|---|
| **High financial urgency** (need income < 3 months) | Market Timing ↑ to 12%; Values weight ↓ to 10%; Education ↑ (faster paths prioritized) |
| **Career exploration** (student, no pressure) | Interest Resonance ↑ to 28%; Market Timing ↓ to 1%; Trajectory ↑ to 8% |
| **Forced career change** (redundancy, illness) | Cognitive Fit ↑ to 20%; Skills ↑ to 28%; Education ↓ to 4% (transferable focus) |
| **Mid-career pivot** (5–15 yrs experience) | Trajectory ↑ to 10%; Skills ↑ to 28%; Environment ↑ to 10% |
| **Re-entry after gap** | Constraint Impact ↑ to 18%; Market Timing ↑ to 8% |
| **Recent graduate** | Education ↑ to 15%; Interest ↑ to 22%; Constraints ↓ |
| **International/relocation** | Environment ↑ (geographic); Market Timing ↑ regional |

#### Final Score Formula

```
Weighted Raw Score =
  Σ ( Dimension_Score[i] × Dynamic_Weight[i] )

Confidence-Adjusted Score =
  Weighted Raw Score × Σ ( Confidence[i] × Dynamic_Weight[i] )
  (Low-confidence dimensions reduce the score toward the mean rather than holding it high)

Final Adjusted Score =
  Confidence-Adjusted Score × Feasibility_Multiplier
  (from Pass 1 Feasibility Gate)

Confidence Band =
  [Final Score × (1 - uncertainty_spread), Final Score × (1 + uncertainty_spread)]
  where uncertainty_spread = 1 - mean(confidence_scores[all dimensions])
```

---

## 5. Career Intelligence Report — Output Architecture

The output is no longer a sorted list with labels. It is a structured **Career Intelligence Report** delivered in four tiers.

---

### 5.1 Tier 1 — Your Career Compass (Top 3–5 Careers: Full Analysis)

Each Tier 1 career receives a complete deep-dive report containing:

**1. Match Headline**
A single, specific, honest sentence: *"UX Research is a strong match for you because your drive to understand human decision-making, combined with your analytical background, maps directly to this career's core activity — but visual design is a real gap you'll need to address."*

**2. Score Dashboard**
- Overall match score with confidence band
- Radar chart across all 9 dimensions (visual — shows exactly where strengths and gaps lie)
- Feasibility flag with explanation

**3. Why This Fits You — Dimension Walkthrough**
For every dimension scoring above 70: a specific explanation connecting user data to career data.
For every dimension scoring below 50: an honest explanation of the gap with severity assessment.

**4. A Week in This Career (Personalized)**
Not a generic job description — a day-in-the-life narrative drawn from the career's culture profile, filtered through what the user said they enjoy in Phase 7:

> *"Based on what you described — preferring focused independent work in the mornings and collaborative problem-solving in the afternoons — a typical week as a UX Researcher would probably feel like: 2–3 days of solo research work (participant interviews, data synthesis), 1 day of collaborative design reviews, and 1 day of documentation and presenting findings. You mentioned finding presentations draining — that's real here; you'll present findings regularly."*

**5. The Honest Gap Analysis**
(See full Section 6 for detail.)

**6. Path to First Job — Personalized Timeline**
Based on `user.weekly_hours_available`, `user.runway_months`, feasibility flag, and gap analysis:

> *"Given your 12 hours per week and 8-month runway, you can realistically reach hiring-ready for this career in approximately 6–9 months. Here is the sequence..."*

**7. The Risk Reality (Unvarnished)**
- AI displacement: timeline, affected tasks, resilient tasks
- Market saturation: is it already crowded?
- Income ceiling: what does senior-level pay actually look like?
- Common reasons people leave this career after 3–5 years

**8. Why You Might Dislike This**
Drawn from the career's `struggles_with` data cross-referenced with user's cognitive profile:

> *"People in this career frequently report frustration with: slow stakeholder buy-in, politics around design decisions, and needing to argue for research budgets. Given that you scored high on 'low conflict tolerance' in your psychological profile, this is a real consideration."*

**9. People Like You**
Anonymized aggregate: *"Among users with similar profiles (analytical background, high interest in human behavior, introversion, medium risk tolerance), 68% who pursued UX Research roles reported strong job satisfaction at 18 months. Average time to first offer: 7 months."*

---

### 5.2 Tier 2 — Strong Alternatives (Careers 6–10: Summary Analysis)

Each receives:
- Overall score with confidence band
- Smaller radar chart
- Top 2 reasons for match, top 1 honest concern
- **Bridge signal:** Does this career serve as a bridge to any Tier 1 recommendation?
- One-paragraph gap assessment

---

### 5.3 Tier 3 — For Later or For Inspiration (Careers 11–20)

- Match score with feasibility flag
- One-sentence reason for match
- One-sentence honest limitation
- Labeled clearly: `Reachable in 2–3 years` or `Aspirational — keep this in mind`

---

### 5.4 Career Pivot Map

A visual graph (interactive in the web interface) showing:
- All recommended careers and their cluster relationships
- Bridge paths (A → Bridge Career → Target Career)
- Decision tree: *"If you choose X, these pivot options open. If you choose Y, these open instead."*
- Timeline nodes showing realistic transition points

---

### 5.5 Recommendation Labels — Revised

The current `High Suitability / Medium Suitability / Try First / Not Suitable` labels are replaced:

| Label | Condition |
|---|---|
| **Strong Match — Start Now** | Score ≥ 78, Feasibility: REACHABLE_NOW |
| **Strong Match — Short Gap** | Score ≥ 75, Feasibility: REACHABLE_NEAR |
| **Good Match — Invest to Get There** | Score ≥ 65, Feasibility: REACHABLE_LONG |
| **Conditional Match** | Score ≥ 60, Feasibility: CONDITIONAL |
| **Moderate Match** | Score 50–64, any feasibility |
| **Bridge Career** | Score may be moderate, but career leads to higher-match targets |
| **Aspirational — Map the Path** | Score < 50, any; shown with full path to get there |

---

## 6. Gap Analysis System

The Gap Analysis is one of the most important features the current system lacks entirely. For each Tier 1 career, the system generates a **structured, specific, time-estimated gap analysis** covering five dimensions.

---

### 6.1 Skills Gap Analysis

For each missing or weak skill in the career's requirements:

```
SKILLS GAP REPORT — [Career Name]

CRITICAL GAPS (block entry — must close before applying):
  ✗ [Skill Name]
    Gap Severity: High (required_core; user has no evidence of this skill)
    Close Pathway: [Specific resource or approach]
    Estimated Time: [Based on user's weekly_hours_available]
    Cost: [Free / $X–$Y / depends on path]
    Evidence Needed: [What proves this skill to a hiring manager]

IMPORTANT GAPS (limit early progression but don't block entry):
  ✗ [Skill Name]
    Gap Severity: Medium
    Close Pathway: [Specific resource]
    Estimated Time: [X weeks at Y hrs/week]

ACCELERATOR GAPS (nice-to-have; meaningfully speeds up hiring):
  ✗ [Skill Name]
    Gap Severity: Low
    Recommendation: Worth pursuing after critical gaps are closed

ANTI-SKILL CONFLICTS (aversions that intersect with this career's requirements):
  ⚠ [Anti-skill] conflicts with [career requirement]
    Severity: [Low / Medium / High]
    Mitigation: [Is this addressable? How?]
```

### 6.2 Education Gap Analysis

```
EDUCATION GAP REPORT — [Career Name]

Your level: [User's current education]
Career's typical level: [Career requirement]
Career's minimum viable: [Minimum that actually leads to hire]

Recommendation: [Specific path]
Estimated time to meet minimum: [X months]
Estimated cost: [Range]
Alternative paths ranked by success rate:
  1. [Path A] — 85% hire rate, 18 months, $[cost]
  2. [Path B] — 65% hire rate, 6 months, $[cost]
  3. [Path C] — 40% hire rate, self-paced, minimal cost
```

### 6.3 Portfolio Gap Analysis

```
PORTFOLIO GAP REPORT — [Career Name]

Required for hiring readiness:
  ✗ [Deliverable type] — Missing
    What to build: [Specific project brief]
    Why it matters: [What it demonstrates to hiring managers]
    Time to complete: [Estimate]

  ✗ [Online presence requirement] — Missing or incomplete
    Action required: [Specific steps]

  ✓ [Deliverable type] — Present or easily achievable from existing work
```

### 6.4 Interview Readiness Gap Analysis

```
INTERVIEW READINESS REPORT — [Career Name]

Technical Interview Readiness: [Score / Level]
  Gaps:
    ✗ [Topic] — Not yet ready
       Study path: [Resource]
       Time: [X weeks, Y hrs/week]
    
  Strengths:
    ✓ [Topic] — Ready based on demonstrated skills

Behavioral Interview Readiness: [Score / Level]
  Assessment: [Based on work history and communication patterns in open responses]
  Preparation needed: [Specific gaps]

Domain Knowledge Readiness: [Score / Level]
  Industry knowledge gaps: [Specific areas]
  Resources: [Specific links/resources]
```

### 6.5 Master Timeline Projection

```
PERSONALIZED TIMELINE — [Career Name]
Based on: [X] hrs/week available | [Y] months financial runway | [Z feasibility level]

Total estimated time to hiring-ready: [N months]

MILESTONE PLAN:

Month 1–2: [Foundation phase — specific goals]
  Weekly focus: [Specific]
  Deliverable: [What you'll have at end of this phase]

Month 3–4: [Development phase]
  Weekly focus: [Specific]
  Deliverable: [Concrete output]

Month 5–6: [Portfolio phase]
  Weekly focus: [Specific]
  Deliverable: [Specific project(s)]

Month [N]: JOB SEARCH READY
  Portfolio: [X projects]
  Credentials: [What you'll have]
  Interview prep: Complete
  Target companies: [Job search strategy — see Hiring Readiness Module]

Urgency check: Your financial runway is [Y months].
[If timeline < runway]: You are on track.
[If timeline > runway]: [Alternative accelerated path options]
```

---

## 7. Hiring Readiness Module

This module extends beyond career matching into the territory of actually getting hired — a critical gap in the current system. Career guidance that stops at "this career fits you" leaves users stranded at the most difficult part.

### 7.1 Hiring Readiness Score (0–100)

Calculated independently from career match score:

| Component | Weight | What Is Measured |
|---|---|---|
| Portfolio Completeness | 25% | Presence and quality of work samples for this career |
| Skill Demonstration Evidence | 25% | Can skills be proven to a hiring manager through artifacts? |
| Interview Preparedness | 20% | Coverage of likely interview topics for this career |
| Professional Presence | 15% | LinkedIn/portfolio site/professional network quality |
| Credential Legitimacy | 15% | Does the user have the credentials this career's gatekeepers expect? |

### 7.2 Module Outputs

**Resume Signal Analysis**
Based on the user's work history and skills profile, the system identifies:
- Which existing experiences translate to this career (with specific framing suggestions)
- Which resume gaps need to be filled
- Career-specific keywords to incorporate
- What employers in this field look for in a candidate profile

**Portfolio Brief Generator**
For each missing portfolio deliverable, the system generates a specific project brief:

> *"For your UX Research portfolio, build a case study around a problem you've personally experienced. Conduct 5 user interviews, synthesize the findings into an insight report, and document the process. This takes approximately 3–4 weeks at 10 hrs/week. The output demonstrates research methodology, synthesis, and communication — the three things hiring managers look for first."*

**Job Search Strategy**
Based on the user's feasibility level, urgency, and location:

| Strategy | For Users Who... |
|---|---|
| **Direct Entry** | Are hiring-ready or nearly so |
| **Contract/Freelance First** | Need to build experience but have emerging skills |
| **Internship/Junior Role** | Are building from scratch, have runway |
| **Internal Transfer** | Are currently employed in an adjacent role |
| **Volunteer/Nonprofit** | Need portfolio work quickly, low financial pressure |
| **Personal Project → Demo** | Self-taught, building credibility |

**Network Entry Points**
- Specific online communities for this career (named)
- Professional associations with active job boards
- Mentorship programs in this career area
- LinkedIn connection strategies
- Events and conferences worth attending

**Interview Preparation Curriculum**
A structured prep plan based on this career's interview format and the user's identified gaps:

```
Interview Prep Curriculum — [Career Name]
Format: [Technical screen / Portfolio review / Case interview / Behavioral only / Mixed]

Week 1–2: [Topic — e.g., "Data analysis fundamentals — practice with sample datasets"]
Week 3–4: [Topic — e.g., "STAR-format storytelling — translate prior experience"]
Week 5:   [Mock interview practice — specific focus areas]
Week 6:   [Domain knowledge — industry trends, key figures, recent developments]
```

---

## 8. Trust Architecture

Trust is not a feature. It is the product. A career recommendation system that users don't trust is not just unhelpful — it is potentially harmful, because users who don't trust it will ignore it, and users who trust it incorrectly will follow bad guidance. This system addresses trust through four mechanisms.

### 8.1 Transparent Reasoning Layer

Every score comes with a visible, navigable explanation. Users can drill into any dimension and see exactly what drove that score. The explanations are written in plain language, not system jargon.

Example for Dimension 2 (Interest Resonance):

> *"Your Interest Resonance score for Data Analyst is 74/100. Here's why: Your strongest match is in problem type — you described being energized by 'finding patterns in messy data' and 'making sense of complexity,' both of which describe what data analysts do daily. Your activity interests also strongly align — you rated 'analyzing' and 'investigating' as your top two preferred activities. The gap is domain interest: you didn't strongly express interest in business or finance, which is where most data analyst roles live. If you're drawn to data in the context of [domain you rated higher], that's actually an advantage — it makes you more specialized."*

### 8.2 Challenge Mode

Any recommendation can be pushed back on. Users can flag any result and provide their reasoning:

> *"I don't think I'd enjoy this because..."*
> *"This doesn't feel right because..."*

The system responds to challenges in one of three ways:

1. **Reconsidering:** New information is incorporated, score recalculates, and the system explains what changed and why.
2. **Acknowledging and contextualizing:** *"That's a valid concern. Here's why it still scores well and here's how the aspect you mentioned actually manifests in this career — you might find it's different from what you expect."*
3. **Validating the push-back:** *"You're right. Given what you've just told us, this career's score should be lower. We've updated it."*

### 8.3 Confidence Intervals and Uncertainty Flags

Every score is presented with its confidence band:

> *Software Engineer: 79 ± 8 points (confidence: High)*
> *Financial Analyst: 61 ± 19 points (confidence: Medium — we have limited signal on your quantitative comfort level)*

Low-confidence scores trigger targeted follow-up questions:
> *"We noticed your Financial Analyst score has a wide confidence range. Can you tell us more about your relationship with quantitative/numerical work? This would sharpen the estimate significantly."*

### 8.4 Real-World Calibration

Scores are anchored to aggregate outcome data where available:

> *"Among users with a profile similar to yours who pursued software engineering, the average time to first job offer was 8 months. 71% reported strong job satisfaction at 12 months. This data comes from [N] users who completed our outcome tracking survey."*

This converts abstract scores into tangible benchmarks. It also creates accountability — the system is held to its predictions.

---

## 9. The Living Profile — Adaptive System

The current system produces a one-time recommendation. This system creates a **living profile** that evolves alongside the user.

### 9.1 Profile Update Triggers

| Event | System Response |
|---|---|
| User completes a course | In-progress skill → demonstrated; score recalculates |
| User completes a portfolio project | Portfolio gap closed; hiring readiness score updates |
| User gets a job/interview | Outcome recorded; path validated; system learns |
| User marks a skill "confirmed" | Tier upgrade; score recalculates |
| User updates constraints | Full re-evaluation triggered |
| 90 days since last update | Prompt: "Has anything changed in the last 3 months?" |
| User flags dissatisfaction with a recommendation | Challenge mode activated |
| Market data update | Market Timing scores recalculate silently |

### 9.2 Progress Dashboard

The system becomes a career development companion, not just a one-time questionnaire:

**Progress Toward Each Career:**
- Gap closure percentage (visual — like a loading bar per gap)
- Milestone checklist with completion tracking
- Weekly focus suggestion (generated based on priority gaps and available time)
- Streak and consistency tracking (not gamified in a trivial way — but honest commitment tracking)

**Profile Completeness Score:**
Indicates which phases of assessment could be deepened for sharper recommendations:
> *"Your psychological profile has 3 unanswered questions. Completing them would narrow your Financial Analyst confidence band from ±19 to ±9 points."*

### 9.3 Scheduled Re-Assessments

At 6 months and 12 months, users are prompted to do a delta assessment:
- What has changed in their skills?
- What constraints have evolved?
- Have priorities shifted?

The system shows how recommendations have evolved and what the most impactful actions have been.

### 9.4 Feedback Loop Architecture

Aggregate outcomes (anonymized) continuously improve the system:

- Which career matches had the highest real-world hire rates?
- Which gap analysis timelines were most accurate?
- Which careers had high initial match scores but low reported satisfaction at 18 months?
- Which cognitive fit signals were most predictive of career longevity?

This feedback loop means the system genuinely improves over time — a property the current static system cannot have.

---

## 10. Full Data Schemas

### 10.1 Complete User Profile Schema

```typescript
interface UserProfile {
  // Identity
  id:                   string;
  created_at:           Date;
  updated_at:           Date;
  assessment_version:   string;
  completion_status:    AssessmentCompletionStatus;

  // Phase 1: Context
  context: {
    life_stage:               LifeStage;
    situation_summary:        string;
    urgency_level:            1 | 2 | 3 | 4 | 5;
    runway_months:            RunwayRange;
    weekly_hours_available:   number;
    success_definition:       string;      // analyzed semantically
    aspirational_self:        string;      // analyzed semantically
    perceived_barriers:       string[];
    aspirational_careers_mentioned: string[];  // extracted from open text
  };

  // Phase 2: Psychological Profile
  psychological_profile: {
    cognitive_vector:       CognitiveVector;       // 8 dimensions, -1.0 to +1.0 each
    motivation_vector:      MotivationVector;      // 6 dimensions
    inferred_holland_code:  HollandCode;
    holland_confidence:     number;                // 0.0–1.0
    risk_tolerance:         1 | 2 | 3 | 4 | 5;
    ambiguity_tolerance:    1 | 2 | 3 | 4 | 5;
    burnout_indicators:     string[];              // patterns that predict burnout
  };

  // Phase 3: Skills
  skills: {
    claimed:        Skill[];
    demonstrated:   DemonstratedSkill[];    // { skill, evidence_description, context }
    implied:        Skill[];                // system-inferred, user-confirmed
    in_progress:    ProgressSkill[];        // { skill, method, estimated_completion_months }
    anti_skills:    AntiSkill[];            // { skill_or_domain, severity, user_description }
  };

  // Phase 4: Interests
  interests: {
    domains:            DomainRating[];     // { domain, resonance_score: 1–5 }
    activities:         ActivityRating[];   // { activity, resonance_score: 1–5 }
    problems:           ProblemRating[];    // { problem_type, resonance_score: 1–5 }
    inferred_holland:   HollandCode;
    holland_confidence: number;
  };

  // Phase 5: Values
  values: {
    hierarchy:              ValueItem[];        // ordered by revealed priority
    trade_off_responses:    TradeOffResponse[];
    dominant_cluster:       ValueCluster;
    financial_ambition:     1 | 2 | 3 | 4 | 5;
    autonomy_index:         1 | 2 | 3 | 4 | 5;
    risk_appetite:          1 | 2 | 3 | 4 | 5;
    purpose_orientation:    1 | 2 | 3 | 4 | 5;
  };

  // Phase 6: Constraints
  constraints: Constraint[];

  // Phase 7: Environment
  environment_preferences: {
    workspace_type:       WorkspacePreference;
    team_size:            TeamSizePreference;
    pace:                 PacePreference;
    communication_style:  CommunicationPreference;
    culture_type:         CulturePreference[];
    schedule_flexibility: FlexibilityPreference;
    scenario_responses:   EnvironmentScenarioResponse[];
  };

  // Education and Background
  education: {
    highest_level:              EducationLevel;
    field_of_study?:            string;
    alternative_credentials:    Credential[];
    in_progress:                InProgressEducation[];
    institution_selectivity?:   number;  // 1–5; used in credential weight calculations
  };

  career_history: WorkExperience[];

  // Progress and Outcomes (updated over time)
  progress: {
    active_career_paths:   ActiveCareerPath[];  // careers user is actively pursuing
    milestones_completed:  Milestone[];
    skills_closed:         SkillGapClosure[];
    courses_completed:     CompletedCourse[];
    projects_completed:    CompletedProject[];
    job_applications:      JobApplication[];
    outcomes:              CareerOutcome[];     // hires, offers, rejections (anonymized in aggregate)
    assessments:           DeltaAssessment[];   // 6-month / 12-month re-assessments
  };

  // Metadata
  meta: {
    assessment_mode:          "full" | "express";
    language:                 string;
    location?:                UserLocation;
    challenges_submitted:     ChallengeRecord[];  // when user pushed back
    confidence_flags:         ConfidenceFlag[];   // dimensions with low data quality
  };
}
```

### 10.2 Score Output Schema

```typescript
interface CareerScoreResult {
  user_id:    string;
  career_id:  string;
  scored_at:  Date;

  // Pass 1
  feasibility_flag:    FeasibilityFlag;
  feasibility_reason:  string;

  // Pass 2 Dimensions
  dimensions: {
    skills_alignment:      DimensionScore;
    interest_resonance:    DimensionScore;
    values_alignment:      DimensionScore;
    cognitive_fit:         DimensionScore;
    education_alignment:   DimensionScore;
    constraint_impact:     DimensionScore;
    environment_fit:       DimensionScore;
    market_timing:         DimensionScore;
    trajectory_alignment:  DimensionScore;
  };

  // Pass 3
  dynamic_weights:         Record<DimensionKey, number>;
  weighted_raw_score:      number;
  confidence_score:        number;    // 0.0–1.0
  final_adjusted_score:    number;
  confidence_band:         [number, number];

  // Output
  tier:                    1 | 2 | 3;
  label:                   RecommendationLabel;
  headline:                string;

  // Detailed outputs
  reasoning:               DimensionReasoning[];
  gap_analysis:            GapAnalysis;
  hiring_readiness:        HiringReadinessReport;
  personalized_timeline:   PersonalizedTimeline;
}

interface DimensionScore {
  raw:          number;    // 0–100
  confidence:   number;    // 0.0–1.0
  weight:       number;    // dynamic weight applied
  reasoning:    string;    // human-readable explanation
  data_points:  string[];  // specific user data points that drove this score
}
```

---

## 11. Assessment Experience Design

A 45–75 minute assessment is a significant commitment. The experience must justify it.

### 11.1 Conversational Flow Principles

- **One question at a time** — never present a form. Each question has its own screen with space to think.
- **Reflective acknowledgment** — the interface acknowledges prior answers: *"Earlier you said financial security is important to you. The next set of scenarios explores what that actually means in career terms."*
- **Visible stakes** — periodic reminders of what the system is building toward: *"This section helps us understand how you actually work, not just what you're good at — it's one of the most predictive parts of the assessment."*
- **Save and resume** — users can pause and return. Progress is preserved exactly.
- **Optional depth** — for some questions, users can give a brief answer or dig deeper. Deeper answers improve score confidence.
- **Estimated remaining time** — always visible, always accurate.

### 11.2 Assessment Phases and Timeline

| Phase | Questions | Minutes | Confidence Impact |
|---|---|---|---|
| Phase 1: Foundational Context | 7 | 5–8 | Critical — sets the entire framing |
| Phase 2: Psychological Profile | 14 | 12–18 | High — adds Dimension 4 and improves others |
| Phase 3: Skills Inventory | 20–50 | 10–20 | High — weights shift significantly with evidence |
| Phase 4: Interest Mapping | 14 | 8–12 | High — drives Dimension 2 quality |
| Phase 5: Values Archaeology | 10 | 8–12 | High — drives Dimension 3 quality |
| Phase 6: Constraint Mapping | 8–12 | 5–8 | Medium-high — affects feasibility gating |
| Phase 7: Environment Preferences | 11 | 8–10 | Medium — drives Dimension 7 |
| **Total** | **~85–118** | **56–88 min** | **Confidence: 0.82–0.94** |

### 11.3 Express Mode

For users who cannot commit to the full assessment:

- 22 core questions covering all 7 phases at minimum depth
- Takes approximately 15–18 minutes
- All results flagged with: *"Express Mode — Confidence: Medium. Complete the full assessment to narrow your recommendations significantly."*
- Results still include gap analysis and timelines, but with wider confidence bands

### 11.4 Progressive Deepening

Users don't have to complete everything at once. The system shows:

> *"Your current assessment confidence is 67%. Complete Phase 4 (Interest Mapping) to improve it to approximately 81% and sharpen your top 3 recommendations."*

This turns assessment completion into a motivated, visible improvement — not an obligation.

---

## 12. Ethical Framework

A system with this much influence over people's lives requires explicit ethical commitments that are built into the architecture, not appended as a policy document.

### 12.1 Anti-Bias Architecture

- **Demographic neutrality:** Recommendations are never influenced by age, gender, ethnicity, national origin, or similar factors. The scoring engine has no access to these fields.
- **Bias auditing:** Scoring models are periodically audited for systematic outcome disparities across demographic groups (using anonymized aggregate data). Any detected disparity triggers a model review.
- **Constraint vs. identity:** The system distinguishes between constraints (addressable realities) and identities (not relevant to scoring). A user's caregiving responsibilities are a constraint. Their gender is not.

### 12.2 Honest Difficulty Commitment

The system has a formal commitment to not minimize entry difficulty:
- AI displacement risks are never downplayed
- Entry timelines are based on median real-world data, not best-case scenarios
- Low success rates for certain paths (e.g., self-taught in some careers) are shown with the actual figure

### 12.3 Agency Preservation

- **All reasoning is visible** — users can always see why the system said what it said
- **All recommendations are challengeable** — Challenge Mode is always available
- **The system never gives ultimatums** — language like "you should" or "you must" is never used. Language like "based on your profile, the evidence suggests" is always used.

### 12.4 Data Ethics

- User profiles are never used for advertising, sold to third parties, or used for targeted marketing
- Aggregate outcome data is anonymized before use in model improvement (k-anonymity with k ≥ 50)
- Users can export their entire profile at any time
- Users can delete their profile with full data erasure
- Career data is reviewed and updated on a documented schedule — stale data is flagged

### 12.5 Limitation Acknowledgment

The system is transparent about what it cannot know:
- It cannot account for interpersonal factors (the specific team, the specific manager)
- It cannot account for luck, timing, and circumstance in hiring
- It cannot predict what users will discover about themselves after entering a career
- Results are recommendations, not determinations

---

## 13. Career Database Architecture

### 13.1 Current State vs. Target

| Metric | Current | Target v2.0 | Target v3.0 |
|---|---|---|---|
| Career count | 27 | 75 | 150+ |
| Fields per career | ~10 | ~45 | ~45 + real-time market data |
| Career relationships | None | Full graph | Weighted graph with temporal data |
| Data update frequency | Unknown | Quarterly | Market data: monthly; static fields: biannually |

### 13.2 Priority Career Additions

**Technology (additions to existing):**
Cybersecurity Analyst, DevOps Engineer, Data Scientist, Machine Learning Engineer, Product Manager, Technical Writer, IT Support, Cloud Architect, QA Engineer, Solutions Architect

**Healthcare:**
Registered Nurse, Physical Therapist, Medical Coder, Public Health Analyst, Healthcare Administrator, Occupational Therapist, Physician Assistant, Medical Laboratory Scientist

**Skilled Trades:**
Electrician, Plumber, HVAC Technician, Welder, Carpenter, Industrial Mechanic, Civil Engineering Technician

**Creative and Design:**
UX Designer, UX Researcher, Graphic Designer, Content Strategist, Game Designer, Art Director, Motion Designer, Brand Strategist

**Business and Finance:**
Financial Analyst, Accountant, Operations Manager, Supply Chain Analyst, HR Specialist, Marketing Manager, Sales Engineer, Business Analyst, Strategy Consultant

**Social and Public Sector:**
Social Worker, Policy Analyst, Nonprofit Program Manager, Urban Planner, Teacher, School Counselor, Public Administrator

**Emerging Fields:**
AI Prompt Engineer, Climate Technology Specialist, Biotechnology Researcher, Cybersecurity Analyst, Digital Health Specialist, Sustainability Consultant

### 13.3 Data Quality Standards

Every career in the database must meet the following standards before inclusion:

- Minimum viable data completeness: all 45+ fields populated
- Day-in-the-life description: reviewed by at least one practicing professional in that career
- Compensation data: sourced from at least 3 independent salary databases
- AI displacement assessment: reviewed at least biannually
- Entry reality data (application count, timeline): sourced from practitioner surveys or published research
- Last updated date visible to users for transparency

---

## 14. Integration and Expansion Roadmap

### Phase 1 — Core System (Months 1–4)
*Replace the existing system entirely*

- Full 7-phase assessment framework
- Complete data schema (user profile + career entity)
- 3-pass scoring engine (9 dimensions, dynamic weighting)
- Gap analysis module
- Tier 1/2/3 output report structure
- Career database expanded to 75 careers
- Express Mode

**Success metrics:**
- User session completion rate > 65% for full assessment
- User-reported trust score > 7.5/10 (post-assessment survey)
- User-reported "this feels accurate" > 75%

### Phase 2 — Depth and Continuity (Months 5–8)

- Living Profile (progress tracking, milestone system)
- Hiring Readiness Module (full implementation)
- Challenge Mode
- Confidence intervals and low-confidence follow-up questions
- Career Pivot Map (interactive visualization)
- Delta Assessment (6-month/12-month)
- 90-day automated re-engagement prompt

**Success metrics:**
- 30-day return rate > 40%
- Gap closure tracking usage > 50% of active users
- Hiring outcomes reported by > 15% of users

### Phase 3 — Connection (Months 9–14)

- Job board integration: Surface real open positions matching career + location + stage
- Learning platform integration: Auto-link gap analysis to specific courses (Coursera, Udemy, freeCodeCamp, etc.)
- Mentor matching: Connect users with professionals in matched careers willing to do informational interviews
- Community features: Anonymized peer groups by career path and stage

### Phase 4 — Intelligence (Months 15–24)

- Outcome tracking at scale: Systematic collection of hire events, satisfaction surveys, and career trajectory data
- Scoring model refinement: Use real-world outcome data to update dimension weights and feasibility thresholds
- Market data integration: Real-time job posting data to update demand signals and compensation ranges
- Regional intelligence: Location-specific recommendations based on local job market conditions

---

## 15. Migration from v1 to v2

Existing v1 user profiles cannot be directly mapped to v2 schemas — the data models are too different. However, a migration strategy exists:

**For users with v1 profiles:**
1. Existing profile is preserved as an archive
2. User is invited to complete a "v2 Bridge Assessment" — a shortened version (35 questions) that fills the new schema fields not captured by v1
3. Skills and interests from v1 are imported as "claimed" tier data (lower confidence, pending verification)
4. Users are shown side-by-side: "Your original results vs. what the new system suggests — here's what changed and why"

**For new users:**
Full v2 assessment from the start. No v1 data.

---

## 16. Summary: What Changes, and Why

| Dimension | Current System (v1) | This System (v2) |
|---|---|---|
| **Assessment depth** | 8 questions | 85–118 questions across 7 structured phases |
| **Question types** | Primarily multiple-choice | Scenario-based, trade-off, open-text, behavioral |
| **Skills model** | Flat checkbox list | 4-tier verified inventory (claimed → demonstrated → implied → confirmed) |
| **Interest mapping** | Keyword selection | Three-axis semantic mapping + inferred Holland Code |
| **Values assessment** | Flat list selection | Forced-choice trade-off scenarios revealing true value hierarchy |
| **Psychological fit** | Not measured | 8-dimensional cognitive vector + 6-dimensional motivation profile |
| **Constraint model** | Penalty trigger | Classified by type, severity, permanence, addressability; advantage detection |
| **Career data depth** | ~10 fields per career | 45+ fields including trajectory, culture, psychological fit, entry reality, relationships |
| **Career relationships** | None | Full navigable graph with bridge, pivot, and adjacency edges |
| **Scoring dimensions** | 6, static weights | 9 dimensions, dynamic weights adjusted per life stage and urgency |
| **Scoring methodology** | Sum of dimension scores | 3-pass: feasibility gate → multi-dimensional scoring → synthesis with confidence adjustment |
| **Output format** | Sorted list with label + 1 reason | Tiered career intelligence report with personalized reasoning |
| **Gap analysis** | Not present | Structured, time-estimated, resource-linked per critical skill and portfolio requirement |
| **Hiring guidance** | Not present | Full Hiring Readiness Module with resume signals, portfolio briefs, interview prep curriculum |
| **Trust mechanisms** | Score with label | Transparent reasoning, Challenge Mode, confidence intervals, real-world calibration |
| **Adaptivity** | One-time snapshot | Living profile with milestone tracking, delta assessments, feedback loops |
| **Career count** | 27 | 75 (v2 launch) → 150+ (v3 target) |
| **User re-engagement** | None | 90-day prompts, 6/12-month delta assessments, progress tracking |
| **Ethical framework** | Implicit | Explicit: anti-bias architecture, honest difficulty commitment, data ethics policy |

---

> The difference between v1 and v2 is the difference between handing someone a compass that points in a general direction and handing them a map — detailed, honest about difficult terrain, showing multiple routes, and updating as the territory changes.
>
> Career decisions compound over time. A well-made early choice opens better choices. A poorly-made choice — or worse, a choice made without confidence — costs years. This system is designed to make that choice the most informed, well-reasoned, and honestly supported decision a person can make.

---

*Life-Compass System Architecture v2.0*
*For review and implementation planning*
