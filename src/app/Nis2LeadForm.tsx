"use client";

import { useState } from "react";

type FormState = {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

const EMPTY_FORM: FormState = {
  company: "",
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function Nis2LeadForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setSuccess(null);
    setError(null);

    const message = [
      "[NIS2 henvendelse]",
      "",
      `Virksomhed: ${form.company || "Ikke angivet"}`,
      `Navn: ${form.name || "Ikke angivet"}`,
      `Email: ${form.email || "Ikke angivet"}`,
      `Telefon: ${form.phone || "Ikke angivet"}`,
      "",
      form.message || "Ingen ekstra besked.",
    ].join("\n");

    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Kunne ikke sende henvendelsen.");
        return;
      }

      setForm(EMPTY_FORM);
      setSuccess("Tak. Vi har modtaget din NIS2-henvendelse og vender hurtigt tilbage.");
    } catch {
      setError("Netværksfejl under afsendelse.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[30px] border border-white/12 bg-white/6 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.32)] backdrop-blur md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-white">Virksomhed</label>
          <input
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            className="w-full rounded-[22px] border border-white/12 bg-white px-5 py-4 text-base text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-300/20"
            placeholder="Fx Weikop A/S"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Navn</label>
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            required
            className="w-full rounded-[22px] border border-white/12 bg-white px-5 py-4 text-base text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-300/20"
            placeholder="Dit navn"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-white">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            required
            className="w-full rounded-[22px] border border-white/12 bg-white px-5 py-4 text-base text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-300/20"
            placeholder="navn@virksomhed.dk"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-white">Telefon</label>
          <input
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="w-full rounded-[22px] border border-white/12 bg-white px-5 py-4 text-base text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-300/20"
            placeholder="Valgfrit"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-white">
            Hvad vil I gerne have hjælp til?
          </label>
          <textarea
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            className="min-h-[170px] w-full rounded-[22px] border border-white/12 bg-white px-5 py-4 text-base text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-300/20"
            placeholder="Fx scope-afklaring, ledelsesbriefing, gapanalyse, politikker eller beredskab."
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex rounded-full bg-sky-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {pending ? "Sender..." : "Book afklaringsmøde"}
        </button>
        <p className="text-sm text-slate-300">
          Kort afklaring først. Ingen binding. Praktisk næste skridt bagefter.
        </p>
      </div>

      {success ? <p className="mt-4 text-sm text-sky-300">{success}</p> : null}
      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
    </form>
  );
}
