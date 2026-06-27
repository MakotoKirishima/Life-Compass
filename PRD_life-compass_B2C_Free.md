# Life Compass
## Mature Product Requirements Document
### PRD v4.1 - B2C-Only / Free-First
**Indonesia-first consumer career direction companion**

---

### Document Metadata
| Metadata Field | Details |
| :--- | :--- |
| **Version** | 4.1 Mature Draft |
| **Date** | 2026-06-10 |
| **Product** | Life Compass |
| **Market** | Indonesia-first consumer product |
| **Business Model** | B2C only |
| **Status** | Ready for validation, not ready for full-scale build |

*Prepared for product, business, design, engineering, and research review.*

---

## 1. Executive Summary
Life Compass is an Indonesia-first AI-assisted career decision companion for individual users who feel uncertain about what to study, what job to pursue, or how to adapt as technology changes the labor market. The product helps users convert confusion into a realistic Direction Map and low-risk career experiments.

This version intentionally removes all institutional, enterprise, employer, campus-dashboard, HR-dashboard, and team-management directions. Life Compass should not depend on institutional sales, long sales cycles, or organization-level dashboards. The product should win first as a consumer product: one person comes in confused, receives useful direction, and takes a clearer next step.

### Mature Positioning
Life Compass helps individuals turn career confusion into a testable direction by combining self-reflection, structured assessment, local career evidence, and small real-world experiments. The product should not be positioned as a job board, a clinical psychological tool, a static personality test, a coaching agency, or a prediction engine that claims to know someone's perfect future. It is a career decision support product.

The most important business correction in this version is that the free option must be useful on its own. A weak free tier creates distrust. A strong free tier creates trust, organic sharing, user data for product learning, and a realistic conversion path to paid reports or guided support.

---

## 2. Core Decisions in v4.1

### 2.1 B2C-Only Direction
Life Compass is built for individual users only. The product will not include institutional dashboards, employer dashboards, organization analytics, staff/team skill mapping, school admin dashboards, HR workflows, or enterprise reporting. This matters because a consumer product and an institutional product require different product design, pricing, data permissions, sales motion, legal risk, and support operations. Mixing both too early would make the MVP unfocused.

### 2.2 Free Option Is Mandatory
The free product must solve a real small problem. It should not only say "pay to see your result." Users need to feel helped before they trust Life Compass with personal data or money.

The free option should provide:
1. A short Discovery Journey
2. A basic personal pattern summary
3. One recommended direction
4. One exploration direction
5. A simple 7-day experiment
6. Save/share access with sensitive details hidden
7. Limited weekly check-in

Paid features should deepen the result, not hold the entire value hostage.

### 2.3 Subscription Comes Later
Career confusion is often episodic. Many users need a report and action plan once, then return later only if the product creates ongoing value. Therefore, the first paid product should be a one-time Full Compass Report or optional guided review, not a subscription-first model. Subscription should launch only after repeated usage is proven through weekly check-ins, experiment tracking, updated career confidence, and saved career plans.

### 2.4 Market Claims Must Be Source-Grounded
AI can summarize, explain, and personalize. AI must not invent market facts. Any claim about salary, job demand, AI exposure, required skills, education routes, or entry difficulty must come from a maintained career evidence database with source notes and last-reviewed dates.

### 2.5 Privacy Claims Must Be Honest
Do not claim full end-to-end encryption if server-side AI analysis needs to read private input. The MVP should promise encryption in transit, encryption at rest, field-level protection for sensitive text, deletion/export controls, minimal retention, and no third-party AI training without explicit opt-in.

---

## 3. Product Vision

### 3.1 Vision Statement
To become Indonesia's most trusted consumer career direction companion for people who need clarity in a fast-changing work environment.

### 3.2 Mission Statement
Help individuals understand themselves, compare realistic career directions, and take small evidence-based steps before making expensive education or career decisions.

### 3.3 Product Philosophy
Career decisions are not solved by one test. A mature career decision needs three types of evidence:
1. **Self evidence**: Interests, values, strengths, constraints, motivation, identity, preferred work style, and life context.
2. **Market evidence**: Common tasks, skill requirements, entry routes, salary notes, AI exposure, education requirements, and local opportunity signals.
3. **Experiment evidence**: Small real actions, such as interviewing someone in the field, trying a mini-project, reading job posts, taking a short course sample, or discussing the direction with family.

Life Compass should combine those inputs into a living Direction Map for the individual user.

---

## 4. Problem Statement

### 4.1 User Problem
Many people do not know what direction to choose. Students fear choosing the wrong major. Fresh graduates feel behind their peers. Workers may feel trapped in paths they no longer believe in. Career switchers want to move but fear losing what they have already built.

The deeper problem is not only lack of information. The deeper problem is lack of interpretation. Users are not only asking: *"What jobs are available?"* They are asking:
* "What fits me?"
* "What can I realistically enter?"
* "What will still be relevant?"
* "What should I do this week?"
* "How do I know whether this path is real or just fantasy?"
* "How do I explain this choice to my parents?"
* "How do I move without wasting what I already studied or built?"

### 4.2 Existing Solution Gaps
Existing solutions are fragmented:
* **Career tests** give labels but often stop before concrete action.
* **Job boards** show jobs but assume the user already knows the target role.
* **Coaching** can be useful but is expensive and inconsistent. Generic AI chat can answer questions but does not build a structured decision history.
* **Education platforms** recommend courses but often start from "what to learn," not "why this path fits this person."
* **Personality tests** are easy to share but often oversimplify identity and career fit.

