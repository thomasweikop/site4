import { randomUUID } from "node:crypto";
import postgres from "postgres";
import {
  ANSWER_OPTIONS,
  SCORE_BANDS,
  SCAN_QUESTIONS,
  type ScanAnswers,
  type ScanProfile,
} from "@/lib/nis2Scan";
import {
  VENDOR_DIRECTORY,
  buildVendorKey,
  type VendorLogoStatus,
  type VendorProfileTier,
  type VendorDirectoryEntry,
  type VendorSizeFit,
  type VendorType,
} from "@/lib/nis2BuildPack";
import type { UnlockLead } from "@/lib/nis2Session";

export type SuperadminUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type SuperadminActorType = "user" | "superadmin" | "system";

export type SuperadminLogEntry = {
  id: number;
  createdAt: string;
  actorType: SuperadminActorType;
  actorEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
};

export type EditableVendor = {
  key: string;
  baseKey: string;
  name: string;
  type: VendorType;
  profileTier: VendorProfileTier;
  sizeFit: VendorSizeFit[];
  sectorFit: string;
  priceBand: string;
  bestFor: string;
  website: string;
  score: number;
  recommendedRole: string;
  recommendedWhen: string;
  specialtyHighlights: string[];
  adjacentTypes: VendorType[];
  secondaryTypes: VendorType[];
  bestMatchAreas: string[];
  capabilityAreaLabels: string[];
  websiteSummaryDa: string;
  websiteSignalTags: string[];
  websiteSignalScore: number;
  websiteDepthScore: number;
  websiteEvidenceScore: number;
  capabilityBreadthScore: number;
  profileCompletenessScore: number;
  pagesScanned: number;
  sourceUrls: string[];
  casesPerYear: number | null;
  dedicatedSpecialists: number | null;
  manualBoostScore: number;
  logoStatus: VendorLogoStatus;
  logoCandidateUrl: string;
  logoOfficialSourceUrl: string;
  logoNotes: string;
};

export type LogoReviewStatusFilter = "all" | EditableVendor["logoStatus"];

export type LogoReviewPageData = {
  vendors: EditableVendor[];
  counts: Record<EditableVendor["logoStatus"], number>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  query: string;
  statusFilter: LogoReviewStatusFilter;
};

export type EditableQuestion = {
  id: string;
  category: string;
  question: string;
  weight: number;
  recommendation: string;
};

export type EditableScoringConfig = {
  answerPoints: Record<string, number>;
  scoreBands: Array<{
    id: string;
    min: number;
    status: string;
    summary: string;
  }>;
};

export type SubmittedUserRecord = {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  unlockedAt?: string;
  source: string;
  profile: ScanProfile;
  lead: UnlockLead;
};

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string | Date;
  updated_at: string | Date;
};

type AdminLogRow = {
  id: number;
  created_at: string | Date;
  actor_type: SuperadminActorType;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  payload: Record<string, unknown> | null;
};

type OverrideRow = {
  record_key: string;
  data: Record<string, unknown>;
  updated_at: string | Date;
  updated_by: string | null;
};

type ScoringRow = {
  id: string;
  data: Record<string, unknown>;
  updated_at: string | Date;
  updated_by: string | null;
};

type SessionRow = {
  id: string;
  created_at: string | Date;
  updated_at: string | Date;
  source: string;
  profile: ScanProfile;
  answers: ScanAnswers;
  unlocked_at: string | Date | null;
  unlock_lead: UnlockLead | null;
};

const DEFAULT_SUPERADMIN_EMAIL = "thomas.weikop@gmail.com";
const DEFAULT_SUPERADMIN_PASSWORD_HASH =
  "8d13af59785b1eb33d082fd2ddddd75c1f893bc5ba02b1b6a5def867bf40e70d";

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

function toIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return undefined;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function toJsonValue(value: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(value)) as postgres.JSONValue;
}

