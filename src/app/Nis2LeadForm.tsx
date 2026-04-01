"use client";

import { useState } from "react";

type FormState = {
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
};

type Nis2LeadFormProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  successMessage?: string;
  helperText?: string;
  sourceTag?: string;
  contextLines?: string[];
};

const EMPTY_FORM: FormState = {
  company: "",
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function Nis2LeadForm({
  eyebrow = "Få hjælp",
  title = "Vil I have hjælp til de næste skridt?",
  description = "Skriv kort hvor I står, og hvad I gerne vil have afklaret. Vi bruger det til at vende tilbage med et mere konkret næste skridt.",
  messageLabel = "Hvad vil I gerne have hjælp til?",
  messagePlaceholder = "Fx de største gaps efter scanen, scope-afklaring, leverandørstyring eller næste prioriterede arbejdspakke.",
  submitLabel = "Bliv kontaktet",
  successMessage = "Tak. Vi har modtaget jeres henvendelse og vender hurtigt tilbage.",
  helperText = "Kort afklaring først. Ingen binding. Praktisk næste skridt bagefter.",
  sourceTag = "NIS2 lead",
  contextLines = [],
}: Nis2LeadFormProps) {
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

    const extraContext = contextLines.filter(Boolean);
    const message = [
      `[${sourceTag}]`,
      "",
      ...(
        extraContext.length > 0
          ? ["Kontekst:", ...extraContext, ""]
          : []
      ),
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
      setSuccess(successMessage);
    } catch {
      setError("Netværksfejl under afsendelse.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[2.2rem] border border-line bg-surface p-6 shadow-[var(--shadow)] md:p-8"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ember">{eyebrow}</p>
        <h3 className="mt-3 text-balance font-display text-5xl leading-none text-ink">{title}</h3>
        <p className="mt-4 max-w-xl text-base leading-7 text-soft">{description}</p>
      </div>

      {contextLines.length > 0 ? (
        <div className="mt-6 rounded-[1.6rem] border border-line bg-page p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ember">Kontekst</p>
          <div className="mt-3 grid gap-2">
            {contextLines.map((line) => (
              <p key={line} className="text-sm leading-6 text-soft">
                {line}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="company" className="mb-2 block text-sm font-semibold text-ink">
            Virksomhed
          </label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            className="w-full rounded-[1.4rem] border border-line bg-page px-5 py-4 text-base text-ink outline-none transition focus:border-ember focus:ring-4 focus:ring-[#c55d3c]/15"
            placeholder="Fx Weikop A/S"
          />
        </div>

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-ink">
            Navn
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            required
            className="w-full rounded-[1.4rem] border border-line bg-page px-5 py-4 text-base text-ink outline-none transition focus:border-ember focus:ring-4 focus:ring-[#c55d3c]/15"
            placeholder="Dit navn"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            required
            className="w-full rounded-[1.4rem] border border-line bg-page px-5 py-4 text-base text-ink outline-none transition focus:border-ember focus:ring-4 focus:ring-[#c55d3c]/15"
            placeholder="navn@virksomhed.dk"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold text-ink">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="w-full rounded-[1.4rem] border border-line bg-page px-5 py-4 text-base text-ink outline-none transition focus:border-ember focus:ring-4 focus:ring-[#c55d3c]/15"
            placeholder="Valgfrit"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="message" className="mb-2 block text-sm font-semibold text-ink">
            {messageLabel}
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            className="min-h-[170px] w-full rounded-[1.4rem] border border-line bg-page px-5 py-4 text-base text-ink outline-none transition focus:border-ember focus:ring-4 focus:ring-[#c55d3c]/15"
            placeholder={messagePlaceholder}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex rounded-full bg-ember px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#a94f34] disabled:cursor-not-allowed disabled:bg-[#c0a79d]"
        >
          {pending ? "Sender..." : submitLabel}
        </button>
        <p className="text-sm text-soft">{helperText}</p>
      </div>

      <div aria-live="polite" className="mt-4 space-y-2">
        {success ? <p className="text-sm text-sage">{success}</p> : null}
        {error ? <p className="text-sm text-ember">{error}</p> : null}
      </div>
    </form>
  );
}
