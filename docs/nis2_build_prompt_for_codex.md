# NIS2 Test + Match Engine — Full Build Plan for Codex

## Product goal

Build a Danish-language web app where a company can:

1. take a short NIS2 readiness test,
2. receive an immediate score across **4 dimensions**,
3. unlock a branded report by email,
4. see **3 ranked provider recommendations** matched to their real gaps.

This is not only a questionnaire. It is a **screening + routing + recommendation engine**.

---

## Recommended stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind
- **Backend:** Next.js server actions or API routes
- **Database:** Supabase Postgres
- **Auth:** optional email capture only in MVP
- **Analytics:** Plausible or GA4
- **Email/report delivery:** Resend or Postmark
- **PDF/report generation:** server-side HTML-to-PDF or React PDF

---

## Core MVP flow

1. Landing page
2. Applicability mini-profile
   - company size band
   - sector
   - direct vs supplier exposure
3. NIS2 test with 10 scored questions
4. Calculate:
   - overall readiness score
   - Governance score
   - Technical score
   - Operational score
   - Compliance score
   - critical blockers
5. Show teaser result page
6. Ask for email/company name to unlock full report
7. Generate full report
8. Show 3 recommended providers with reasons

---

## UX requirements

- Keep test under 3 minutes
- One question per screen or short sectioned flow
- Progress indicator
- Save state locally if user refreshes
- Result screen must feel premium and specific
- Use Danish as default copy

---

## Information architecture

### Public pages

- `/`
- `/test`
- `/result/[sessionId]`
- `/about-nis2`
- `/for-partners`
- `/privacy`

### Admin/internal pages

- `/admin/vendors`
- `/admin/sessions`
- `/admin/report-preview`

---

## Data model (Supabase)

### table: vendors

- id uuid pk
- company_name text
- primary_type text check in ('Legal','GRC','Technical','SOC','Audit')
- secondary_types text[]
- website_url text
- size_fit text
- sector_fit text
- price_band text
- qualification_score_initial int
- best_for text
- recommended_role text
- is_active boolean default true
- created_at timestamptz default now()

### table: test_sessions

- id uuid pk
- created_at timestamptz default now()
- company_name text
- email text
- sector text
- company_size_band text
- exposure_type text
- answers jsonb
- overall_score numeric
- governance_score numeric
- technical_score numeric
- operational_score numeric
- compliance_score numeric
- blockers text[]
- recommended_vendor_types text[]
- report_status text

### table: recommendations

- id uuid pk
- session_id uuid references test_sessions(id)
- vendor_id uuid references vendors(id)
- rank int
- fit_score numeric
- fit_reason text

---

## Applicability profile (not part of readiness score)

Ask before the 10 questions:

1. company size band: 50-249 / 250-999 / 1000+
2. sector: energy / health / transport / digital infra / manufacturing / public / finance-adjacent / other
3. exposure type: directly covered / likely supplier to covered entity / unsure

Use this only for urgency text and vendor ranking.

---

## Scored questionnaire

Use the following answer values:

- No = 0
- Partial = 5
- Yes = 10

Use these questions:

- Q1: Is there a named owner for cybersecurity / NIS2 with executive sponsorship? (weight 1.5)
- Q2: Do you have approved information security policies and standards that are reviewed at least annually? (weight 1.0)
- Q3: Have you completed a documented cyber risk assessment in the last 12 months? (weight 2.0)
- Q4: Do you assess critical suppliers and maintain documented security requirements / due diligence? (weight 1.5)
- Q5: Do you have an incident response process, reporting workflow and named responsibilities for major incidents? (weight 2.0)
- Q6: Are critical systems centrally logged and monitored with alerting? (weight 1.5)
- Q7: Is MFA enforced on critical systems and privileged access controlled? (weight 2.0)
- Q8: Do you maintain an inventory of critical assets, systems, accounts and owners? (weight 1.5)
- Q9: Do employees receive regular security awareness and role-based training? (weight 1.0)
- Q10: Do you test continuity, backups, recovery and key controls at least annually? (weight 1.5)

---

## Scoring algorithm

### Overall score

Weighted average across all 10 questions, normalized to 0-100.

### Dimension formulas

#### Governance

Q1*1.5 + Q2*1.0 + Q3\*2.0

#### Technical

Q6*1.5 + Q7*2.0 + Q8\*1.5

#### Operational

Q5*2.0 + Q9*1.0 + Q10\*1.5

#### Compliance

Q3*1.0 + Q4*1.5 + Q5*1.0 + Q10*1.5

### Critical blockers

Flag these separately:

- Q3 risk assessment
- Q5 incident response
- Q7 MFA / privileged access

If any of these are answered **No**, mark them as blockers in the report.

### Risk bands

- 0-39 = Critical
- 40-59 = High
- 60-79 = Medium
- 80-100 = Low

### Example TypeScript helper

