import postgres from "postgres";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type TheplanOutreachLead = {
  vendorKey: string;
  company: string;
  website: string;
  domain: string;
  primaryType: string;
  secondaryTypes: string;
  adjacentTypes: string;
  sectorFit: string;
  sizeFit: string;
  priceBand: string;
  qualificationScoreInitial: number;
  bestFor: string;
  recommendedRole: string;
  bestMatchAreas: string;
  recommendedWhen: string;
  websiteSummaryDa: string;
  websiteSignalTags: string[];
  sourceUrls: string[];
  warmSignalLine: string;
  personalizedOpening: string;
  reasonForOutreach: string;
  suggestedEmailSubject: string;
  suggestedLinkedInOpening: string;
};

export type TheplanContactEnrichment = {
  vendorKey: string;
  company: string;
  website: string;
  domain: string;
  primaryType: string;
  bestFor: string;
  recommendedRole: string;
  genericEmails: string[];
  allEmails: string[];
  phoneNumbers: string[];
  linkedinUrls: string[];
  contactPageUrls: string[];
  titleSnippets: string[];
  homepageScanned: boolean;
  pagesScannedCount: number;
  blockerRiskAssessment: boolean;
  blockerIncidentResponse: boolean;
  blockerMfaAccess: boolean;
  confidence: "high" | "medium" | "low" | "none";
};

export type TheplanWarmSignal = {
  vendorKey: string;
  company: string;
  website: string;
  domain: string;
  primaryType: string;
  qualificationScoreInitial: number;
  bestMatchAreas: string;
  warmSignalTier: "A" | "B" | "C";
  warmSignalScore: number;
  outreachChannel: "email-first" | "linkedin-first" | "manual-research";
  primaryEmail: string;
  primaryLinkedinUrl: string;
  primaryPhone: string;
  contactConfidence: TheplanContactEnrichment["confidence"];
  whyNow: string;
  warmSignalLine: string;
  personalizedOpening: string;
  suggestedEmailSubject: string;
  suggestedLinkedInOpening: string;
};

export type TheplanDraft = {
  vendorKey: string;
  company: string;
  website: string;
  domain: string;
  primaryType: string;
  warmSignalTier: "A" | "B" | "C";
  warmSignalScore: number;
  outreachChannel: "email-first" | "linkedin-first" | "manual-research";
  primaryContact: string;
  contactConfidence: TheplanContactEnrichment["confidence"];
  companyDescription: string;
  reasonToWrite: string;
  firstLineEmail: string;
  suggestedSubject: string;
  emailDraft: string;
  followUpDraft: string;
  linkedInDraft: string;
};

export type TheplanOverride = Partial<
  TheplanOutreachLead &
    TheplanContactEnrichment &
    Pick<
      TheplanWarmSignal,
      | "warmSignalTier"
      | "warmSignalScore"
      | "outreachChannel"
      | "primaryEmail"
      | "primaryLinkedinUrl"
      | "primaryPhone"
      | "contactConfidence"
      | "whyNow"
      | "warmSignalLine"
      | "personalizedOpening"
      | "suggestedEmailSubject"
      | "suggestedLinkedInOpening"
    > &
    Pick<
      TheplanDraft,
      | "primaryContact"
      | "companyDescription"
      | "reasonToWrite"
      | "firstLineEmail"
      | "suggestedSubject"
      | "emailDraft"
      | "followUpDraft"
      | "linkedInDraft"
    >
>;

export type TheplanDataset = {
  leads: TheplanOutreachLead[];
  contacts: TheplanContactEnrichment[];
  warmSignals: TheplanWarmSignal[];
  drafts: TheplanDraft[];
};

type OverrideRow = {
  record_key: string;
  data: TheplanOverride;
  updated_at: string | Date;
  updated_by: string | null;
};

