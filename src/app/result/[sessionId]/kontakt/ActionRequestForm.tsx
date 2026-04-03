"use client";

import { useState } from "react";

type ActionRequestFormProps = {
  sessionId: string;
  initialCompany?: string;
  initialName?: string;
  initialTitle?: string;
  initialEmail?: string;
  areas: string[];
};

type FormState = {
  company: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  consent: boolean;
};

export default function ActionRequestForm({
  sessionId,
  initialCompany = "",
  initialName = "",
  initialTitle = "",
  initialEmail = "",
  areas,
}: ActionRequestFormProps) {
  const [form, setForm] = useState<FormState>({
    company: initialCompany,
    name: initialName,
    title: initialTitle,
    email: initialEmail,
    phone: "",
    consent: true,
  });
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

    try {
      const response = await fetch("/api/public/action-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          company: form.company,
          name: form.name,
          title: form.title,
          email: form.email,
          phone: form.phone,
          consent: form.consent,
          areas,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Kunne ikke sende henvendelsen.");
        return;
      }

      setSuccess("Tak. Henvendelsen er sendt, og der følges op hurtigst muligt.");
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
      <div className="grid gap-4">
        <div>
          <label
            htmlFor="action-company"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Virksomhed
          </label>
          <input
            id="action-company"
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            className="w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
          />
        </div>

        <div>
          <label
            htmlFor="action-name"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Personens navn
          </label>
          <input
            id="action-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
          />
        </div>

        <div>
          <label
            htmlFor="action-title"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Titel
          </label>
          <input
            id="action-title"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            className="w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
            autoComplete="organization-title"
          />
        </div>

        <div>
          <label
            htmlFor="action-email"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Email
          </label>
          <input
            id="action-email"
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className="w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
          />
        </div>

        <div>
          <label
            htmlFor="action-phone"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Telefon
          </label>
          <input
            id="action-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="w-full border border-line bg-paper px-5 py-4 text-base text-ink outline-none transition focus:border-[#2a5a4f]"
          />
        </div>
      </div>

      <div className="mt-6 border border-line bg-paper p-4">
        <label className="flex items-start gap-3 text-sm leading-6 text-soft">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(event) => update("consent", event.target.checked)}
            className="mt-1 h-4 w-4 accent-[#2a5a4f]"
          />
          <span>
            Ja, tak til at blive kontaktet af ComplyCheck eller vores partnere.
          </span>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex bg-sage px-7 py-3 text-sm font-semibold !text-white transition hover:bg-[#0d4b43] disabled:cursor-not-allowed disabled:bg-[#8a95a8] disabled:!text-white"
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
