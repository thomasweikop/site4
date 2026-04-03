"use client";

import { useSyncExternalStore } from "react";
import {
  getSessionReport,
  parseSessionsStorageValue,
  readSessionsStorageValue,
  type StoredReportSession,
} from "@/lib/nis2Session";

const NOOP_SUBSCRIBE = () => () => {};

export function useStoredReportSession(
  sessionId: string,
  initialSession?: StoredReportSession | null,
) {
  const clientReady = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false,
  );
  const sessionsStorageValue = useSyncExternalStore(
    NOOP_SUBSCRIBE,
    readSessionsStorageValue,
    () => "[]",
  );
  const localSession =
    parseSessionsStorageValue(sessionsStorageValue).find(
      (candidate) => candidate.id === sessionId,
    ) ?? null;
  const session = initialSession ?? localSession;

  return {
    clientReady,
    session,
    result: session ? getSessionReport(session) : null,
  };
}
