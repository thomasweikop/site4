"use client";

import { useState } from "react";
import type { EditableQuestion } from "@/lib/superadminStore";

type QuestionsManagerProps = {
  initialQuestions: EditableQuestion[];
};

export default function QuestionsManager({
  initialQuestions,
}: QuestionsManagerProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function updateQuestion(id: string, patch: Partial<EditableQuestion>) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === id ? { ...question, ...patch } : question,
      ),
    );
  }

  async function saveQuestion(question: EditableQuestion) {
    setSavingId(question.id);
    setMessage(null);

    try {
      const response = await fetch("/api/superadmin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(question),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error || "Kunne ikke gemme spørgsmål.");
        return;
      }

      setMessage(`Gemt spørgsmål ${question.id}`);
    } catch {
      setMessage("Netværksfejl under gemning.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
          Spørgsmål
        </p>
        <h1 className="mt-4 font-display text-[3rem] leading-[0.94] text-ink">
          Screeningens spørgsmål
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-soft">
          Her kan spørgsmål, kategori, vægt og anbefalingstekst justeres.
        </p>
        {message ? <p className="mt-4 text-sm text-[#2a5a4f]">{message}</p> : null}
      </section>

      <div className="space-y-4">
        {questions.map((question) => (
          <article
            key={question.id}
            className="border border-line bg-white p-6 shadow-[var(--shadow)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
                  Spørgsmål {question.id}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">
                  {question.category}
                </h2>
              </div>
              <span className="border border-line bg-paper px-3 py-1 text-xs font-semibold text-soft">
                Vægt {question.weight}
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-ink">Kategori</span>
                <input
                  value={question.category}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      category: event.target.value,
                    })
                  }
                  className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-ink">Spørgsmålstekst</span>
                <textarea
                  value={question.question}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      question: event.target.value,
                    })
                  }
                  rows={3}
                  className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                />
              </label>

              <label className="grid gap-2 text-sm md:max-w-[220px]">
                <span className="font-semibold text-ink">Vægt</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={question.weight}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      weight: Number(event.target.value) || 1,
                    })
                  }
                  className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-semibold text-ink">Anbefalingstekst</span>
                <textarea
                  value={question.recommendation}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      recommendation: event.target.value,
                    })
                  }
                  rows={4}
                  className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => saveQuestion(question)}
              disabled={savingId === question.id}
              className="mt-5 inline-flex bg-[#050a1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#101937] disabled:opacity-50"
            >
              {savingId === question.id ? "Gemmer..." : "Gem spørgsmål"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
