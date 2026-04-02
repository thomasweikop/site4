"use client";

import { useState } from "react";
import type { ScanResult } from "@/lib/nis2Scan";
import type { UnlockLead } from "@/lib/nis2Session";

type ReportUnlockFormProps = {
  sessionId: string;
  result: ScanResult;
  onUnlocked: (lead: UnlockLead) => void;
};

const EMPTY_LEAD: UnlockLead = {
  company: "",
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function ReportUnlockForm({
  sessionId,
  result,
  onUnlocked,
}: ReportUnlockFormProps) {
  const [lead, setLead] = useState<UnlockLead>(EMPTY_LEAD);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof UnlockLead>(key: K, value: UnlockLead[K]) {
    setLead((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/public/report-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...lead,
          score: result.percentage,
          status: result.band.status,
          profileSummary: result.profileSummary,
          weakestDimensions: result.weakestDimensions.map(
            (dimension) => `${dimension.label}: ${dimension.percentage}%`,
          ),
          blockers: result.blockers.map((blocker) => blocker.question),
          partnerRecommendations: result.partnerRecommendations.map(
            (partner) =>
              `${partner.label}: ${partner.primaryVendor?.name ?? partner.summary}`,
          ),
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Kunne ikke låse rapporten op.");
        return;
      }

      onUnlocked(lead);
    } catch {
      setError("Netværksfejl under oplåsning.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8"
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
        Fuld rapport
      </p>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.03em] text-ink">
        Lås den fulde rapport op
      </h2>
      <p className="mt-4 text-sm leading-6 text-soft">
        Angiv kontaktoplysninger, så kan virksomheden se den fulde rapport med
        4 dimensioner, 30/60/90-plan og partneranbefalinger.
      </p>

      <div className="mt-6 grid gap-4">
        <div>
          <label
            htmlFor="unlock-company"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Virksomhed
          </label>
          <input
            id="unlock-company"
            value={lead.company}
            onChange={(event) => update("company", event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Virksomhedens navn"
          />
        </div>

        <div>
          <label
            htmlFor="unlock-name"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Navn
          </label>
          <input
            id="unlock-name"
            required
            value={lead.name}
            onChange={(event) => update("name", event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Kontaktperson"
          />
        </div>

        <div>
          <label
            htmlFor="unlock-email"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Email
          </label>
          <input
            id="unlock-email"
            required
            type="email"
            value={lead.email}
            onChange={(event) => update("email", event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="navn@virksomhed.dk"
          />
        </div>

        <div>
          <label
            htmlFor="unlock-phone"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Telefon
          </label>
          <input
            id="unlock-phone"
            value={lead.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Valgfrit"
          />
        </div>

        <div>
          <label
            htmlFor="unlock-message"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Hvad vil virksomheden have afklaret først?
          </label>
          <textarea
            id="unlock-message"
            value={lead.message}
            onChange={(event) => update("message", event.target.value)}
            className="min-h-[120px] w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Fx scope, governance, incident response eller konkrete leverandørmatch."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex bg-sage px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0d4b43] disabled:cursor-not-allowed disabled:bg-[#8a95a8]"
      >
        {pending ? "Låser op..." : "Vis fuld rapport"}
      </button>

      {error ? <p className="mt-4 text-sm text-[#b64848]">{error}</p> : null}
    </form>
  );
}