export type TheplanImportChange = {
  vendorKey: string;
  company: string;
  sheets: string[];
  updatedFields: string[];
  fieldDiffs: Array<{
    field: string;
    previousValue: string;
    nextValue: string;
    previousRaw: unknown;
    nextRaw: unknown;
  }>;
};

export type TheplanImportResult = {
  sheetsFound: string[];
  rowsSeen: number;
  changedRecords: number;
  changedFields: number;
  changes: TheplanImportChange[];
};

export const THEPLAN_BASE_FIELDS = [
  "company",
  "website",
  "domain",
  "primaryType",
  "secondaryTypes",
  "adjacentTypes",
  "sectorFit",
  "sizeFit",
  "priceBand",
  "qualificationScoreInitial",
  "bestFor",
  "recommendedRole",
  "bestMatchAreas",
  "recommendedWhen",
  "websiteSummaryDa",
  "websiteSignalTags",
  "sourceUrls",
  "warmSignalLine",
  "personalizedOpening",
  "reasonForOutreach",
  "suggestedEmailSubject",
  "suggestedLinkedInOpening",
] as const;

export const THEPLAN_CONTACT_FIELDS = [
  "genericEmails",
  "allEmails",
  "phoneNumbers",
  "linkedinUrls",
  "contactPageUrls",
  "titleSnippets",
  "confidence",
] as const;

export const THEPLAN_FLOW_FIELDS = [
  "warmSignalTier",
  "warmSignalScore",
  "outreachChannel",
  "primaryEmail",
  "primaryLinkedinUrl",
  "primaryPhone",
  "contactConfidence",
  "whyNow",
  "warmSignalLine",
  "personalizedOpening",
  "suggestedEmailSubject",
  "suggestedLinkedInOpening",
] as const;

export const THEPLAN_TEXT_FIELDS = [
  "primaryContact",
  "companyDescription",
  "reasonToWrite",
  "firstLineEmail",
  "suggestedSubject",
  "emailDraft",
  "followUpDraft",
  "linkedInDraft",
] as const;

const root = process.cwd();
const outreachPath = resolve(root, "exports/theplan_outreach_leads.json");
const contactsPath = resolve(root, "exports/theplan_contact_enrichment.json");

let sqlClient: postgres.Sql | null | undefined;
let schemaPromise: Promise<boolean> | null = null;

function getSql() {
  if (sqlClient !== undefined) {
    return sqlClient;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    sqlClient = null;
    return sqlClient;
  }

  sqlClient = postgres(databaseUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return sqlClient;
}

async function ensureSchema() {
  const sql = getSql();

  if (!sql) {
    return false;
  }

  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`
        create table if not exists superadmin_theplan_overrides (
          record_key text primary key,
          data jsonb not null,
          updated_at timestamptz not null default now(),
          updated_by text null
        )
      `;

      return true;
    })();
  }

  return schemaPromise;
}

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function compact(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function splitPipeList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => compact(String(item)))
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split("|")
    .map((item) => compact(item))
    .filter(Boolean);
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? compact(value) : "";
}

function normalizeNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pickPrimaryEmail(contact: TheplanContactEnrichment) {
  return contact.genericEmails[0] || contact.allEmails[0] || "";
}

function pickPrimaryLinkedin(contact: TheplanContactEnrichment) {
  return contact.linkedinUrls[0] || "";
}

function pickPrimaryPhone(contact: TheplanContactEnrichment) {
  return contact.phoneNumbers[0] || "";
}

function computeWarmSignalScore(
  lead: TheplanOutreachLead,
  contact: TheplanContactEnrichment,
) {
  let score = 0;
  score += Math.min(40, Number(lead.qualificationScoreInitial || 0) / 2);
  if (contact.confidence === "high") score += 30;
  if (contact.confidence === "medium") score += 18;
  if (contact.genericEmails.length > 0) score += 16;
  else if (contact.allEmails.length > 0) score += 10;
  if (contact.linkedinUrls.length > 0) score += 8;
  if (contact.phoneNumbers.length > 0) score += 6;
  return Math.round(score);
}

