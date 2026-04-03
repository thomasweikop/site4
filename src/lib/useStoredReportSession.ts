"use client";

import { useSyncExternalStore } from "react";
import {
  getSessionReport,
  parseSessionsStorageValue,
  readSessionsStorageValue,
} from "@/lib/nis2Session";

const NOOP_SUBSCRIBE = () => () => {};

export function useStoredReportSession(sessionId: string) {
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
  const session =
    parseSessionsStorageValue(sessionsStorageValue).find(
      (candidate) => candidate.id === sessionId,
    ) ?? null;

  return {
    clientReady,
    session,
    result: session ? getSessionReport(session) : null,
  };
}
