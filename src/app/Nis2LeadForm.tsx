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
  title = "Skal virksomheden have hjælp til de næste skridt?",
  description = "Skriv kort hvor virksomheden står, og hvad virksomheden gerne vil have afklaret. Oplysningerne bruges til at vende tilbage med et mere konkret næste skridt.",
  messageLabel = "Hvad skal virksomheden have hjælp til?",
  messagePlaceholder = "Fx de største gaps efter scanen, scope-afklaring, leverandørstyring eller næste prioriterede arbejdspakke.",
  submitLabel = "Bliv kontaktet",
  successMessage = "Tak. Henvendelsen er modtaget, og der vendes hurtigt tilbage.",
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
      ...(extraContext.length > 0 ? ["Kontekst:", ...extraContext, ""] : []),
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
      className="border border-line bg-white p-6 shadow-[var(--shadow)] md:p-8"
    >
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
          {eyebrow}
        </p>
        <h3 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[2.95rem]">
          {title}
        </h3>
        <p className="mt-4 max-w-xl text-base leading-7 text-soft">
          {description}
        </p>
      </div>

      {contextLines.length > 0 ? (
        <div className="mt-6 border border-line bg-paper p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
            Kontekst
          </p>
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
          <label
            htmlFor="company"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Virksomhed
          </label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            className="w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Fx Weikop A/S"
          />
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Navn
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            required
            className="w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Navn på kontaktperson"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-ink"
          >
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
            className="w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="navn@virksomhed.dk"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder="Valgfrit"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            {messageLabel}
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            className="min-h-[170px] w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
            placeholder={messagePlaceholder}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex bg-sage px-7 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43] disabled:cursor-not-allowed disabled:bg-[#8a95a8] disabled:!text-white"
        >
          {pending ? "Sender..." : submitLabel}
        </button>
        <p className="text-sm text-soft">{helperText}</p>
      </div>

      <div aria-live="polite" className="mt-4 space-y-2">
        {success ? <p className="text-sm text-[#216a4d]">{success}</p> : null}
        {error ? <p className="text-sm text-[#b64848]">{error}</p> : null}
      </div>
    </form>
  );
}
