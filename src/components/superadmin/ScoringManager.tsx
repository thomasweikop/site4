"use client";

import { useState } from "react";
import type { EditableScoringConfig } from "@/lib/superadminStore";

type ScoringManagerProps = {
  initialConfig: EditableScoringConfig;
};

export default function ScoringManager({ initialConfig }: ScoringManagerProps) {
  const [config, setConfig] = useState(initialConfig);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateAnswerPoint(key: string, value: number) {
    setConfig((current) => ({
      ...current,
      answerPoints: {
        ...current.answerPoints,
        [key]: value,
      },
    }));
  }

  function updateBand(
    bandId: string,
    patch: Partial<EditableScoringConfig["scoreBands"][number]>,
  ) {
    setConfig((current) => ({
      ...current,
      scoreBands: current.scoreBands.map((band) =>
        band.id === bandId ? { ...band, ...patch } : band,
      ),
    }));
  }

  async function save() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/superadmin/scoring", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error || "Kunne ikke gemme scoring.");
        return;
      }

      setMessage("Scoring gemt.");
    } catch {
      setMessage("Netværksfejl under gemning.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
          Scoring
        </p>
        <h1 className="mt-4 font-display text-[3rem] leading-[0.94] text-ink">
          Pointmodel og scorebånd
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-soft">
          Redigér point for svarmuligheder og de bånd der beskriver det
          samlede modenhedsbillede.
        </p>
        {message ? <p className="mt-4 text-sm text-[#2a5a4f]">{message}</p> : null}
      </section>

      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <h2 className="text-xl font-semibold text-ink">Svarmuligheder</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {Object.entries(config.answerPoints).map(([key, value]) => (
            <label key={key} className="grid gap-2 text-sm">
              <span className="font-semibold capitalize text-ink">{key}</span>
              <input
                type="number"
                value={value}
                onChange={(event) =>
                  updateAnswerPoint(key, Number(event.target.value) || 0)
                }
                className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {config.scoreBands.map((band) => (
          <article
            key={band.id}
            className="border border-line bg-white p-8 shadow-[var(--shadow)]"
          >
            <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-ink">Minimum score</span>
                <input
                  type="number"
                  value={band.min}
                  onChange={(event) =>
                    updateBand(band.id, {
                      min: Number(event.target.value) || 0,
                    })
                  }
                  className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-ink">Status</span>
                <input
                  value={band.status}
                  onChange={(event) =>
                    updateBand(band.id, {
                      status: event.target.value,
                    })
                  }
                  className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                />
              </label>
            </div>
            <label className="mt-4 grid gap-2 text-sm">
              <span className="font-semibold text-ink">Beskrivelse</span>
              <textarea
                value={band.summary}
                onChange={(event) =>
                  updateBand(band.id, {
                    summary: event.target.value,
                  })
                }
                rows={3}
                className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
              />
            </label>
          </article>
        ))}
      </section>

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="inline-flex bg-[#050a1f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#101937] disabled:opacity-50"
      >
        {pending ? "Gemmer..." : "Gem scoring"}
      </button>
    </div>
  );
}
