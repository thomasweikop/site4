# NIS2 test + specialistoverblik — præcis build brief til Codex (v4)

## Hvad der skal bygges
Byg en dansk webapp i Next.js App Router, hvor en virksomhed tager en kort NIS2-test og får:
1. en resultatside med tekst om fortsatte huller i compliance
2. to valg:
   - få overblik over specialister
   - få spørgsmål til de ansvarlige i virksomheden
3. en stor specialistmatrix
4. en side med anbefalede eksperter
5. en side med opfølgende spørgsmål per svagt område

Appen skal føles som et beslutningsværktøj for ledelse / IT / compliance — ikke som en consumer quiz.

## Fast kernecopy på resultatsiden
Headline:
**Ud fra dine besvarelser virker det til, at der fortsat er huller i virksomhedens NIS2 compliance.**

Intro:
**De største risici ligger indenfor følgende områder:**
- top_area_1
- top_area_2
- top_area_3

CTA A label:
**Få overblik over specialister der kan hjælpe med at sikre fuld compliance**
CTA A button:
**Fortsæt**

CTA B label:
**Spørgsmål til de ansvarlige i virksomheden**
CTA B button:
**Fortsæt**

## Routes
- `/` landing page
- `/test` 10 spørgsmål
- `/result/[sessionId]` resultatside
- `/specialister/[sessionId]` stor leverandørmatrix
- `/anbefalede-eksperter/[sessionId]` top 3-5 eksperter
- `/sporgsmal-til-ansvarlige/[sessionId]` 5 spørgsmål pr. svagt område
- `/for-partners` partner-side
- `/admin/vendors` intern vedligeholdelse

## Stack
- Next.js 14+ App Router
- TypeScript
- Tailwind
- Supabase Postgres
- Server actions eller route handlers til scoring og ranking

## Datamodel
### table: test_sessions
- id uuid primary key
- company_name text null
- company_size text null
- sector text null
- created_at timestamptz default now()

### table: test_answers
- id uuid primary key
- session_id uuid references test_sessions(id)
- question_id text
- answer_value int
- answer_label text

### table: vendors
Importér alle rækker fra CSV-filen `nis2_vendor_area_matrix_real_v4.csv`.
Felter skal mindst inkludere:
- company
- primary_type
- secondary_types
- size_fit
- sector_fit
- price_band
- qualification_score_initial
- governance
- technical
- operational
- compliance
- granular capability columns
- blocker_risk_assessment
- blocker_incident_response
- blocker_mfa_access
- website
- best_for
- recommended_role
- adjacent_types

## Testspørgsmål
Brug præcis disse 10 spørgsmål og vægte:
- Q1: Er der en navngiven ansvarlig for cybersikkerhed / NIS2 med ledelsesopbakning? (vægt 1.5)
- Q2: Har virksomheden godkendte informationssikkerhedspolitikker og standarder, som revideres mindst én gang årligt? (vægt 1.0)
- Q3: Er der gennemført en dokumenteret cyber-risikovurdering inden for de seneste 12 måneder? (vægt 2.0)
- Q4: Vurderer I kritiske leverandører og vedligeholder dokumenterede sikkerhedskrav og due diligence? (vægt 1.5)
- Q5: Har I en incident response-proces, rapporteringsflow og navngivne roller for større hændelser? (vægt 2.0)
- Q6: Bliver kritiske systemer logget og overvåget centralt med alarmering? (vægt 1.5)
- Q7: Er MFA tvunget på kritiske systemer, og er privilegeret adgang kontrolleret? (vægt 2.0)
- Q8: Vedligeholder I et overblik over kritiske aktiver, systemer, konti og ejere? (vægt 1.5)
- Q9: Får medarbejdere løbende security awareness og rollebaseret træning? (vægt 1.0)
- Q10: Tester I backup, recovery, continuity og nøglekontroller mindst én gang årligt? (vægt 1.5)

## Scoring
Svarskala:
- Nej = 0
- Delvist = 5
- Ja = 10

Beregning:
- overall_score = vægtet gennemsnit af alle 10 spørgsmål
- governance_score = vægtet gennemsnit af Q1,Q2,Q3
- technical_score = vægtet gennemsnit af Q6,Q7,Q8
- operational_score = vægtet gennemsnit af Q5,Q9,Q10
- compliance_score = vægtet gennemsnit af Q3,Q4,Q5,Q10