### 4.3 Product Opportunity
Life Compass can own the space between "career test" and "career action." The opportunity is to help individuals:
1. Clarify direction
2. Compare options
3. Test options cheaply
4. Adjust direction over time
5. Avoid expensive wrong commitments

---

## 5. Market Reality Check

### 5.1 Strategic Reality
The Indonesia market is large, mobile-first, price-sensitive, and trust-sensitive. A mature consumer product should avoid premium Western SaaS pricing assumptions. Users may pay, but only after they see concrete value.

The strongest wedge is not "AI career intelligence for everyone." That is too broad. The wedge should be: **A 10-minute Direction Map for people who are confused about study, work, or career transition.**

### 5.2 Important Assumptions to Validate
The PRD should not assume these are already true:
1. Users will complete a long 25-30 minute assessment.
2. Users will trust AI with sensitive career anxiety immediately.
3. Users will pay monthly for career guidance without repeated use.
4. Users want a community before they trust the core result.
5. Users believe "AI disruption" messaging is helpful rather than anxiety-inducing.
6. A broad career database is useful if individual recommendations are not clearly explained.

### 5.3 Consumer Trust Requirements
The product must earn trust by being transparent. Each recommendation should explain:
* Why the direction fits
* What evidence is missing
* What risks exist
* What the user can test cheaply
* What assumptions may be wrong

The product should feel like a careful analyst, not a fortune teller.

---

## 6. Target Users and Segmentation
Life Compass should focus only on individual users. Each persona below represents a consumer, not an organization.

### 6.1 Primary Persona A: Rina - Confused Student
* **Age**: 17-22
* **Situation**: Choosing a major, questioning current major, or pressured by family.
* **Pain**: Afraid of choosing wrong and wasting time or money.
* **Willingness to Pay**: Low personally; may pay for a low-cost report if the free result feels useful.
* **Acquisition Channels**: TikTok, Instagram, SEO, student communities, creator content, shareable reports.
* **Best Product Promise**: *"Find 2-3 realistic directions before choosing your path."*

### 6.2 Primary Persona B: Bagus - Early-Career Confused Worker
* **Age**: 22-29
* **Situation**: Working, job searching, or recently graduated but unsure about direction.
* **Pain**: Overwhelmed by options, compares self with peers, unsure how AI affects jobs.
* **Willingness to Pay**: Medium if output is practical and connected to action.
* **Acquisition Channels**: TikTok, Instagram, LinkedIn, X, job-seeker groups, alumni communities.
* **Best Product Promise**: *"Turn career confusion into a 7-day experiment plan."*

### 6.3 Secondary Persona C: Dian - Career Switcher
* **Age**: 30-40
* **Situation**: Has experience but wants to switch without starting from zero.
* **Pain**: Sunk cost, family responsibility, income risk, fear of being too late.
* **Willingness to Pay**: Higher than students if transition plan is realistic.
* **Acquisition Channels**: LinkedIn, newsletters, professional communities, long-form content.
* **Best Product Promise**: *"Map safer transition paths using your existing skills."*

### 6.4 Secondary Persona D: Sari - Career Grower
* **Age**: 25-35
* **Situation**: Not lost, but wants to grow faster.
* **Pain**: Needs skill gap clarity and next-role direction.
* **Willingness to Pay**: Medium-high for measurable career benefit.
* **Acquisition Channels**: LinkedIn, upskilling communities, career creators, SEO.
* **Best Product Promise**: *"Know what skills to build for your next role."*

### 6.5 MVP Priority
The MVP must prioritize Rina and Bagus only. Dian and Sari can be supported by the same system later, but they should not drive the first build.

| Priority | Persona | Reason |
| :--- | :--- | :--- |
| **P0** | Rina | High emotional pain, strong shareability, strong need for low-cost clarity |
| **P0** | Bagus | Strong urgency, stronger willingness to pay, practical action focus |
| **P1** | Dian | Higher value but needs more nuanced transition logic |
| **P1** | Sari | Useful expansion after skill-gap engine matures |

---

## 7. Competitive Landscape

### 7.1 Competitor Categories
Life Compass has many adjacent competitors. It should not claim that no similar solution exists.

| Category | Examples | Strength | Gap Life Compass Can Target |
| :--- | :--- | :--- | :--- |
| **Career/major planning platforms** | Rencanamu, Aku Pintar, Quipper Campus | Local student relevance, tests, education choices | More personal, action-based, and ongoing direction map |
| **Personality/career tests** | 16Personalities, Truity, CareerExplorer | Easy to use, familiar frameworks, shareable | Often static, less local, less action-oriented |
| **Job/career readiness tools** | Kinobi, job portals, CV tools | Useful when user already knows target role | Less focused on pre-decision confusion |
| **Career advice content** | YouTube, TikTok, newsletters, blogs | Free and accessible | Fragmented, not personalized, no memory |
| **Generic AI chat** | ChatGPT and similar tools | Flexible answers | No structured profile, source quality varies, no productized journey |
| **Online learning platforms** | Coursera, Skill Academy, Udemy | Learning supply | Course-first rather than decision-first |

### 7.2 Competitive Positioning
The stronger claim is: **Life Compass is an Indonesia-first B2C career decision companion that combines personal context, career evidence, and low-risk experiments into a living Direction Map.**