function classifyWarmSignalTier(score: number): "A" | "B" | "C" {
  if (score >= 75) return "A";
  if (score >= 55) return "B";
  return "C";
}

function classifyOutreachChannel(
  contact: TheplanContactEnrichment,
): "email-first" | "linkedin-first" | "manual-research" {
  if (contact.genericEmails.length > 0 || contact.allEmails.length > 0) {
    return "email-first";
  }
  if (contact.linkedinUrls.length > 0) {
    return "linkedin-first";
  }
  return "manual-research";
}

function buildWhyNow(
  lead: TheplanOutreachLead,
  contact: TheplanContactEnrichment,
) {
  return [
    "Allerede nævnt i ComplyChecks specialistoverblik",
    lead.bestMatchAreas ? `Matcher især ${lead.bestMatchAreas}` : "",
    contact.confidence === "high"
      ? "Kontaktpunkt fundet med høj sikkerhed"
      : contact.confidence === "medium"
        ? "Kontaktspor fundet og klar til første outreach"
        : "Kræver let manuel validering før outreach",
  ]
    .filter(Boolean)
    .join(" | ");
}

function buildDescription(lead: TheplanOutreachLead) {
  if (lead.websiteSummaryDa) {
    return compact(lead.websiteSummaryDa);
  }
  if (lead.bestFor) {
    return compact(lead.bestFor);
  }
  return `${lead.company} indgår i ComplyChecks specialistoverblik relateret til NIS2.`;
}

function buildFirstLine(lead: TheplanOutreachLead) {
  const opening = compact(lead.personalizedOpening || "");
  if (!opening) {
    return `Jeg skriver, fordi ${lead.company} allerede indgår i vores specialistoverblik relateret til NIS2.`;
  }
  return opening.endsWith(".") ? opening : `${opening}.`;
}

