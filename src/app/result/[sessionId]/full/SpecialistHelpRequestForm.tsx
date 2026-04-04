"use client";

import { useMemo, useState } from "react";
import {
  VENDOR_TYPE_META,
  type VendorType,
} from "@/lib/nis2BuildPack";
import {
  getStoredReportSession,
  markReportUnlocked,
  type UnlockLead,
} from "@/lib/nis2Session";

type AreaOption = {
  key: string;
  label: string;
};

type SpecialistHelpRequestFormProps = {
  sessionId: string;
  initialCompany?: string;
  initialName?: string;
  initialTitle?: string;
  initialEmail?: string;
  areaOptions: AreaOption[];
  initialTrackTypes: VendorType[];
};

type FormState = {
  company: string;
  name: string;
  title: string;
  email: string;
  selectedAreas: string[];
  selectedTracks: VendorType[];
};

const TRACK_OPTIONS = (
  Object.entries(VENDOR_TYPE_META) as Array<
    [VendorType, (typeof VENDOR_TYPE_META)[VendorType]]
  >
).map(([value, meta]) => ({
  value,
  label: meta.label,
  summary: meta.summary,
}));

function toggleSelection<T>(currentValues: T[], value: T) {
  return currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];
}

export default function SpecialistHelpRequestForm({
  sessionId,
  initialCompany = "",
  initialName = "",
  initialTitle = "",
  initialEmail = "",
  areaOptions,
  initialTrackTypes,
}: SpecialistHelpRequestFormProps) {
  const [form, setForm] = useState<FormState>({
    company: initialCompany,
    name: initialName,
    title: initialTitle,
    email: initialEmail,
    selectedAreas: areaOptions.map((area) => area.label),
    selectedTracks:
      initialTrackTypes.length > 0
        ? initialTrackTypes
        : TRACK_OPTIONS.slice(0, 3).map((option) => option.value),
  });
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedAreaLabels = useMemo(
    () => areaOptions.filter((area) => form.selectedAreas.includes(area.label)),
    [areaOptions, form.selectedAreas],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch("/api/public/specialist-help-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          company: form.company,
          name: form.name,
          title: form.title,
          email: form.email,
          selectedAreas: form.selectedAreas,
          selectedTracks: form.selectedTracks,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Kunne ikke sende specialistønsket.");
        return;
      }

      const existingLead = getStoredReportSession(sessionId)?.unlockLead;
      const unlockLead: UnlockLead = {
        company: form.company,
        name: form.name,
        title: form.title,
        email: form.email,
        phone: existingLead?.phone ?? "",
        message: existingLead?.message ?? "",
      };

      markReportUnlocked(sessionId, unlockLead);
      setSuccess(
        `Tak. Ønsket er registreret, og næste specialistoverblik bliver sendt til ${form.email}.`,
      );
    } catch {
      setError("Netværksfejl under afsendelse.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-balance font-display text-[2rem] leading-none text-ink md:text-[2.35rem]">
            Få hjælp til at identificere specialister
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-soft md:text-base">
            ComplyCheck har opbygget en stor database over rådgivere og
            specialistmiljøer i Danmark med fokus på NIS2-relaterede leverancer.
            Vælg nedenfor hvilke områder virksomheden ønsker hjælp indenfor, og
            hvilke specialistspor der skal prioriteres. Så sender vi næste
            specialistoverblik på email.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-soft md:text-base">
            Kontaktinformationerne kan redigeres her, hvis der fx står John Doe
            eller en midlertidig titel i feltet.
          </p>
        </section>

        <section>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            Områder
          </p>
          <div className="mt-4 grid gap-3">
            {areaOptions.map((area) => {
              const checked = form.selectedAreas.includes(area.label);

              return (
                <label
                  key={area.key}
                  className="flex cursor-pointer items-start gap-3 border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft transition hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      update(
                        "selectedAreas",
                        toggleSelection(form.selectedAreas, area.label),
                      )
                    }
                    className="mt-1 h-4 w-4 accent-[#2a5a4f]"
                  />
                  <span className="font-medium text-ink">{area.label}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            Specialistspor
          </p>
          <div className="mt-4 grid gap-3">
            {TRACK_OPTIONS.map((option) => {
              const checked = form.selectedTracks.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-start gap-3 border border-line bg-paper px-4 py-4 text-sm leading-6 text-soft transition hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      update(
                        "selectedTracks",
                        toggleSelection(form.selectedTracks, option.value),
                      )
                    }
                    className="mt-1 h-4 w-4 accent-[#2a5a4f]"
                  />
                  <span>
                    <span className="block font-medium text-ink">
                      {option.label}
                    </span>
                    <span className="block text-soft">{option.summary}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
            Det bliver sendt til
          </p>
          <div className="mt-4 border border-line bg-paper p-4">
            <dl className="grid gap-2 text-sm leading-6 text-soft">
              <div>
                <dt className="font-semibold text-ink">Virksomhed</dt>
                <dd>{form.company || "Ikke angivet"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Navn</dt>
                <dd>{form.name || "Ikke angivet"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Titel</dt>
                <dd>{form.title || "Ikke angivet"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Email</dt>
                <dd>{form.email || "Ikke angivet"}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Valgte områder</dt>
                <dd>
                  {selectedAreaLabels.length > 0
                    ? selectedAreaLabels.map((area) => area.label).join(", ")
                    : "Ingen områder valgt"}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="grid gap-4">
          <div>
            <label
              htmlFor="specialist-company"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Virksomhed
            </label>
            <input
              id="specialist-company"
              required
              value={form.company}
              onChange={(event) => update("company", event.target.value)}
              className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            />
          </div>

          <div>
            <label
              htmlFor="specialist-name"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Navn
            </label>
            <input
              id="specialist-name"
              required
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            />
          </div>

          <div>
            <label
              htmlFor="specialist-title"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Titel
            </label>
            <input
              id="specialist-title"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
              autoComplete="organization-title"
            />
          </div>

          <div>
            <label
              htmlFor="specialist-email"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Email
            </label>
            <input
              id="specialist-email"
              required
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            />
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex bg-sage px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43] disabled:cursor-not-allowed disabled:bg-[#8a95a8] disabled:!text-white"
        >
          {pending ? "Sender..." : "Send"}
        </button>
      </div>

      <div aria-live="polite" className="mt-4 space-y-2">
        {success ? <p className="text-sm text-[#216a4d]">{success}</p> : null}
        {error ? <p className="text-sm text-[#b64848]">{error}</p> : null}
      </div>
    </form>
  );
}