### 7.3 Defensible Differentiation
Life Compass should differentiate through:
1. Consumer-first Indonesian context
2. Low-friction free Direction Snapshot
3. Explanation-based recommendations
4. Small career experiments
5. Personal decision history
6. Family discussion support
7. Source-grounded career evidence
8. Honest privacy and safety practices

The moat should not be "AI." AI can be copied. The moat should be trusted consumer experience, local career evidence, user decision memory, and experiment feedback loops.

---

## 8. Product Positioning

### 8.1 Category
AI-assisted career direction and transition planner for individual consumers.

### 8.2 Core Promise
Get a useful first Direction Map for free, then unlock deeper guidance when you are ready.

### 8.3 Recommended Taglines
1. *"From career confusion to your next clear step."*
2. *"Find your direction before choosing your path."*
3. *"A living career map for a changing world."*
4. *"Not just a test. A direction system."*

### 8.4 Claims to Avoid
Do not claim:
* "We predict your perfect career."
* "AI knows what you should do."
* "This result is scientifically definitive."
* "This career is safe from AI forever."
* "No competitor exists."
* "Your data is end-to-end encrypted" unless the architecture truly supports it.
* "Real-time market intelligence" if the product only uses manual summaries.

---

## 9. Product Principles

### 9.1 Free Value Before Monetization
The free experience must create trust. The user should leave with something useful even if they never pay. A free user should be able to say: *"I still learned one direction worth testing and what I should do next."*

### 9.2 Evidence Over Certainty
Each recommendation must explain the evidence behind it. The product should use confidence levels, not fake precision.
* **Bad**: *"You are a 97% match for Product Designer."*
* **Good**: *"Product Design is a medium-high fit because your profile shows interest in problem-solving, visual structure, and user empathy. The biggest risk is high entry-level competition, so test it with one mini case study first."*

### 9.3 Action Over Insight
A report is not enough. The output must lead to action. Example actions:
* Read three job posts and list repeated skills
* DM one person in the field
* Try a 60-minute mini-project
* Compare two learning routes
* Discuss one direction with family using a prepared script

### 9.4 Progressive Disclosure
The first useful result should appear in 8-12 minutes. Deeper discovery can be optional after the first result.

### 9.5 Local Context First
The product must account for Indonesian realities:
* Family expectations
* Financial constraints
* Education access
* City/location
* Remote-work feasibility
* Credential requirements
* Language ability
* Informal and freelance opportunities
* Salary realism

### 9.6 Privacy by Design
Collect only what is needed. Explain why each sensitive field is asked. Give the user delete/export controls.

---

## 10. MVP Scope

### 10.1 MVP Goal
Validate whether individual users will complete a short structured journey, trust the result, and start at least one career experiment within 7 days.

### 10.2 MVP Name
Life Compass MVP: Direction Map

### 10.3 MVP User Outcome
A user should finish the MVP with:
1. A personal pattern summary
2. One free recommended direction
3. One free exploration direction
4. A simple skill-gap note
5. A 7-day experiment plan
6. An option to unlock the full report

### 10.4 MVP In Scope
| Feature | Included? | Free or Paid | Notes |
| :--- | :--- | :--- | :--- |
| **Google login** | Yes | Free | Email optional |
| **Fast Discovery Journey** | Yes | Free | 8-12 minutes |
| **Basic Direction Snapshot** | Yes | Free | One main direction + one exploration direction |
| **7-day experiment** | Yes | Free | Core free value |
| **Save/share snapshot** | Yes | Free | Sensitive details hidden |
| **Weekly check-in** | Yes | Free limited | One active check-in cycle |
| **Career evidence cards** | Yes | Free limited / Paid full | Free sees summary, paid sees deeper evidence |
| **Full Compass Report** | Yes | Paid | One-time payment first |
| **PDF export** | Yes | Paid | Optional paid feature |
| **Family discussion script** | Yes | Paid add-on / Full Report | Strong local value |
| **Guided async review** | Later | Paid per use | Not a subscription bundle |
| **Subscription** | Later | Paid | Only after retention is proven |

### 10.5 MVP Out of Scope
* Native iOS/Android app
* Job application portal
* Formal psychological diagnosis
* Clinical mental health analysis
* Employer or team assessments
* Organization dashboards
* Institution-level analytics
* Large anonymous community
* Unlimited AI chat
* Fully automated real-time labor market intelligence
* Guaranteed career-fit claims

---

## 11. Free Option Strategy

### 11.1 Why Free Must Exist
Free access is not only generosity. It is a trust and growth mechanism. A career product asks for sensitive personal information. Users must first see that the product is safe, useful, and not manipulative. A useful free experience also increases sharing and organic growth.

### 11.2 Free Tier: Direction Snapshot
* **Price**: Rp0
* **Target**: First-time users, students, fresh graduates, skeptical users.
* **Goal**: Give useful clarity without overwhelming cost or friction.

Free users get:
1. Fast Discovery Journey
2. Basic personal pattern summary
3. One recommended direction
4. One exploration direction
5. One "why this fits" explanation
6. One "watch out" risk
7. One 7-day experiment plan
8. One saved report snapshot
9. Shareable direction card
10. One weekly check-in cycle

### 11.3 Free Tier Limits
Limits should be clear and fair:
* Only one full recalculation per month.
* Only one saved Direction Snapshot.
* Limited career evidence details.
* Limited check-in history.
* No PDF export.
* No 30-day roadmap.
* No advanced skill-gap analysis.
* No guided review.