function buildEmailDraft(lead: TheplanOutreachLead) {
  return [
    `Hej ${lead.company},`,
    "",
    buildFirstLine(lead),
    "",
    "I er allerede nævnt i ComplyChecks specialistoverblik relateret til NIS2, og vi vil gerne validere, at jeres profil står skarpt for de virksomheder, der søger relevante specialistspor.",
    "",
    lead.bestMatchAreas
      ? `Lige nu matcher vi jer især på: ${lead.bestMatchAreas}.`
      : "",
    lead.websiteSummaryDa
      ? `Vores nuværende læsning er: ${compact(lead.websiteSummaryDa)}`
      : "",
    "",
    "Hvis det giver mening, sender jeg gerne et kort preview af jeres nuværende profil og et forslag til, hvordan den kan styrkes.",
    "",
    "Bedste hilsner",
    "Christian",
    "Team ComplyCheck.dk",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFollowUpDraft(lead: TheplanOutreachLead) {
  return [
    `Hej ${lead.company},`,
    "",
    "Jeg følger lige kort op på min tidligere besked.",
    "I er allerede med i vores specialistoverblik relateret til NIS2, og jeg sender gerne et kort preview, hvis det er relevant.",
    "",
    "Bedste hilsner",
    "Christian",
    "Team ComplyCheck.dk",
  ].join("\n");
}

function buildLinkedInDraft(lead: TheplanOutreachLead) {
  return compact(
    `Hej, jeg skriver kort fordi ${lead.company} allerede indgår i vores specialistoverblik relateret til NIS2. Jeg vil gerne validere, at jeres profil står skarpt og sende et kort preview, hvis det er relevant.`,
  );
}

function applyLeadOverride(
  lead: TheplanOutreachLead,
  override?: TheplanOverride,
): TheplanOutreachLead {
  if (!override) {
    return lead;
  }

  return {
    ...lead,
    company: override.company ?? lead.company,
    website: override.website ?? lead.website,
    domain: override.domain ?? lead.domain,
    primaryType: override.primaryType ?? lead.primaryType,
    secondaryTypes: override.secondaryTypes ?? lead.secondaryTypes,
    adjacentTypes: override.adjacentTypes ?? lead.adjacentTypes,
    sectorFit: override.sectorFit ?? lead.sectorFit,
    sizeFit: override.sizeFit ?? lead.sizeFit,
    priceBand: override.priceBand ?? lead.priceBand,
    qualificationScoreInitial:
      override.qualificationScoreInitial ?? lead.qualificationScoreInitial,
    bestFor: override.bestFor ?? lead.bestFor,
    recommendedRole: override.recommendedRole ?? lead.recommendedRole,
    bestMatchAreas: override.bestMatchAreas ?? lead.bestMatchAreas,
    recommendedWhen: override.recommendedWhen ?? lead.recommendedWhen,
    websiteSummaryDa: override.websiteSummaryDa ?? lead.websiteSummaryDa,
    websiteSignalTags: override.websiteSignalTags ?? lead.websiteSignalTags,
    sourceUrls: override.sourceUrls ?? lead.sourceUrls,
    warmSignalLine: override.warmSignalLine ?? lead.warmSignalLine,
    personalizedOpening: override.personalizedOpening ?? lead.personalizedOpening,
    reasonForOutreach: override.reasonForOutreach ?? lead.reasonForOutreach,
    suggestedEmailSubject:
      override.suggestedEmailSubject ?? lead.suggestedEmailSubject,
    suggestedLinkedInOpening:
      override.suggestedLinkedInOpening ?? lead.suggestedLinkedInOpening,
  };
}

function applyContactOverride(
  contact: TheplanContactEnrichment,
  override?: TheplanOverride,
): TheplanContactEnrichment {
  if (!override) {
    return contact;
  }

  return {
    ...contact,
    genericEmails: override.genericEmails ?? contact.genericEmails,
    allEmails: override.allEmails ?? contact.allEmails,
    phoneNumbers: override.phoneNumbers ?? contact.phoneNumbers,
    linkedinUrls: override.linkedinUrls ?? contact.linkedinUrls,
    contactPageUrls: override.contactPageUrls ?? contact.contactPageUrls,
    titleSnippets: override.titleSnippets ?? contact.titleSnippets,
    confidence: override.confidence ?? contact.confidence,
  };
}

async function listTheplanOverrideRows() {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return [] as OverrideRow[];
  }

  return sql<OverrideRow[]>`
    select
      record_key,
      data,
      updated_at,
      updated_by
    from superadmin_theplan_overrides
    order by updated_at desc
  `;
}

export async function listTheplanOverrides() {
  const rows = await listTheplanOverrideRows();
  return new Map(rows.map((row) => [row.record_key, row.data]));
}

export async function updateTheplanOverride(
  vendorKey: string,
  patch: TheplanOverride,
  actorEmail: string,
) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const existingMap = await listTheplanOverrides();
  const current = existingMap.get(vendorKey) ?? {};
  const merged = {
    ...current,
    ...patch,
  };

  const rows = await sql<OverrideRow[]>`
    insert into superadmin_theplan_overrides (
      record_key,
      data,
      updated_by
    )
    values (
      ${vendorKey},
      ${sql.json(merged)},
      ${actorEmail.trim().toLowerCase()}
    )
    on conflict (record_key) do update
    set
      data = excluded.data,
      updated_at = now(),
      updated_by = excluded.updated_by
    returning
      record_key,
      data,
      updated_at,
      updated_by
  `;

  return rows[0]?.data;
}

