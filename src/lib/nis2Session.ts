"use client";

import {
  calculateScanResult,
  type ScanAnswers,
  type ScanProfile,
} from "@/lib/nis2Scan";

const DRAFT_STORAGE_KEY = "nis2_scan_draft_v1";
const SESSION_STORAGE_KEY = "nis2_report_sessions_v1";

export type ScanDraft = {
  profile: Partial<ScanProfile>;
  answers: ScanAnswers;
  currentIndex: number;
  updatedAt: string;
};

export type UnlockLead = {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type StoredReportSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  profile: ScanProfile;
  answers: ScanAnswers;
  source: string;
  unlockedAt?: string;
  unlockLead?: UnlockLead;
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeParse<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function readDraftStorageValue() {
  if (!canUseStorage()) {
    return "";
  }

  return window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "";
}

export function parseDraftStorageValue(value: string) {
  const draft = safeParse<ScanDraft>(value);

  if (!draft) {
    return null;
  }

  return {
    profile: draft.profile ?? {},
    answers: draft.answers ?? {},
    currentIndex: Number.isFinite(draft.currentIndex) ? draft.currentIndex : -1,
    updatedAt: draft.updatedAt ?? new Date().toISOString(),
  } satisfies ScanDraft;
}

export function readSessionsStorageValue() {
  if (!canUseStorage()) {
    return "[]";
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY) ?? "[]";
}

export function parseSessionsStorageValue(value: string) {
  const sessions = safeParse<StoredReportSession[]>(value);

  if (!Array.isArray(sessions)) {
    return [] as StoredReportSession[];
  }

  return sessions;
}

function readSessions() {
  return parseSessionsStorageValue(readSessionsStorageValue());
}

function writeSessions(sessions: StoredReportSession[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
}

export function loadScanDraft() {
  return parseDraftStorageValue(readDraftStorageValue());
}

export function saveScanDraft(draft: Omit<ScanDraft, "updatedAt">) {
  if (!canUseStorage()) {
    return;
  }

  const payload: ScanDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
}

export function clearScanDraft() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export function createReportSession(input: {
  profile: ScanProfile;
  answers: ScanAnswers;
  source?: string;
}) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}`;
  const now = new Date().toISOString();
  const sessions = readSessions();
  const nextSession: StoredReportSession = {
    id,
    createdAt: now,
    updatedAt: now,
    profile: input.profile,
    answers: input.answers,
    source: input.source ?? "scan",
  };

  writeSessions([nextSession, ...sessions]);

  return nextSession;
}

export function listStoredReportSessions() {
  return readSessions().sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

export function getStoredReportSession(id: string) {
  return readSessions().find((session) => session.id === id) ?? null;
}

export function markReportUnlocked(id: string, unlockLead: UnlockLead) {
  const sessions = readSessions();
  const updatedAt = new Date().toISOString();
  const nextSessions = sessions.map((session) =>
    session.id === id
      ? {
          ...session,
          updatedAt,
          unlockedAt: updatedAt,
          unlockLead,
        }
      : session,
  );

  writeSessions(nextSessions);
  return nextSessions.find((session) => session.id === id) ?? null;
}

export function deleteStoredReportSession(id: string) {
  const sessions = readSessions().filter((session) => session.id !== id);
  writeSessions(sessions);
}

export function getSessionReport(session: StoredReportSession) {
  return calculateScanResult(session.answers, session.profile);
}