The free tier should not hide the entire result. It should hide depth, not usefulness.

### 11.4 Free-to-Paid Upgrade Moment
Upgrade prompts should appear only after value is delivered.

**Good upgrade moments:**
* After the user saves a direction
* After the user starts a 7-day experiment
* When the user wants to compare all top directions
* When the user wants a PDF or family discussion script
* When the user wants a 30-day transition plan

**Bad upgrade moments:**
* Before showing any result
* Immediately after login
* After collecting sensitive information but before showing value

---

## 12. Monetization Strategy - B2C Only

### 12.1 Pricing Philosophy
The product should start with low-friction consumer purchases. One-time paid reports are easier to understand than subscriptions, especially when the user's need is episodic.

### 12.2 Phase 1 Pricing
| Product | Price | Type | Why |
| :--- | :--- | :--- | :--- |
| **Direction Snapshot** | Rp0 | Free | Builds trust and acquisition |
| **Full Compass Report** | Rp29,000-49,000 | One-time | Low-friction first revenue |
| **Family Discussion Pack** | Rp19,000-29,000 | One-time add-on | Helps Indonesian parent/family pressure |
| **30-Day Career Experiment Plan** | Rp29,000-49,000 | One-time add-on | Action-focused upgrade |
| **Guided Async Review** | Rp49,000-99,000 | Per use | Cost-controlled human support |
| **Guided Live Session** | Rp149,000-299,000 | Per session | Optional, not bundled |

### 12.3 Phase 2 Subscription
Subscription should be added only if repeated usage is proven.

| Tier | Price | Launch Condition | Features |
| :--- | :--- | :--- | :--- |
| **Compass Free** | Rp0 | Always available | Direction Snapshot, one saved direction, one 7-day experiment |
| **Compass Plus** | Rp39,000-59,000/month | W4 retention >15-20% | Recalculation, check-in history, expanded career cards, saved plans |
| **Compass Premium** | Rp99,000-149,000/month | Strong repeated usage | Monthly AI-assisted review, advanced skill gap, updated roadmap |

### 12.4 What Not to Sell
Do not sell:
* Organization dashboards
* Employer reports
* User data
* Team analytics
* Institutional packages
* Private journal insights to third parties

### 12.5 Revenue Model Logic
The first revenue target should be realistic:
* 1,000 completed free Direction Snapshots
* 2-5% Full Report conversion
* Rp29,000-49,000 price point
* 20-50 paid reports from the first 1,000 completions
* Guided review as optional higher-ticket purchase

This is smaller than a subscription fantasy, but it provides real validation.

---

## 13. User Experience Requirements

### 13.1 Core User Flow
Landing Page $ightarrow$ Continue with Google / Email $ightarrow$ Fast Discovery Journey $ightarrow$ Basic Direction Snapshot (Free) $ightarrow$ Choose one direction to explore $ightarrow$ Receive 7-day experiment $ightarrow$ Save/share snapshot $ightarrow$ Optional: Unlock Full Compass Report / Optional: weekly check-in

### 13.2 Fast Discovery Journey
The journey should take 8-12 minutes and include:
1. **Situation Check**: Student, fresh graduate, working, switching, returning.
2. **Interest Signals**: Activities the user enjoys, tolerates, and avoids.
3. **Work Values**: Income stability, creativity, impact, autonomy, prestige, remote flexibility, growth, social interaction.
4. **Strength Evidence**: Skills and examples.
5. **Constraints**: Location, budget, education level, time, family pressure, risk tolerance.
6. **Short Reflection**: *"What makes you feel stuck right now?"*

### 13.3 Free Direction Snapshot UX
The free result should show:
1. "Your current pattern" summary
2. One recommended direction
3. One exploration direction
4. Why it fits
5. What to watch out for
6. One concrete 7-day experiment
7. One confidence explanation
8. CTA to save or unlock full report

### 13.4 Full Compass Report UX
The paid report should unlock:
1. Top 3 direction cards
2. Exploration/stretch path
3. Skill gap analysis
4. Reality check
5. Career evidence notes
6. 30-day roadmap
7. Family discussion script
8. PDF export
9. Updated check-in recommendations

### 13.5 Report Tone
Tone must be clear, grounded, non-judgmental, non-clinical, and practical.
* **Bad**: *"You are destined to become a founder."*
* **Good**: *"Entrepreneurship may be worth exploring because you show high autonomy preference and comfort with uncertainty. The risk is income instability, so the first experiment should be a small project or freelance test, not quitting your job immediately."*

---

## 14. Functional Requirements

### F-01 Authentication and Account
* **Priority**: P0
* **Description**: Users can sign in, save profile, and revisit reports.
* **Requirements**:
  * Google OAuth.
  * Email/password optional.
  * JWT access and refresh token.
  * Password reset if email/password enabled.
  * User can delete account.
  * User can export profile/report.
* **Acceptance criteria**:
  * New user can create an account in less than 60 seconds.
  * Returning user can access the previous snapshot.
  * User deletion removes or anonymizes personal data based on retention policy.

### F-02 Fast Discovery Journey
* **Priority**: P0
* **Description**: Structured 8-12 minute assessment and reflection flow.
* **Requirements**:
  * Mobile-first form steps.
  * Save progress.
  * Back/forward navigation.
  * Skip optional questions.
  * Explain why sensitive questions are asked.
  * Completion progress indicator.