function buildWarmSignals(
  leads: TheplanOutreachLead[],
  contacts: TheplanContactEnrichment[],
  overrides: Map<string, TheplanOverride>,
) {
  const contactsByVendorKey = new Map(
    contacts.map((item) => [item.vendorKey, item]),
  );

  return leads
    .map((lead) => {
      const contact = contactsByVendorKey.get(lead.vendorKey)!;
      const override = overrides.get(lead.vendorKey);
      const defaultScore = computeWarmSignalScore(lead, contact);

      return {
        vendorKey: lead.vendorKey,
        company: lead.company,
        website: lead.website,
        domain: lead.domain,
        primaryType: lead.primaryType,
        qualificationScoreInitial: lead.qualificationScoreInitial,
        bestMatchAreas: lead.bestMatchAreas,
        warmSignalTier:
          override?.warmSignalTier ?? classifyWarmSignalTier(defaultScore),
        warmSignalScore: override?.warmSignalScore ?? defaultScore,
        outreachChannel:
          override?.outreachChannel ?? classifyOutreachChannel(contact),
        primaryEmail: override?.primaryEmail ?? pickPrimaryEmail(contact),
        primaryLinkedinUrl:
          override?.primaryLinkedinUrl ?? pickPrimaryLinkedin(contact),
        primaryPhone: override?.primaryPhone ?? pickPrimaryPhone(contact),
        contactConfidence:
          override?.contactConfidence ?? contact.confidence,
        whyNow: override?.whyNow ?? buildWhyNow(lead, contact),
        warmSignalLine: override?.warmSignalLine ?? lead.warmSignalLine,
        personalizedOpening:
          override?.personalizedOpening ?? lead.personalizedOpening,
        suggestedEmailSubject:
          override?.suggestedEmailSubject ?? lead.suggestedEmailSubject,
        suggestedLinkedInOpening:
          override?.suggestedLinkedInOpening ?? lead.suggestedLinkedInOpening,
      } satisfies TheplanWarmSignal;
    })
    .sort((left, right) => right.warmSignalScore - left.warmSignalScore);
}

function buildDrafts(
  leads: TheplanOutreachLead[],
  contacts: TheplanContactEnrichment[],
  warmSignals: TheplanWarmSignal[],
  overrides: Map<string, TheplanOverride>,
) {
  const contactsByVendorKey = new Map(
    contacts.map((item) => [item.vendorKey, item]),
  );
  const warmSignalsByVendorKey = new Map(
    warmSignals.map((item) => [item.vendorKey, item]),
  );

  return leads
    .map((lead) => {
      const override = overrides.get(lead.vendorKey);
      const contact = contactsByVendorKey.get(lead.vendorKey)!;
      const warmSignal = warmSignalsByVendorKey.get(lead.vendorKey)!;

      return {
        vendorKey: lead.vendorKey,
        company: lead.company,
        website: lead.website,
        domain: lead.domain,
        primaryType: lead.primaryType,
        warmSignalTier: warmSignal.warmSignalTier,
        warmSignalScore: warmSignal.warmSignalScore,
        outreachChannel: warmSignal.outreachChannel,
        primaryContact:
          override?.primaryContact ||
          warmSignal.primaryEmail ||
          contact.genericEmails[0] ||
          contact.allEmails[0] ||
          warmSignal.primaryLinkedinUrl ||
          contact.linkedinUrls[0] ||
          "",
        contactConfidence: warmSignal.contactConfidence,
        companyDescription:
          override?.companyDescription ?? buildDescription(lead),
        reasonToWrite:
          override?.reasonToWrite ??
          `${lead.company} er allerede med i ComplyChecks specialistoverblik, og vi vil gerne sikre, at jeres profil er retvisende, opdateret og tydelig for virksomheder, der leder efter relevant NIS2-hjælp.`,
        firstLineEmail: override?.firstLineEmail ?? buildFirstLine(lead),
        suggestedSubject:
          override?.suggestedSubject ?? warmSignal.suggestedEmailSubject,
        emailDraft: override?.emailDraft ?? buildEmailDraft(lead),
        followUpDraft: override?.followUpDraft ?? buildFollowUpDraft(lead),
        linkedInDraft: override?.linkedInDraft ?? buildLinkedInDraft(lead),
      } satisfies TheplanDraft;
    })
    .sort((left, right) => right.warmSignalScore - left.warmSignalScore);
}