function buildDefaultEditableVendor(vendor: VendorDirectoryEntry): EditableVendor {
  return {
    key: buildVendorKey(vendor),
    baseKey: buildVendorKey(vendor),
    name: vendor.name,
    type: vendor.type,
    profileTier: vendor.profileTier,
    sizeFit: vendor.sizeFit,
    sectorFit: vendor.sectorFit,
    priceBand: vendor.priceBand,
    bestFor: vendor.bestFor,
    website: vendor.website,
    score: vendor.score,
    recommendedRole: vendor.recommendedRole,
    recommendedWhen: vendor.recommendedWhen,
    specialtyHighlights: vendor.specialtyHighlights,
    adjacentTypes: vendor.adjacentTypes,
    secondaryTypes: vendor.secondaryTypes,
    bestMatchAreas: vendor.bestMatchAreas,
    capabilityAreaLabels: vendor.capabilityAreaLabels,
    websiteSummaryDa: vendor.websiteSummaryDa,
    websiteSignalTags: vendor.websiteSignalTags,
    websiteSignalScore: vendor.websiteSignalScore,
    websiteDepthScore: vendor.websiteDepthScore,
    websiteEvidenceScore: vendor.websiteEvidenceScore,
    capabilityBreadthScore: vendor.capabilityBreadthScore,
    profileCompletenessScore: vendor.profileCompletenessScore,
    pagesScanned: vendor.pagesScanned,
    sourceUrls: vendor.sourceUrls,
    casesPerYear: vendor.casesPerYear,
    dedicatedSpecialists: vendor.dedicatedSpecialists,
    manualBoostScore: vendor.manualBoostScore,
    logoStatus: vendor.logoStatus,
    logoCandidateUrl: vendor.logoCandidateUrl,
    logoOfficialSourceUrl: vendor.logoOfficialSourceUrl,
    logoNotes: vendor.logoNotes,
  };
}

function buildDefaultQuestion(question: (typeof SCAN_QUESTIONS)[number]): EditableQuestion {
  return {
    id: question.id,
    category: question.category,
    question: question.question,
    weight: question.weight,
    recommendation: question.recommendation,
  };
}

function buildDefaultScoringConfig(): EditableScoringConfig {
  const answerPoints = Object.fromEntries(
    ANSWER_OPTIONS.map((option) => [
      option.value,
      Number.parseInt(option.pointsLabel, 10) || 0,
    ]),
  );

  return {
    answerPoints,
    scoreBands: SCORE_BANDS.map((band) => ({
      id: band.id,
      min: band.min,
      status: band.status,
      summary: band.summary,
    })),
  };
}

function mapAdminUser(row: AdminUserRow): SuperadminUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString(),
  };
}

function mapLogRow(row: AdminLogRow): SuperadminLogEntry {
  return {
    id: row.id,
    createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
    actorType: row.actor_type,
    actorEmail: row.actor_email ?? undefined,
    action: row.action,
    entityType: row.entity_type ?? undefined,
    entityId: row.entity_id ?? undefined,
    payload: row.payload ?? undefined,
  };
}

async function ensureSchema() {
  const sql = getSql();

  if (!sql) {
    return false;
  }

  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`
        create table if not exists superadmin_users (
          id text primary key,
          email text not null unique,
          password_hash text not null,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
      `;

      await sql`
        create table if not exists superadmin_event_log (
          id bigserial primary key,
          created_at timestamptz not null default now(),
          actor_type text not null,
          actor_email text null,
          action text not null,
          entity_type text null,
          entity_id text null,
          payload jsonb null
        )
      `;

      await sql`
        create table if not exists superadmin_vendor_overrides (
          record_key text primary key,
          data jsonb not null,
          updated_at timestamptz not null default now(),
          updated_by text null
        )
      `;

      await sql`
        create table if not exists superadmin_question_overrides (
          record_key text primary key,
          data jsonb not null,
          updated_at timestamptz not null default now(),
          updated_by text null
        )
      `;

      await sql`
        create table if not exists superadmin_scoring_config (
          id text primary key,
          data jsonb not null,
          updated_at timestamptz not null default now(),
          updated_by text null
        )
      `;

      await sql`
        create table if not exists nis2_report_sessions (
          id text primary key,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          source text not null default 'scan',
          profile jsonb not null,
          answers jsonb not null,
          unlocked_at timestamptz null,
          unlock_lead jsonb null
        )
      `;

      await sql`
        create index if not exists superadmin_event_log_created_at_idx
        on superadmin_event_log (created_at desc)
      `;

      await sql`
        create index if not exists nis2_report_sessions_updated_at_idx
        on nis2_report_sessions (updated_at desc)
      `;

      await sql`
        insert into superadmin_users (
          id,
          email,
          password_hash
        )
        values (
          ${randomUUID()},
          ${DEFAULT_SUPERADMIN_EMAIL},
          ${DEFAULT_SUPERADMIN_PASSWORD_HASH}
        )
        on conflict (email) do nothing
      `;

      return true;
    })();
  }

  return schemaPromise;
}

export function isSuperadminDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function findSuperadminUserByEmail(email: string) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const rows = await sql<AdminUserRow[]>`
    select
      id,
      email,
      password_hash,
      created_at,
      updated_at
    from superadmin_users
    where email = ${normalizedEmail}
    limit 1
  `;

  return rows[0] ?? null;
}

export async function listSuperadminUsers() {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return [] as SuperadminUser[];
  }

  const rows = await sql<AdminUserRow[]>`
    select
      id,
      email,
      password_hash,
      created_at,
      updated_at
    from superadmin_users
    order by email asc
  `;

  return rows.map(mapAdminUser);
}

