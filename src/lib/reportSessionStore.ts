import postgres from "postgres";
import type { ScanAnswers, ScanProfile } from "@/lib/nis2Scan";
import type { StoredReportSession, UnlockLead } from "@/lib/nis2Session";

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

function mapRow(row: SessionRow): StoredReportSession {
  return {
    id: row.id,
    createdAt: toIsoString(row.created_at) ?? new Date().toISOString(),
    updatedAt: toIsoString(row.updated_at) ?? new Date().toISOString(),
    profile: row.profile,
    answers: row.answers,
    source: row.source,
    unlockedAt: toIsoString(row.unlocked_at),
    unlockLead: row.unlock_lead ?? undefined,
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
        create index if not exists nis2_report_sessions_updated_at_idx
        on nis2_report_sessions (updated_at desc)
      `;

      return true;
    })();
  }

  return schemaPromise;
}

export function isReportDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function createDbReportSession(input: {
  id: string;
  profile: ScanProfile;
  answers: ScanAnswers;
  source?: string;
}) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const rows = await sql<SessionRow[]>`
    insert into nis2_report_sessions (
      id,
      source,
      profile,
      answers
    )
    values (
      ${input.id},
      ${input.source ?? "scan"},
      ${sql.json(input.profile)},
      ${sql.json(input.answers)}
    )
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

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getDbReportSession(sessionId: string) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
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
    where id = ${sessionId}
    limit 1
  `;

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function markDbReportUnlocked(
  sessionId: string,
  unlockLead: UnlockLead,
) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return null;
  }

  const rows = await sql<SessionRow[]>`
    update nis2_report_sessions
    set
      updated_at = now(),
      unlocked_at = now(),
      unlock_lead = ${sql.json(unlockLead)}
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

  return rows[0] ? mapRow(rows[0]) : null;
}

export async function listDbReportSessions(limit = 50) {
  const sql = getSql();

  if (!sql || !(await ensureSchema())) {
    return [];
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
    order by updated_at desc
    limit ${limit}
  `;

  return rows.map(mapRow);
}