* **Acceptance criteria**:
  * Median completion time is under 12 minutes.
  * Result can be generated from required fields.
  * Users can complete the journey on low-end Android devices.

### F-03 Direction Matching Engine
* **Priority**: P0
* **Description**: Matches user profile to career direction records.
* **Requirements**:
  * Hybrid scoring model.
  * Career records include tasks, values, skills, entry route, education requirements, salary notes, demand notes, automation exposure notes, and local context.
  * Score dimensions: Interest fit, value fit, skill adjacency, constraint fit, market viability, learning feasibility, risk tolerance.
  * AI may generate explanation text, but scoring must not be hidden entirely inside an LLM prompt.
* **Acceptance criteria**:
  * Each recommendation includes fit reasons and risks.
  * The system can explain which input influenced the recommendation.
  * The same profile produces stable results unless career data changes.

### F-04 Career Evidence Database
* **Priority**: P0
* **Description**: Structured career database for matching and reports.
* **Requirements**:
  * Seed 200 career records.
  * QA top 80 records for MVP launch.
  * Each career record includes: Title, category, description, common tasks, required skills, optional skills, education pathways, portfolio requirements, entry barriers, salary range notes, local market notes, AI exposure notes, source notes, last updated date.
  * Editor can update records manually.
* **Acceptance criteria**:
  * No recommendation is shown if the career record lacks minimum evidence notes.
  * Career records have last-reviewed metadata.
  * Career data can be updated without frontend redeployment.

### F-05 Free Direction Snapshot
* **Priority**: P0
* **Description**: First useful free output after Discovery.
* **Requirements**:
  * Shows one recommended direction.
  * Shows one exploration direction.
  * Shows short explanation.
  * Shows one risk.
  * Shows one 7-day experiment.
  * Allows save/share.
  * Hides sensitive reflection in share mode.
* **Acceptance criteria**:
  * User can understand the first recommendation within 60 seconds.
  * User receives at least one concrete action without payment.
  * Shared snapshot does not expose private text.

### F-06 Full Compass Report
* **Priority**: P1
* **Description**: Paid deeper report.
* **Requirements**:
  * Unlocks top 3 directions.
  * Unlocks detailed evidence cards.
  * Unlocks skill-gap summary.
  * Unlocks 30-day roadmap.
  * Unlocks family discussion script.
  * Unlocks PDF export.
* **Acceptance criteria**:
  * Payment unlocks instantly after successful webhook.
  * Failed payment does not unlock report.
  * User can still access the free snapshot after failed payment.

### F-07 7-Day Career Experiment Plan
* **Priority**: P0
* **Description**: Turns recommendation into small real-world action.
* **Requirements**:
  * User chooses one direction. System generates a 7-day plan.
  * Tasks must be low-cost and realistic.
  * User can mark tasks complete.
* **Acceptance criteria**:
  * At least 25% of activated users start one experiment within 7 days.
  * Plan is personalized to user constraints.
  * Plan avoids high-cost commitments as first actions.

### F-08 Weekly Check-In
* **Priority**: P1
* **Description**: Lightweight reflection to update confidence.
* **Requirements**:
  * Ask what the user tried.
  * Ask what felt energizing or draining.
  * Ask whether confidence changed.
  * Update direction confidence.
  * Free users get limited check-in history.
* **Acceptance criteria**:
  * Check-in changes confidence state.
  * User can opt out.
  * No clinical labels are used.

### F-09 Payment
* **Priority**: P1
* **Description**: Consumer payments for reports and optional guidance.
* **Requirements**:
  * Midtrans first or payment-provider abstraction.
  * Webhook verification.
  * Payment status tracking.
  * Refund/support handling.
  * Product types: Full Report, add-on pack, guided review, subscription later.
* **Acceptance criteria**:
  * Successful payment unlocks correct product.
  * Duplicate webhook does not duplicate access.
  * Payment failure shows recovery path.

---

## 15. AI and Data Strategy

### 15.1 AI Role
AI should assist with:
* Summarizing reflections
* Explaining recommendations
* Generating personalized action plans
* Rewriting family discussion scripts
* Clustering feedback
* Helping editors maintain career records

AI should **not** be the sole authority for:
* Scoring career fit
* Diagnosing mental health
* Making deterministic life advice
* Inventing job market facts
* Deciding whether someone is employable

### 15.2 Matching Architecture
Use a hybrid model:
1. **Structured scoring**: Deterministic rules and weighted scores.
2. **Embedding similarity**: Compare user narrative and career descriptions.
3. **LLM explanation**: Generate readable report language from structured results.
4. **Source-grounded market notes**: Retrieved from career database.
5. **Confidence calculation**: Based on data completeness, consistency, and market uncertainty.

### 15.3 Example Scoring Inputs
Weights should be configurable.

| Dimension | MVP Weight | Example |
| :--- | :--- | :--- |
| **Interest fit** | 20% | User likes research, writing, design |
| **Work values fit** | 20% | User values autonomy and growth |
| **Skill adjacency** | 20% | User has writing and basic analytics |
| **Constraint fit** | 15% | Can learn online, limited budget |
| **Market viability** | 15% | Demand signal and entry availability |
| **Risk fit** | 10% | Competition, education barrier, AI exposure |