export async function getTheplanDataset(): Promise<TheplanDataset> {
  const defaultLeads = readJsonFile<TheplanOutreachLead[]>(outreachPath);
  const defaultContacts = readJsonFile<TheplanContactEnrichment[]>(contactsPath);
  const overrides = await listTheplanOverrides();

  const leads = defaultLeads.map((lead) =>
    applyLeadOverride(lead, overrides.get(lead.vendorKey)),
  );

  const contacts = defaultContacts.map((contact) =>
    applyContactOverride(contact, overrides.get(contact.vendorKey)),
  );

  const warmSignals = buildWarmSignals(leads, contacts, overrides);
  const drafts = buildDrafts(leads, contacts, warmSignals, overrides);

  return {
    leads,
    contacts,
    warmSignals,
    drafts,
  };
}

function valuesEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function extractRowValue(row: Record<string, unknown>, field: string) {
  return row[field] ?? row[field.toLowerCase()] ?? row[field.toUpperCase()];
}

function normalizeImportedValue(field: string, value: unknown) {
  if (value == null) {
    return undefined;
  }

  if (
    [
      "websiteSignalTags",
      "sourceUrls",
      "genericEmails",
      "allEmails",
      "phoneNumbers",
      "linkedinUrls",
      "contactPageUrls",
      "titleSnippets",
    ].includes(field)
  ) {
    return splitPipeList(value);
  }

  if (["qualificationScoreInitial", "warmSignalScore"].includes(field)) {
    return normalizeNumber(value);
  }

  if (["confidence", "contactConfidence"].includes(field)) {
    const normalized = normalizeString(value).toLowerCase();
    if (["high", "medium", "low", "none"].includes(normalized)) {
      return normalized;
    }
    return undefined;
  }

  if (field === "outreachChannel") {
    const normalized = normalizeString(value).toLowerCase();
    if (
      ["email-first", "linkedin-first", "manual-research"].includes(normalized)
    ) {
      return normalized;
    }
    return undefined;
  }

  if (field === "warmSignalTier") {
    const normalized = normalizeString(value).toUpperCase();
    if (["A", "B", "C"].includes(normalized)) {
      return normalized;
    }
    return undefined;
  }

  return normalizeString(value);
}

type SheetConfig = {
  name: string;
  fields: readonly string[];
};

export const THEPLAN_IMPORT_SHEETS: SheetConfig[] = [
  { name: "Theplan Base", fields: THEPLAN_BASE_FIELDS },
  { name: "Kontaktspor", fields: THEPLAN_CONTACT_FIELDS },
  { name: "Flows", fields: THEPLAN_FLOW_FIELDS },
  { name: "Tekster", fields: THEPLAN_TEXT_FIELDS },
];