export async function createSuperadminUser(input: {
  email: string;
  passwordHash: string;
}) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const rows = await sql<AdminUserRow[]>`
    insert into superadmin_users (
      id,
      email,
      password_hash
    )
    values (
      ${randomUUID()},
      ${input.email.trim().toLowerCase()},
      ${input.passwordHash}
    )
    returning
      id,
      email,
      password_hash,
      created_at,
      updated_at
  `;

  return rows[0] ? mapAdminUser(rows[0]) : null;
}

export async function listSuperadminLogs(limit = 200) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return [] as SuperadminLogEntry[];
  }

  const rows = await sql<AdminLogRow[]>`
    select
      id,
      created_at,
      actor_type,
      actor_email,
      action,
      entity_type,
      entity_id,
      payload
    from superadmin_event_log
    order by created_at desc
    limit ${limit}
  `;

  return rows.map(mapLogRow);
}

export async function createSuperadminLog(input: {
  actorType: SuperadminActorType;
  actorEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const rows = await sql<AdminLogRow[]>`
    insert into superadmin_event_log (
      actor_type,
      actor_email,
      action,
      entity_type,
      entity_id,
      payload
    )
    values (
      ${input.actorType},
      ${input.actorEmail?.trim().toLowerCase() || null},
      ${input.action},
      ${input.entityType || null},
      ${input.entityId || null},
      ${input.payload ? sql.json(toJsonValue(input.payload)) : null}
    )
    returning
      id,
      created_at,
      actor_type,
      actor_email,
      action,
      entity_type,
      entity_id,
      payload
  `;

  return rows[0] ? mapLogRow(rows[0]) : null;
}

async function listOverrideRows(tableName: "superadmin_vendor_overrides" | "superadmin_question_overrides") {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return [] as OverrideRow[];
  }

  const rows =
    tableName === "superadmin_vendor_overrides"
      ? await sql<OverrideRow[]>`
          select
            record_key,
            data,
            updated_at,
            updated_by
          from superadmin_vendor_overrides
          order by updated_at desc
        `
      : await sql<OverrideRow[]>`
          select
            record_key,
            data,
            updated_at,
            updated_by
          from superadmin_question_overrides
          order by updated_at desc
        `;

  return rows;
}

export async function listEditableVendors() {
  const defaults = VENDOR_DIRECTORY.map(buildDefaultEditableVendor);
  const overrides = await listOverrideRows("superadmin_vendor_overrides");
  const overrideMap = new Map(
    overrides.map((row) => [row.record_key, row.data as Partial<EditableVendor>]),
  );

  return defaults.map((vendor) => ({
    ...vendor,
    ...(overrideMap.get(vendor.key) ?? {}),
    key: vendor.key,
    baseKey: vendor.baseKey,
  }));
}

const LOGO_STATUS_ORDER: Record<EditableVendor["logoStatus"], number> = {
  candidate: 0,
  missing: 1,
  rejected: 2,
  approved: 3,
};

