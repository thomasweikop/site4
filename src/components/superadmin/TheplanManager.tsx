"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  TheplanCommunicationEntry,
  TheplanCompanyStatus,
  TheplanContactEnrichment,
  TheplanDraft,
  TheplanImportResult,
  TheplanOutreachLead,
  TheplanOutreachStatus,
  TheplanWarmSignal,
} from "@/lib/theplanStore";
import type { SuperadminLogEntry } from "@/lib/superadminStore";

type TheplanManagerProps = {
  initialLeads: TheplanOutreachLead[];
  initialContacts: TheplanContactEnrichment[];
  initialWarmSignals: TheplanWarmSignal[];
  initialDrafts: TheplanDraft[];
  importLogs: SuperadminLogEntry[];
  rolledBackImportLogIds: number[];
  initialStatuses: TheplanCompanyStatus[];
  initialCommunicationLog: TheplanCommunicationEntry[];
};

const STATUS_OPTIONS: Array<{ value: TheplanOutreachStatus; label: string }> = [
  { value: "not_contacted", label: "Ikke kontaktet" },
  { value: "draft_ready", label: "Draft klar" },
  { value: "contacted", label: "Kontaktet" },
  { value: "follow_up", label: "Follow-up" },
  { value: "responded", label: "Svaret" },
  { value: "qualified", label: "Kvalificeret" },
];