export async function previewTheplanImport(
  workbookSheets: Array<{
    name: string;
    rows: Record<string, unknown>[];
  }>,
) {
  const dataset = await getTheplanDataset();
  const currentRows = new Map<string, Record<string, unknown>>();

  for (const lead of dataset.leads) {
    currentRows.set(lead.vendorKey, { ...lead });
  }

  for (const contact of dataset.contacts) {
    currentRows.set(contact.vendorKey, {
      ...(currentRows.get(contact.vendorKey) ?? {}),
      ...contact,
    });
  }

  for (const warm of dataset.warmSignals) {
    currentRows.set(warm.vendorKey, {
      ...(currentRows.get(warm.vendorKey) ?? {}),
      ...warm,
    });
  }

  for (const draft of dataset.drafts) {
    currentRows.set(draft.vendorKey, {
      ...(currentRows.get(draft.vendorKey) ?? {}),
      ...draft,
    });
  }

  const changesByVendorKey = new Map<
    string,
    {
      company: string;
      sheets: Set<string>;
      updatedFields: Set<string>;
      patch: TheplanOverride;
      fieldDiffs: Array<{
        field: string;
        previousValue: string;
        nextValue: string;
        previousRaw: unknown;
        nextRaw: unknown;
      }>;
    }
  >();

  let rowsSeen = 0;
  const sheetsFound: string[] = [];

  for (const sheetConfig of THEPLAN_IMPORT_SHEETS) {
    const sheet = workbookSheets.find((item) => item.name === sheetConfig.name);

    if (!sheet) {
      continue;
    }

    sheetsFound.push(sheet.name);

    for (const row of sheet.rows) {
      const vendorKey = normalizeString(extractRowValue(row, "vendorKey"));

      if (!vendorKey) {
        continue;
      }

      rowsSeen += 1;

      const current = currentRows.get(vendorKey);

      if (!current) {
        continue;
      }

      const company = String(current.company ?? vendorKey);
      const change =
        changesByVendorKey.get(vendorKey) ??
        {
          company,
          sheets: new Set<string>(),
          updatedFields: new Set<string>(),
          patch: {},
          fieldDiffs: [],
        };

      for (const field of sheetConfig.fields) {
        const imported = normalizeImportedValue(field, extractRowValue(row, field));

        if (imported === undefined) {
          continue;
        }

        if (valuesEqual(imported, current[field])) {
          continue;
        }

        change.patch[field as keyof TheplanOverride] = imported as never;
        change.updatedFields.add(field);
        change.sheets.add(sheet.name);
        change.fieldDiffs.push({
          field,
          previousValue: JSON.stringify(current[field] ?? ""),
          nextValue: JSON.stringify(imported),
          previousRaw: current[field] ?? "",
          nextRaw: imported,
        });
      }

      if (change.updatedFields.size > 0) {
        changesByVendorKey.set(vendorKey, change);
      }
    }
  }

  const changes = [...changesByVendorKey.entries()].map(([vendorKey, change]) => ({
    vendorKey,
    company: change.company,
    sheets: [...change.sheets],
    updatedFields: [...change.updatedFields],
    fieldDiffs: change.fieldDiffs,
    patch: change.patch,
  }));

  return {
    sheetsFound,
    rowsSeen,
    changedRecords: changes.length,
    changedFields: changes.reduce(
      (sum, item) => sum + item.updatedFields.length,
      0,
    ),
    changes,
  };
}

export async function applyTheplanImport(
  workbookSheets: Array<{
    name: string;
    rows: Record<string, unknown>[];
  }>,
  actorEmail: string,
) {
  const preview = await previewTheplanImport(workbookSheets);

  for (const change of preview.changes) {
    await updateTheplanOverride(change.vendorKey, change.patch, actorEmail);
  }

  return {
    sheetsFound: preview.sheetsFound,
    rowsSeen: preview.rowsSeen,
    changedRecords: preview.changedRecords,
    changedFields: preview.changedFields,
    changes: preview.changes.map((item) => ({
      vendorKey: item.vendorKey,
      company: item.company,
      sheets: item.sheets,
      updatedFields: item.updatedFields,
      fieldDiffs: item.fieldDiffs,
    })),
  } satisfies TheplanImportResult;
}

export async function rollbackTheplanImport(
  changes: Array<{
    vendorKey: string;
    fieldDiffs: Array<{
      field: string;
      previousRaw: unknown;
    }>;
  }>,
  actorEmail: string,
) {
  let rolledBackRecords = 0;
  let rolledBackFields = 0;

  for (const change of changes) {
    const patch = Object.fromEntries(
      change.fieldDiffs.map((fieldDiff) => [fieldDiff.field, fieldDiff.previousRaw]),
    ) as TheplanOverride;

    if (Object.keys(patch).length === 0) {
      continue;
    }

    await updateTheplanOverride(change.vendorKey, patch, actorEmail);
    rolledBackRecords += 1;
    rolledBackFields += change.fieldDiffs.length;
  }

  return {
    rolledBackRecords,
    rolledBackFields,
  };
}