export async function getLogoReviewPageData(options?: {
  query?: string;
  statusFilter?: LogoReviewStatusFilter;
  page?: number;
  pageSize?: number;
}): Promise<LogoReviewPageData> {
  const {
    query = "",
    statusFilter = "all",
    page = 1,
    pageSize = 20,
  } = options ?? {};

  const vendors = await listEditableVendors();
  const normalizedQuery = query.trim().toLowerCase();

  const filteredVendors = [...vendors]
    .filter((vendor) => {
      if (statusFilter !== "all" && vendor.logoStatus !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        vendor.name,
        vendor.website,
        vendor.logoCandidateUrl,
        vendor.logoOfficialSourceUrl,
        vendor.logoNotes,
        vendor.websiteSummaryDa,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .sort((left, right) => {
      const statusDiff =
        LOGO_STATUS_ORDER[left.logoStatus] - LOGO_STATUS_ORDER[right.logoStatus];

      if (statusDiff !== 0) {
        return statusDiff;
      }

      return left.name.localeCompare(right.name, "da");
    });

  const counts = vendors.reduce(
    (accumulator, vendor) => {
      accumulator[vendor.logoStatus] += 1;
      return accumulator;
    },
    {
      missing: 0,
      candidate: 0,
      approved: 0,
      rejected: 0,
    } satisfies Record<EditableVendor["logoStatus"], number>,
  );

  const totalCount = filteredVendors.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const pagedVendors = filteredVendors.slice(start, start + pageSize);

  return {
    vendors: pagedVendors,
    counts,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    query,
    statusFilter,
  };
}

export async function updateEditableVendor(
  vendorKey: string,
  vendor: EditableVendor,
  actorEmail: string,
) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const rows = await sql<OverrideRow[]>`
    insert into superadmin_vendor_overrides (
      record_key,
      data,
      updated_by
    )
    values (
      ${vendorKey},
      ${sql.json(vendor)},
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

  return rows[0]?.data as EditableVendor | undefined;
}

export async function listEditableQuestions() {
  const defaults = SCAN_QUESTIONS.map(buildDefaultQuestion);
  const overrides = await listOverrideRows("superadmin_question_overrides");
  const overrideMap = new Map(
    overrides.map((row) => [row.record_key, row.data as Partial<EditableQuestion>]),
  );

  return defaults.map((question) => ({
    ...question,
    ...(overrideMap.get(question.id) ?? {}),
    id: question.id,
  }));
}

export async function updateEditableQuestion(
  questionId: string,
  question: EditableQuestion,
  actorEmail: string,
) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const rows = await sql<OverrideRow[]>`
    insert into superadmin_question_overrides (
      record_key,
      data,
      updated_by
    )
    values (
      ${questionId},
      ${sql.json(question)},
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

  return rows[0]?.data as EditableQuestion | undefined;
}

export async function getEditableScoringConfig() {
  const sql = getSql();
  const defaults = buildDefaultScoringConfig();

  if (!sql || !(await ensureSchema())) {
    return defaults;
  }

  const rows = await sql<ScoringRow[]>`
    select
      id,
      data,
      updated_at,
      updated_by
    from superadmin_scoring_config
    where id = 'default'
    limit 1
  `;

  if (!rows[0]?.data) {
    return defaults;
  }

  return {
    ...defaults,
    ...(rows[0].data as Partial<EditableScoringConfig>),
  };
}

export async function updateEditableScoringConfig(
  config: EditableScoringConfig,
  actorEmail: string,
) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const rows = await sql<ScoringRow[]>`
    insert into superadmin_scoring_config (
      id,
      data,
      updated_by
    )
    values (
      'default',
      ${sql.json(config)},
      ${actorEmail.trim().toLowerCase()}
    )
    on conflict (id) do update
    set
      data = excluded.data,
      updated_at = now(),
      updated_by = excluded.updated_by
    returning
      id,
      data,
      updated_at,
      updated_by
  `;

  return rows[0]?.data as EditableScoringConfig | undefined;
}

export async function listSubmittedUsers() {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return [] as SubmittedUserRecord[];
  }

  const rows = await sql<SessionRow[]>`
    select
      id,
      created_at,
      updated_at,
      source,
      profile,
      answers,
      unlocked_at,
      unlock_lead
    from nis2_report_sessions
    where unlock_lead is not null
    order by updated_at desc
  `;

  return rows
    .filter((row) => row.unlock_lead)
    .map((row) => ({
      sessionId: row.id,
      createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
      updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString(),
      unlockedAt: toIsoString(row.unlocked_at),
      source: row.source,
      profile: row.profile,
      lead: row.unlock_lead as UnlockLead,
    }));
}

export async function updateSubmittedUser(
  sessionId: string,
  lead: UnlockLead,
  actorEmail: string,
) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const rows = await sql<SessionRow[]>`
    update nis2_report_sessions
    set
      updated_at = now(),
      unlock_lead = ${sql.json(lead)}
    where id = ${sessionId}
    returning
      id,
      created_at,
      updated_at,
      source,
      profile,
      answers,
      unlocked_at,
      unlock_lead
  `;

  const row = rows[0];

  if (!row || !row.unlock_lead) {
    return null;
  }

  await createSuperadminLog({
    actorType: "superadmin",
    actorEmail,
    action: "updated_user_contact",
    entityType: "report_session",
    entityId: sessionId,
    payload: {
      sessionId,
      lead,
    },
  });

  return {
    sessionId: row.id,
    createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString(),
    unlockedAt: toIsoString(row.unlocked_at),
    source: row.source,
    profile: row.profile,
    lead: row.unlock_lead,
  } satisfies SubmittedUserRecord;
}

export async function getSuperadminOverview() {
  const [logs, vendors, users, questions, admins] = await Promise.allSettled([
    listSuperadminLogs(500),
    listEditableVendors(),
    listSubmittedUsers(),
    listEditableQuestions(),
    listSuperadminUsers(),
  ]);

  return {
    logCount: logs.status === "fulfilled" ? logs.value.length : 0,
    vendorCount: vendors.status === "fulfilled" ? vendors.value.length : 0,
    userCount: users.status === "fulfilled" ? users.value.length : 0,
    questionCount: questions.status === "fulfilled" ? questions.value.length : 0,
    adminCount: admins.status === "fulfilled" ? admins.value.length : 0,
  };
}