Kritiske blockers:
- Q3 mangler = risk assessment blocker
- Q5 mangler = incident response blocker
- Q7 mangler = MFA / privileged access blocker

Risk bands:
- 0-39 = Kritisk
- 40-59 = Høj
- 60-79 = Moderat
- 80-100 = Lav

Vigtigste områder:
- sorter de 4 dimensionsscores stigende
- tag de 3 laveste som `topAreas`

## Flow A: specialister
På `/specialister/[sessionId]` vis en stor tabel:
- rækker = leverandører
- kolonner = dimensioner og granular områder
- brug `●` i celler hvor leverandøren er stærk
- tilbyd filtrering på:
  - primary type
  - company size
  - sector
  - kun anbefalede til mine topområder

Kolonner der skal vises:
- Company
- Primary_type
- Governance
- Technical
- Operational
- Compliance
- Governance & ansvar
- Politikker & dokumentation
- Risikovurdering
- Leverandørstyring
- Incident response
- Logging & monitorering
- Identity / MFA / PAM
- Asset- og adgangsoverblik
- Træning & awareness
- Backup / recovery / continuity
- Audit / assurance
- Website

Der skal være en tydelig CTA:
**Anbefalede eksperter**

## Rankinglogik til anbefalede eksperter
Implementér funktionen `rankVendorsForSession(sessionId)`.

### Step 1
Find top 3 svage områder ud fra dimensionsscores.

### Step 2
Oversæt topområder til preferred vendor types:
- Governance -> Legal, GRC
- Technical -> Technical, SOC
- Operational -> SOC, Technical
- Compliance -> GRC, Audit

Adjacent types:
- Legal -> Audit, GRC
- GRC -> Legal, Audit, Technical
- Technical -> SOC, GRC
- SOC -> Technical
- Audit -> GRC, Legal

### Step 3
Beregn delscorer
- type_fit = 100 ved primary type i preferred types, 75 ved adjacent type, ellers 0
- area_fit = (antal matchede areas blandt topområder og granular blocker-relaterede områder / antal relevante user areas) * 100
- size_fit = 100 hvis vendor size_fit tydeligt matcher session.company_size; 70 hvis delvist; ellers 40
- sector_fit = 100 hvis vendor sector_fit indeholder session.sector eller 'Cross-sector'; 70 hvis ukendt mulig match; ellers 40
- blocker_fit = 100 hvis session har blocker og vendor har tilsvarende blocker-kolonne = ●; ellers 0
- qualification_score_initial = brug værdien fra vendor-rækken

### Step 4
Beregn:
`fit_score = 0.45*qualification_score_initial + 0.20*type_fit + 0.15*area_fit + 0.10*size_fit + 0.05*sector_fit + 0.05*blocker_fit`

### Step 5
Sortér faldende og returnér top 3-5 vendors.

## Flow B: spørgsmål til de ansvarlige
På `/sporgsmal-til-ansvarlige/[sessionId]` vis 5 spørgsmål per dimension med score < 70.
Spørgsmålene findes i build spec JSON og Excel-arket `Followups`.

## Komponenter der skal laves
- `LandingHero`
- `QuestionCard`
- `ProgressBar`
- `ResultSummary`
- `TopAreasList`
- `PrimaryChoiceCards`
- `VendorMatrixTable`
- `RecommendedExpertsList`
- `FollowupQuestionsList`
- `PartnerCTA`

## UX-krav
- dansk default sprog
- seriøs B2B tone
- ingen konfetti / quiz-følelse
- tydelig forskel på resultat, specialistoversigt og anbefalede eksperter
- tabellen skal være scroll-bar venlig og brugbar på laptop

## Acceptance criteria
- 10 spørgsmål virker end-to-end
- resultatsiden viser korrekt headline og top 3 områder
- flow A viser matrix og kan føre videre til anbefalede eksperter
- flow B viser 5 spørgsmål pr. relevant område
- anbefalede eksperter sorteres efter fit_score
- appen kan importere vendor CSV direkte
- alt copy er på dansk