### 15.4 Confidence Language
Avoid fake precision. Do not show "98% match." Use: High fit, Medium fit, Experimental fit, evidence gaps, risk notes.

* **Example**: *"Medium-high fit, but evidence gap: you have not tried a real UX research task yet. Complete the interview-analysis mini-project before committing."*

### 15.5 AI Safety Requirements
* Add disclaimer: *"Life Compass is decision support, not psychological diagnosis or guaranteed career advice."*
* Avoid labels such as "broken," "lazy," or "clinically anxious."
* Replace "cognitive distortion detection" with "thinking pattern signals."
* If user writes self-harm content, show safe crisis guidance and pause normal career analysis.
* Do not infer sensitive attributes unnecessarily.
* Do not sell personal data.
* Do not train third-party models on user input without explicit opt-in.

---

## 16. Data Model

### User
* `id`
* `email`
* `auth_provider`
* `created_at`
* `deleted_at`

### UserProfile
* `user_id`
* `stage`
* `education_level`
* `location`
* `constraints_json`
* `values_json`
* `skills_json`
* `interests_json`
* `risk_tolerance`
* `data_completeness_score`

### ReflectionEntry
* `user_id`
* `text_encrypted`
* `summary`
* `pattern_tags`
* `confidence_delta`
* `created_at`

### CareerPath
* `id`
* `title`
* `category`
* `description`
* `tasks_json`
* `skills_required_json`
* `skills_optional_json`
* `education_paths_json`
* `entry_routes_json`
* `salary_notes`
* `market_notes`
* `ai_exposure_notes`
* `source_notes_json`
* `status`
* `last_reviewed_at`

### CareerMatch
* `user_id`
* `career_path_id`
* `score_json`
* `confidence_level`
* `explanation`
* `risks_json`
* `is_free_visible`
* `created_at`

### ExperimentPlan
* `user_id`
* `career_match_id`
* `plan_json`
* `status`
* `completion_rate`
* `created_at`

### Payment
* `user_id`
* `provider`
* `external_reference`
* `amount`
* `currency`
* `status`
* `product_type`
* `created_at`

### UserEntitlement
* `user_id`
* `product_type`
* `status`
* `starts_at`
* `expires_at`

### Privacy Notes:
* Store raw reflection text separately from summaries.
* Encrypt sensitive text fields.
* Give users delete/export access.
* Use short retention for AI processing logs.
* Do not store private content in analytics events.

---

## 17. Technical Architecture

### 17.1 Recommended Stack
| Layer | Recommendation | Notes |
| :--- | :--- | :--- |
| **Frontend** | Next.js + Tailwind | Mobile-first PWA |
| **Backend** | FastAPI + SQLAlchemy async | Fits Python AI/data workflows |
| **Database** | Managed PostgreSQL | Supabase/Railway/Neon acceptable |
| **Cache/Queue** | Redis or managed queue | Use only when necessary |
| **Object Storage** | S3-compatible | For generated PDFs |
| **AI API** | Pluggable provider interface | Avoid provider lock-in |
| **Embeddings** | Provider-based, cached | Regenerate only when career record changes |
| **Analytics** | PostHog/Plausible or privacy-conscious alternative | Track funnel, not private content |
| **Payment** | Midtrans first or provider abstraction | Support Indonesian payment methods |
| **Hosting** | Vercel frontend + managed backend | Current ARM server is not production infrastructure |
| **CI/CD** | GitHub Actions | Automated tests and deploy |

### 17.2 Infrastructure Reality
The existing ARM64 4-core/1.7GB RAM device should not host production database, Redis, LLM, worker, analytics, and backend together. Use it for internal demos, local experiments, and non-production tests. Production should use managed services to avoid downtime, memory pressure, and data loss.

### 17.3 Cost Control
* Cache career embeddings.
* Generate summaries only when career data changes.
* Use small models for classification and summarization.
* Use templates for report sections.
* Keep free-tier AI calls limited but useful.
* Add monthly quota per free user.
* Batch career database maintenance.

### 17.4 Free Tier Cost Guardrails
Free users should still receive value, but cost must be controlled. Recommended limits:
* One free Direction Snapshot per month.
* One active 7-day experiment.
* One free check-in cycle.
* Report generation uses structured templates plus limited AI text.
* Full LLM-heavy report is paid.

---

## 18. Privacy, Security, and Compliance

### 18.1 Privacy Commitments
Life Compass should commit to:
* Collecting only necessary data
* Explaining why each sensitive field is needed
* Encryption in transit and at rest
* Field-level encryption for private reflections
* User deletion and export options
* Strict internal access control
* No resale of personal data
* No third-party AI training without opt-in

### 18.2 Honest Encryption Wording
Use this wording unless true client-side encryption is implemented:
> *"Sensitive data is encrypted in transit and at rest, protected with strict access controls, and not used to train third-party AI models. Private reflections can be deleted by the user."*

### 18.3 Security Requirements
* OAuth best practices
* CSRF/XSS protection
* Rate limiting and input validation
* Secrets management
* Audit logs for internal admin actions
* Payment webhook signature verification
* Backups and restore testing
* No private content in analytics events or frontend logs

---

## 19. Growth and Go-To-Market - B2C Only