function SectionBadge({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-line bg-paper px-4 py-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function TheplanManager({
  initialLeads,
  initialContacts,
  initialWarmSignals,
  initialDrafts,
  importLogs,
  rolledBackImportLogIds,
  initialStatuses,
  initialCommunicationLog,
}: TheplanManagerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<TheplanImportResult | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [rollbackMessage, setRollbackMessage] = useState<string | null>(null);
  const [rollbackingLogId, setRollbackingLogId] = useState<number | null>(null);
  const [statuses, setStatuses] = useState(initialStatuses);
  const [communicationLog, setCommunicationLog] = useState(initialCommunicationLog);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, TheplanOutreachStatus>>(
    () =>
      Object.fromEntries(
        initialDrafts.map((draft) => [
          draft.vendorKey,
          initialStatuses.find((status) => status.vendorKey === draft.vendorKey)?.status ??
            "draft_ready",
        ]),
      ),
  );
  const [statusNotes, setStatusNotes] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        initialDrafts.map((draft) => [
          draft.vendorKey,
          initialStatuses.find((status) => status.vendorKey === draft.vendorKey)?.note ??
            "",
        ]),
      ),
  );
  const [savingStatusKey, setSavingStatusKey] = useState<string | null>(null);
  const [loggingKey, setLoggingKey] = useState<string | null>(null);
  const [flowMessage, setFlowMessage] = useState<string | null>(null);

  const filteredWarmSignals = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return initialWarmSignals.filter((item) => {
      if (tierFilter !== "all" && item.warmSignalTier !== tierFilter) {
        return false;
      }

      if (channelFilter !== "all" && item.outreachChannel !== channelFilter) {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return [
        item.company,
        item.domain,
        item.primaryType,
        item.bestMatchAreas,
        item.whyNow,
        item.primaryEmail,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [channelFilter, initialWarmSignals, query, tierFilter]);

  const filteredDrafts = useMemo(() => {
    const keys = new Set(filteredWarmSignals.map((item) => item.vendorKey));
    return initialDrafts.filter((item) => keys.has(item.vendorKey));
  }, [filteredWarmSignals, initialDrafts]);

  const highConfidenceContacts = initialContacts.filter(
    (item) => item.confidence === "high",
  ).length;
  const rolledBackLogIdSet = useMemo(
    () => new Set(rolledBackImportLogIds),
    [rolledBackImportLogIds],
  );
  const statusesByVendorKey = useMemo(
    () => new Map(statuses.map((item) => [item.vendorKey, item])),
    [statuses],
  );
  const communicationByVendorKey = useMemo(() => {
    const map = new Map<string, TheplanCommunicationEntry[]>();
    for (const entry of communicationLog) {
      const current = map.get(entry.vendorKey) ?? [];
      current.push(entry);
      map.set(entry.vendorKey, current);
    }
    return map;
  }, [communicationLog]);

  function formatImportSummary(result: TheplanImportResult) {
    return `${result.changedRecords} virksomheder og ${result.changedFields} felter påvirkes på tværs af ${result.sheetsFound.join(", ") || "ingen sheets"}.`;
  }

  async function runImport(mode: "preview" | "apply") {
    if (!selectedFile) {
      setImportMessage("Vælg først en Excel-fil.");
      return;
    }

    setImportMessage(null);

    const formData = new FormData();
    formData.set("mode", mode);
    formData.set("file", selectedFile);

    setIsPending(true);

    try {
      const response = await fetch("/api/superadmin/theplan/import", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        error?: string;
        result?: TheplanImportResult;
      };

      if (!response.ok || !payload.result) {
        setImportMessage(payload.error || "Kunne ikke læse Excel-importen.");
        return;
      }

      setPreview(payload.result);
      setImportMessage(
        mode === "apply"
          ? `Import gennemført. ${formatImportSummary(payload.result)}`
          : `Preview klar. ${formatImportSummary(payload.result)}`,
      );

      if (mode === "apply") {
        router.refresh();
      }
    } catch {
      setImportMessage("Netværksfejl under import.");
    } finally {
      setIsPending(false);
    }
  }

  async function rollbackImport(logId: number) {
    setRollbackMessage(null);
    setRollbackingLogId(logId);

    try {
      const response = await fetch("/api/superadmin/theplan/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      });

      const payload = (await response.json()) as {
        error?: string;
        result?: {
          rolledBackRecords: number;
          rolledBackFields: number;
        };
      };

      if (!response.ok || !payload.result) {
        setRollbackMessage(payload.error || "Kunne ikke rollbacke importen.");
        return;
      }

      setRollbackMessage(
        `Rollback gennemført. ${payload.result.rolledBackRecords} virksomheder og ${payload.result.rolledBackFields} felter er ført tilbage.`,
      );
      router.refresh();
    } catch {
      setRollbackMessage("Netværksfejl under rollback.");
    } finally {
      setRollbackingLogId(null);
    }
  }

  async function saveStatus(draft: TheplanDraft) {
    setFlowMessage(null);
    setSavingStatusKey(draft.vendorKey);

    try {
      const response = await fetch("/api/superadmin/theplan/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorKey: draft.vendorKey,
          company: draft.company,
          status: statusDrafts[draft.vendorKey] ?? "draft_ready",
          note: statusNotes[draft.vendorKey] ?? "",
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        record?: TheplanCompanyStatus;
      };

      if (!response.ok || !payload.record) {
        setFlowMessage(payload.error || "Kunne ikke gemme status.");
        return;
      }

      setStatuses((current) => {
        const filtered = current.filter((item) => item.vendorKey !== draft.vendorKey);
        return [payload.record!, ...filtered];
      });
      setFlowMessage(`Status gemt for ${draft.company}.`);
    } catch {
      setFlowMessage("Netværksfejl under statusopdatering.");
    } finally {
      setSavingStatusKey(null);
    }
  }

  async function logCommunication(
    draft: TheplanDraft,
    channel: TheplanCommunicationEntry["channel"],
  ) {
    setFlowMessage(null);
    setLoggingKey(draft.vendorKey);

    const payload =
      channel === "email"
        ? {
            vendorKey: draft.vendorKey,
            company: draft.company,
            channel,
            direction: "outbound" as const,
            subject: draft.suggestedSubject,
            content: draft.emailDraft,
          }
        : channel === "linkedin"
          ? {
              vendorKey: draft.vendorKey,
              company: draft.company,
              channel,
              direction: "outbound" as const,
              subject: "LinkedIn outreach",
              content: draft.linkedInDraft,
            }
          : {
              vendorKey: draft.vendorKey,
              company: draft.company,
              channel,
              direction: "internal" as const,
              subject: "Intern note",
              content: statusNotes[draft.vendorKey] ?? "",
            };

    try {
      const response = await fetch("/api/superadmin/theplan/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        error?: string;
        entry?: TheplanCommunicationEntry;
      };

      if (!response.ok || !result.entry) {
        setFlowMessage(result.error || "Kunne ikke logge kommunikationen.");
        return;
      }

      setCommunicationLog((current) => [result.entry!, ...current]);
      setFlowMessage(`Kommunikation logget for ${draft.company}.`);
    } catch {
      setFlowMessage("Netværksfejl under kommunikationslog.");
    } finally {
      setLoggingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
          Theplan
        </p>
        <h1 className="mt-4 text-balance font-display text-[3rem] leading-[0.94] text-ink">
          Outreach cockpit
        </h1>
        <p className="mt-4 max-w-4xl text-sm leading-6 text-soft">
          Her ligger trin 1 til 4 samlet i superadmin: outreach-basen,
          kontaktberigelse fra websites, warm-signal prioritering og konkrete
          drafts til email og LinkedIn.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SectionBadge label="Trin 1 leads" value={initialLeads.length} />
          <SectionBadge label="Trin 2 high confidence" value={highConfidenceContacts} />
          <SectionBadge
            label="Trin 3 A-tier"
            value={initialWarmSignals.filter((item) => item.warmSignalTier === "A").length}
          />
          <SectionBadge label="Trin 4 drafts" value={initialDrafts.length} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/api/superadmin/theplan/export?kind=base"
            className="inline-flex items-center justify-center bg-[#050a1f] px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[#101937]"
          >
            Download Excel med theplan-basen
          </a>
          <a
            href="/api/superadmin/theplan/export?kind=all"
            className="inline-flex items-center justify-center bg-[#2a5a4f] px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[#234b42]"
          >
            Download alt samlet
          </a>
          <a
            href="/api/superadmin/theplan/export?kind=flows"
            className="inline-flex items-center justify-center border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
          >
            Download flows og tekster
          </a>
        </div>

        <div className="mt-8 border border-line bg-paper p-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
            Upload Excel og opdatér theplan
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-soft">
            Upload en tidligere eksporteret Excel-fil, få en preview af ændringerne,
            og bekræft derefter importen. Importen kan opdatere base, kontaktspor,
            flows og tekster direkte i superadmin.
          </p>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
              className="block w-full text-sm text-ink file:mr-4 file:border-0 file:bg-[#050a1f] file:px-4 file:py-3 file:font-semibold file:text-white"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => runImport("preview")}
                disabled={isPending}
                className="inline-flex items-center justify-center border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-50"
              >
                {isPending ? "Arbejder..." : "Preview import"}
              </button>
              <button
                type="button"
                onClick={() => runImport("apply")}
                disabled={isPending || !preview}
                className="inline-flex items-center justify-center bg-[#2a5a4f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#234b42] disabled:opacity-50"
              >
                {isPending ? "Importerer..." : "Bekræft import"}
              </button>
            </div>
          </div>
          {importMessage ? (
            <p className="mt-4 text-sm text-[#2a5a4f]">{importMessage}</p>
          ) : null}
          {preview ? (
            <div className="mt-5 space-y-3">
              <div className="grid gap-3 md:grid-cols-4">
                <SectionBadge label="Sheets fundet" value={preview.sheetsFound.length} />
                <SectionBadge label="Rækker læst" value={preview.rowsSeen} />
                <SectionBadge label="Virksomheder ændres" value={preview.changedRecords} />
                <SectionBadge label="Felter ændres" value={preview.changedFields} />
              </div>
              <div className="space-y-2">
                {preview.changes.slice(0, 12).map((change) => (
                  <div
                    key={change.vendorKey}
                    className="border border-line bg-white px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-ink">{change.company}</p>
                    <p className="mt-1 text-sm text-soft">
                      {change.sheets.join(", ")} · {change.updatedFields.join(", ")}
                    </p>
                    <div className="mt-3 space-y-2">
                      {change.fieldDiffs.slice(0, 6).map((diff) => (
                        <div key={`${change.vendorKey}-${diff.field}`} className="text-sm">
                          <p className="font-semibold text-ink">{diff.field}</p>
                          <p className="mt-1 text-soft">
                            Fra: {diff.previousValue}
                          </p>
                          <p className="text-[#2a5a4f]">
                            Til: {diff.nextValue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
          Importhistorik
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
          Seneste Excel-importer
        </h2>
        <p className="mt-3 text-sm leading-6 text-soft">
          Her kan du se de seneste importer af theplan-filer direkte fra superadmin-loggen.
        </p>

        <div className="mt-5 space-y-3">
          {rollbackMessage ? (
            <div className="border border-line bg-paper px-4 py-4 text-sm text-[#2a5a4f]">
              {rollbackMessage}
            </div>
          ) : null}
          {importLogs.length === 0 ? (
            <div className="border border-line bg-paper px-4 py-4 text-sm text-soft">
              Ingen importer logget endnu.
            </div>
          ) : (
            importLogs.slice(0, 12).map((log) => {
              const wasRolledBack = rolledBackLogIdSet.has(log.id);

              return (
              <div
                key={log.id}
                className="border border-line bg-paper px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {log.entityId || "Excel-import"}
                    </p>
                    <p className="mt-1 text-sm text-soft">
                      {new Date(log.createdAt).toLocaleString("da-DK")} ·{" "}
                      {log.actorEmail || "ukendt"}
                    </p>
                  </div>
                  <div className="text-sm text-soft">
                    <p>
                      Rækker: {String(log.payload?.rowsSeen ?? "-")}
                    </p>
                    <p>
                      Virksomheder: {String(log.payload?.changedRecords ?? "-")}
                    </p>
                    <p>
                      Felter: {String(log.payload?.changedFields ?? "-")}
                    </p>
                    <p>
                      Status: {wasRolledBack ? "Rollbacket" : "Aktiv import"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-soft">
                  Sheets: {Array.isArray(log.payload?.sheetsFound)
                    ? log.payload?.sheetsFound.join(", ")
                    : "-"}
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => rollbackImport(log.id)}
                    disabled={rollbackingLogId === log.id || wasRolledBack}
                    className="inline-flex items-center justify-center border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-50"
                  >
                    {wasRolledBack
                      ? "Allerede rollbacket"
                      : rollbackingLogId === log.id
                        ? "Rollbacker..."
                        : "Rollback denne import"}
                  </button>
                </div>
              </div>
              );
            })
          )}
        </div>
      </section>

      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
          Filtrering
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Søg virksomhed, domæne, type eller kontaktpunkt"
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          />
          <select
            value={tierFilter}
            onChange={(event) => setTierFilter(event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          >
            <option value="all">Alle tiers</option>
            <option value="A">A-tier</option>
            <option value="B">B-tier</option>
            <option value="C">C-tier</option>
          </select>
          <select
            value={channelFilter}
            onChange={(event) => setChannelFilter(event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          >
            <option value="all">Alle kanaler</option>
            <option value="email-first">Email first</option>
            <option value="linkedin-first">LinkedIn first</option>
            <option value="manual-research">Manual research</option>
          </select>
        </div>
        <p className="mt-4 text-sm text-soft">
          Viser {filteredWarmSignals.length} virksomheder i warm-signal prioriteringen.
        </p>
        {flowMessage ? (
          <p className="mt-3 text-sm text-[#2a5a4f]">{flowMessage}</p>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
            Trin 1
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
            Outreach-basen
          </h2>
          <p className="mt-3 text-sm leading-6 text-soft">
            Specialistlisten med positionering, matchområder og personlige åbninger.
          </p>

          <div className="mt-5 space-y-3">
            {initialLeads.slice(0, 8).map((lead) => (
              <div key={lead.vendorKey} className="border border-line bg-paper p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-ink">{lead.company}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#697b9e]">
                      {lead.primaryType} · Score {lead.qualificationScoreInitial}
                    </p>
                  </div>
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-[#2a5a4f]"
                  >
                    Website
                  </a>
                </div>
                <p className="mt-3 text-sm leading-6 text-soft">
                  {lead.personalizedOpening}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
            Trin 2
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
            Kontaktberigelse
          </h2>
          <p className="mt-3 text-sm leading-6 text-soft">
            Website-baserede kontaktspor med email, telefon, LinkedIn og confidence.
          </p>

          <div className="mt-5 space-y-3">
            {initialContacts
              .filter((item) => item.confidence === "high")
              .slice(0, 8)
              .map((contact) => (
                <div key={contact.vendorKey} className="border border-line bg-paper p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{contact.company}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#697b9e]">
                        Confidence {contact.confidence}
                      </p>
                    </div>
                    <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                      {contact.pagesScannedCount} sider
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-soft">
                    {contact.genericEmails[0] || contact.allEmails[0] || "Ingen email fundet"}{" "}
                    · {contact.phoneNumbers[0] || "Ingen telefon fundet"}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
          Trin 3
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
          Warm signals
        </h2>
        <p className="mt-3 text-sm leading-6 text-soft">
          Prioritering af hvilke virksomheder der er varmest at tage fat i først.
        </p>

        <div className="mt-5 space-y-3">
          {filteredWarmSignals.slice(0, 24).map((item) => (
            <details
              key={item.vendorKey}
              className="border border-line bg-paper"
            >
              <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{item.company}</p>
                    <p className="mt-1 text-sm text-soft">
                      {item.outreachChannel} · {item.contactConfidence}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                      Tier {item.warmSignalTier}
                    </span>
                    <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                      Score {item.warmSignalScore}
                    </span>
                  </div>
                </div>
              </summary>

              <div className="border-t border-line px-5 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 text-sm leading-6 text-soft">
                    <p>
                      <span className="font-semibold text-ink">Kontaktpunkt:</span>{" "}
                      {item.primaryEmail || item.primaryLinkedinUrl || item.primaryPhone || "Kræver manuel research"}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Hvorfor nu:</span>{" "}
                      {item.whyNow}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm leading-6 text-soft">
                    <p>
                      <span className="font-semibold text-ink">Åbning:</span>{" "}
                      {item.personalizedOpening}
                    </p>
                    <p>
                      <span className="font-semibold text-ink">Emne:</span>{" "}
                      {item.suggestedEmailSubject}
                    </p>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
          Trin 4
        </p>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-ink">
          Outreach drafts
        </h2>
        <p className="mt-3 text-sm leading-6 text-soft">
          Færdige første udkast til email og LinkedIn baseret på warm-signal prioriteringen.
        </p>

        <div className="mt-5 space-y-3">
          {filteredDrafts.slice(0, 12).map((draft) => (
            <details
              key={draft.vendorKey}
              className="border border-line bg-paper"
            >
              <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-ink">{draft.company}</p>
                    <p className="mt-1 text-sm text-soft">
                      {draft.primaryContact || "Ingen kontakt valgt endnu"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                      Tier {draft.warmSignalTier}
                    </span>
                    <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                      {draft.outreachChannel}
                    </span>
                    <span className="border border-line bg-white px-3 py-1 text-xs font-semibold text-soft">
                      {STATUS_OPTIONS.find(
                        (option) =>
                          option.value ===
                          (statusesByVendorKey.get(draft.vendorKey)?.status ?? "draft_ready"),
                      )?.label ?? "Draft klar"}
                    </span>
                  </div>
                </div>
              </summary>

              <div className="border-t border-line px-5 py-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#697b9e]">
                      Email
                    </p>
                    <p className="mt-3 text-sm font-semibold text-ink">
                      {draft.suggestedSubject}
                    </p>
                    <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-soft">
                      {draft.emailDraft}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#697b9e]">
                      LinkedIn og opfølgning
                    </p>
                    <p className="mt-3 text-sm font-semibold text-ink">LinkedIn</p>
                    <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-soft">
                      {draft.linkedInDraft}
                    </pre>
                    <p className="mt-4 text-sm font-semibold text-ink">Follow-up</p>
                    <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-soft">
                      {draft.followUpDraft}
                    </pre>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <div className="border border-line bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#697b9e]">
                      Outreach flow
                    </p>
                    <div className="mt-4 grid gap-3">
                      <select
                        value={statusDrafts[draft.vendorKey] ?? "draft_ready"}
                        onChange={(event) =>
                          setStatusDrafts((current) => ({
                            ...current,
                            [draft.vendorKey]: event.target.value as TheplanOutreachStatus,
                          }))
                        }
                        className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <textarea
                        rows={4}
                        value={statusNotes[draft.vendorKey] ?? ""}
                        onChange={(event) =>
                          setStatusNotes((current) => ({
                            ...current,
                            [draft.vendorKey]: event.target.value,
                          }))
                        }
                        placeholder="Intern note om dialogen med virksomheden"
                        className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                      />
                      <button
                        type="button"
                        onClick={() => saveStatus(draft)}
                        disabled={savingStatusKey === draft.vendorKey}
                        className="inline-flex items-center justify-center bg-[#050a1f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#101937] disabled:opacity-50"
                      >
                        {savingStatusKey === draft.vendorKey ? "Gemmer..." : "Gem status"}
                      </button>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => logCommunication(draft, "email")}
                          disabled={loggingKey === draft.vendorKey}
                          className="inline-flex items-center justify-center border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-50"
                        >
                          Log email sendt
                        </button>
                        <button
                          type="button"
                          onClick={() => logCommunication(draft, "linkedin")}
                          disabled={loggingKey === draft.vendorKey}
                          className="inline-flex items-center justify-center border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-50"
                        >
                          Log LinkedIn sendt
                        </button>
                        <button
                          type="button"
                          onClick={() => logCommunication(draft, "note")}
                          disabled={loggingKey === draft.vendorKey}
                          className="inline-flex items-center justify-center border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-50"
                        >
                          Log intern note
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-line bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#697b9e]">
                      Kommunikationslog
                    </p>
                    <div className="mt-4 space-y-3">
                      {(communicationByVendorKey.get(draft.vendorKey) ?? []).length === 0 ? (
                        <div className="text-sm text-soft">
                          Ingen kommunikation logget endnu.
                        </div>
                      ) : (
                        (communicationByVendorKey.get(draft.vendorKey) ?? [])
                          .slice(0, 6)
                          .map((entry) => (
                            <div key={entry.id} className="border border-line bg-paper px-4 py-3">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-ink">
                                    {entry.channel} · {entry.direction}
                                  </p>
                                  <p className="mt-1 text-sm text-soft">
                                    {entry.subject || "Ingen emnelinje"}
                                  </p>
                                </div>
                                <p className="text-xs text-soft">
                                  {new Date(entry.createdAt).toLocaleString("da-DK")}
                                </p>
                              </div>
                              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-soft">
                                {entry.content}
                              </pre>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