```ts
const answerValue = { No: 0, Partial: 5, Yes: 10 };

function weightedScore(items: { value: number; weight: number }[]) {
  const total = items.reduce((s, i) => s + i.value * i.weight, 0);
  const max = items.reduce((s, i) => s + 10 * i.weight, 0);
  return Math.round((total / max) * 100);
}
```

---

## Matching logic

### Step 1: detect weak dimensions

Any dimension < 60 is a primary gap.

### Step 2: route by gap

- Governance gap -> Legal + GRC
- Technical gap -> Technical + SOC
- Operational gap -> SOC + GRC + Technical
- Compliance gap -> Audit + GRC + Legal

### Step 3: apply blocker routing

- Q3 = No -> ensure at least one Legal or GRC recommendation
- Q5 = No -> ensure at least one SOC or Technical recommendation
- Q7 = No -> ensure at least one Technical or SOC recommendation

### Step 4: rank vendors

Use a blended fit score:

- 45% vendor qualification score
- 20% type fit
- 10% size fit
- 10% sector fit
- 10% blocker fit
- 5% commercial fit

### Type fit scoring example

- exact mapped type = 100
- adjacent type = 75
- useful but secondary = 50
- otherwise = 0

### Output rule

Always return **3 recommendations**:

1. a lead/owner partner (often Legal or GRC),
2. an implementation partner (Technical or SOC),
3. an assurance or validation partner (Audit or Legal/GRC depending on gaps).

---

## Vendor qualification model

Store an internal vendor qualification score from 0-100.
Recommended signal model:

- Has dedicated NIS2 page = 15
- Offers gap assessment / maturity review = 12
- Offers governance / policies / risk register = 10
- Offers supplier security / supply chain support = 8
- Offers incident response planning = 10
- Offers MFA / IAM / access controls = 6
- Offers logging / SOC / MDR = 10
- Offers ISMS / ISO 27001 support = 10
- Offers audit / ISAE / assurance = 10
- Offers training / awareness = 4
- Shows sector expertise = 5

Use this as an admin-editable field, not a hard-coded truth.

---

## Result page structure

### Above the fold

- headline: "Din NIS2-status"
- overall score badge
- one-line urgency statement

### Scorecard

- Governance
- Technical
- Operational
- Compliance

### Critical blockers

Red cards for Q3/Q5/Q7 if No or Partial

### Priority actions

3-6 bullet actions

### Recommended partner types

Explain why these partner types were selected

### Top 3 named providers

For each provider show:

- company name
- provider type
- why they fit this result
- CTA: "Få introduktion"

---

## Report template

### 1. Executive summary

Show score, risk band and 2 highest-priority gaps.

### 2. Applicability snapshot

State whether the company appears directly covered, supplier-exposed or unclear.

### 3. 4-dimension scorecard

Use clear bars and percentages.

### 4. Critical blockers

Explain implications in plain Danish.

### 5. 30/60/90-day plan

- 0-30 days: scope, ownership, risk assessment
- 31-60 days: incident, supplier, logging, MFA actions
- 61-90 days: testing, assurance, reporting and board package

### 6. Recommended providers

Show top 3 with tailored reasons.

### 7. Disclaimer

This is a screening tool and not final legal determination.

---

## Landing page copy skeleton

### Hero

**Er din virksomhed klar til NIS2?**  
Tag testen på 3 minutter og få en konkret rapport med anbefaling af de rigtige partnere.

CTA: `Start testen`

### Trust line

- 3 minutter
- 4 dimensioner
- konkrete anbefalinger
- ingen teknisk jargon

### Section 1

**Få svar på det vigtigste først**

- Er vi sandsynligvis omfattet?
- Hvor store er vores gaps?
- Hvilke partnere har vi faktisk brug for?

### Section 2

**Du får**

- readiness score
- gap-overblik
- 30/60/90-dages plan
- 3 anbefalede leverandører

### Section 3

**Sådan virker det**

1. Besvar 10 spørgsmål
2. Få score og prioriterede gaps
3. Få rapport og anbefalinger

### CTA repeat

`Tag testen nu`

---

## Admin requirements

- CRUD for vendors
- ability to override vendor scores manually
- toggle vendors active/inactive
- preview recommendations for a sample session
- export sessions to CSV

---

## Acceptance criteria

- user can complete test on desktop/mobile
- score calculations are deterministic and test-covered
- result always shows 4 dimensions + 3 recommendations
- blocked states route at least one appropriate vendor type
- admin can update vendor scores without code changes
- report can be regenerated from stored session data

---

## Seed data

Use the attached vendor spreadsheet as the initial seed source.
Import all 125 rows.
Use `primary_type` as the first-level routing anchor.

---

## Important product principle

Do **not** frame this as "get 3 quotes".
Frame it as:
**"Vi vurderer jeres NIS2-parathed og matcher jer med de rigtige specialister."**