### 19.1 Acquisition Channels
| Channel | Use | Priority |
| :--- | :--- | :--- |
| **TikTok / Instagram** | Emotional pain capture and education | P0 |
| **SEO** | "bingung karir", "bingung jurusan", "career switch" | P0 |
| **Shareable direction cards**| Referral loop | P0 |
| **Creator collaborations** | Trust and reach | P1 |
| **LinkedIn content** | Early-career workers and switchers | P1 |
| **Community discussions** | Organic trust building | P1 |
| **Newsletter** | Retention and education | P2 |
| **Affiliate content** | Course/mentor monetization later | P2 |

### 19.2 Content Strategy
Content should capture real emotional pain and provide practical next steps. Example themes:
* *"3 signs you are choosing a major for your parents, not your future."*
* *"Do not buy a bootcamp before trying this 60-minute task."*
* *"Career switch without starting from zero: map transferable skills."*
* *"AI will change tasks, not all careers equally. Test your direction first."*
* *"How to explain an unconventional career path to your family."*

### 19.3 Referral Mechanics
Free users should be able to share a privacy-safe card. Share formats:
* *"I'm exploring Product Design + UX Research."*
* *"My 7-day experiment: analyze 3 apps and write one mini case study."*
* *"Try your own Direction Map."*

Shared content must never expose private reflection text.

### 19.4 Trust Strategy
Trust assets: Public methodology explanation, sample reports, source notes, privacy commitment, limitations page, refund policy, user control over data, ability to disagree with recommendation.

---

## 20. Success Metrics

### 20.1 North Star Metric
The North Star should measure action, not only report generation:
* **Activated Career Explorers**: Users who complete Discovery, save one Direction Snapshot, and start at least one career experiment within 7 days.

### 20.2 Funnel Metrics
| Stage | Metric | MVP Target |
| :--- | :--- | :--- |
| **Landing** | Visitor $ightarrow$ signup | 5-10% |
| **Onboarding** | Signup $ightarrow$ starts Discovery | 60% |
| **Discovery** | Starts $ightarrow$ completes | 45-60% |
| **Free value** | Completes $ightarrow$ views free snapshot | 90%+ |
| **Activation** | Views snapshot $ightarrow$ saves direction | 50-60% |
| **Action** | Saves direction $ightarrow$ starts experiment | 25-35% |
| **Retention** | D7 return | 20-30% |
| **Retention** | W4 return | 10-20% |
| **Monetization**| Completed snapshot $ightarrow$ paid full report | 2-5% early |
| **Quality** | "Result was useful" | 70%+ |
| **Trust** | "I understand why this was recommended" | 80%+ |
| **Safety** | Critical AI incident | 0 |

### 20.3 Free Tier Metrics
Track: Free completion rate, free snapshot usefulness rating, share rate, save rate, experiment-start rate, upgrade click-through, paid conversion, free user support load, AI cost per free completion.

### 20.4 Product-Market Fit Signals (Before Scaling)
* 40%+ users say they would be very disappointed if Life Compass disappeared.
* 30%+ of completed users start at least one real-world experiment.
* 20%+ D7 return among activated users.
* 10+ qualitative interviews show users changed a decision or avoided a bad commitment.
* Paid conversion exists without heavy discounting.

---

## 21. Roadmap - B2C Only

### Phase 0: Research and Validation (1-2 weeks)
* **Goal**: Validate problem, willingness to pay, and output format before building too much.
* **Deliverables**:
  * 15-25 user interviews
  * Competitor teardown
  * Landing page test
  * Fake-door paid report test
  * 20 manually generated Direction Maps
  * Career database schema
  * Top 80 career path shortlist
  * Free Direction Snapshot prototype
* **Exit criteria**:
  * Users understand the promise.
  * At least 50% of interviewed target users say the output solves a real pain.
  * At least 5-10 users show willingness to pay for deeper report or guided review.

### Phase 1: MVP Direction Map (3-5 weeks)
* **Goal**: Build core Discovery + free Direction Snapshot + 7-day experiment.
* **Deliverables**: Auth, Fast Discovery Journey, Career evidence database, Matching engine v1, Free Direction Snapshot, 7-day experiment plan, Save/share report, Basic analytics, Career editor.
* **Exit criteria**:
  * 100+ users complete Discovery.
  * 45%+ completion rate.
  * 70%+ useful rating.
  * 25%+ experiment-start rate.

### Phase 2: Paid Report and Retention (2-4 weeks)
* **Goal**: Validate willingness to pay and repeated usage.
* **Deliverables**: Payment integration, Full report unlock, PDF export, Weekly reflection check-in, Report update after experiment, Email/WhatsApp reminder, Refund/support process.
* **Exit criteria**:
  * 2-5% paid conversion among completed users.
  * Refund rate under 10%.
  * D7 retention above 20%.

### Phase 3: Career Grower and Skill Gap (4-6 weeks)
* **Goal**: Expand from confused users to growth-oriented consumers.
* **Deliverables**: Skill gap analysis, Learning path recommendation, Course/provider affiliate test, Portfolio/project suggestions, Role transition mapping.
* **Exit criteria**: Users complete learning actions, affiliate or course conversion produces revenue, repeat usage improves.

### Phase 4: Guided Consumer Support (4-8 weeks)
* **Goal**: Add optional human trust without turning the product into a coaching agency.
* **Deliverables**: Guided async review, Mentor marketplace, Consent-based report sharing, Mentor quality policy, Session rating and support path.
* **Exit criteria**: Positive guided review ratings, sustainable margin, low dispute/refund rate.

### Phase 5: Source-Grounded Market Intelligence
* **Goal**: Improve career evidence quality.
* **Deliverables**: Market signal ingestion, Job-posting skill trend summaries, Labor market summaries, Career update alerts, Editorial review workflow, Confidence and freshness labels.
* **Exit criteria**: Market claims are source-backed, users trust and revisit updates, no major hallucinated market claims.

---

## 22. Risk Assessment
| Risk | Impact | Likelihood | Mitigation |
| :--- | :--- | :--- | :--- |
| **Free tier is too weak to build trust** | High | Medium | Provide real Direction Snapshot and 7-day experiment for free |
| **Free tier becomes too expensive** | High | Medium | Use quotas, templates, caching, small models |
| **Overclaiming AI accuracy** | High | High | Use confidence levels, explanations, disclaimers |
| **Low completion due to long onboarding**| High | Medium | 8-12 minute fast journey |
| **Weak willingness to pay** | High | Medium | One-time report first, fake-door test |
| **Privacy concern** | Critical | Medium | Data minimization, encryption, deletion/export |
| **LLM hallucinated career facts** | High | Medium | Source-grounded career database |
| **Competitors copy AI wrapper** | Medium | High | Build local evidence, trust, and action loop |
| **Coaching cost destroys margin** | High | Medium | Per-use marketplace or async review, not bundled live sessions |
| **Mental health misclassification** | High | Medium | Non-clinical language and safety flow |
| **Data quality too low** | High | Medium | QA top 80 paths before showing to users |
| **Product scope becomes unfocused** | High | Medium | Keep consumer-only roadmap until PMF |
| **Server limitations** | High | High | Managed cloud production |
| **Regulatory/data compliance gap** | High | Medium | Privacy readiness from day one |

---

## 23. Critical Decisions
* **Decision 1: Consumer-only focus**: Life Compass is a consumer product. The roadmap must not include institutional dashboards, employer dashboards, team analytics, or organization reporting.
* **Decision 2: Free value is required**: The free Direction Snapshot must be useful enough that users trust the product, share it, and understand what paid depth would add.
* **Decision 3: MVP is a Direction Map, not a full platform**: The first product must prove one thing: can Life Compass help a confused person take a clearer next step within one week?
* **Decision 4: Subscription comes later**: Start with free snapshot, one-time report, and per-use guided support. Launch subscription only after retention is proven.
* **Decision 5: Use source-grounded data**: LLM can summarize and explain, but market claims must come from maintained evidence records.
* **Decision 6: Avoid clinical language**: Use "thinking pattern signals," not diagnostic or therapy-like labels.
* **Decision 7: Do not claim end-to-end encryption unless technically true**: Use honest privacy wording.

---

## 24. Open Questions for Validation
1. Which consumer segment converts better: confused students or early-career workers?
2. Does the free Direction Snapshot feel useful enough to create trust?
3. Which free result format performs best: short card, interactive report, checklist, or WhatsApp-style summary?
4. Will users pay for a Full Compass Report after seeing one free direction?
5. Is the most attractive paid product a report, family script, 30-day plan, or guided review?
6. Does "AI disruption" messaging create useful urgency or harmful anxiety?
7. How much personal context will users share before they trust the product?
8. What is the minimum market evidence users consider credible?
9. What career categories should be in the first 80 QA-approved paths?
10. What support flow is needed when users are emotionally distressed?

---

## 25. MVP Acceptance Checklist
The MVP is ready for beta only when:
* [ ] User can finish Fast Discovery in under 12 minutes.
* [ ] Free Direction Snapshot is available and useful without payment.
* [ ] Free snapshot includes one direction, one exploration direction, one risk, and one 7-day experiment.
* [ ] Top 80 career paths are QA-reviewed.
* [ ] Each recommendation has fit reasons, risks, and next action.
* [ ] No unsupported "real-time market" claim exists.
* [ ] Privacy policy is available.
* [ ] User can delete account/data.
* [ ] Analytics excludes private reflection content.
* [ ] Payment is not required to receive basic value.
* [ ] Full report payment works in test mode.
* [ ] AI output is safety-tested with edge cases.
* [ ] Mobile UX is tested on low-end Android.
* [ ] Editor can update career records without code deployment.
* [ ] Report sharing hides sensitive fields.
* [ ] Support/refund process is documented.
* [ ] Roadmap contains no institutional dashboard or organization analytics.

---

## 26. Recommended Immediate Next Actions
1. Rewrite landing page around "Free Direction Map in 10 minutes."
2. Remove all organization-facing personas, dashboards, and packages.
3. Design the free Direction Snapshot before designing paid reports.
4. Build 20 manual sample reports to test output quality.
5. Interview 15 target users from Rina and Bagus segments.
6. Create top 80 career path list and source template.
7. Replace IRT adaptive quiz with simple scoring for MVP.
8. Add the 7-day experiment as the main free output.
9. Create a fake-door upgrade for Full Compass Report.
10. Define privacy policy and data deletion flow.

---

## 27. Final Mature Product Definition
Life Compass is best defined as: **An Indonesia-first B2C AI-assisted career decision companion that helps confused students, graduates, and career switchers convert uncertainty into a realistic Direction Map and low-risk action experiments.**

The product wins if individual users trust it before making expensive career decisions: choosing a major, buying a course, changing role, resigning, or starting over.

The MVP should prove one thing first: **Can Life Compass help a confused individual take a clearer next step within one week, starting with a genuinely useful free result?**