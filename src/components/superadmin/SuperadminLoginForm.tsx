"use client";

import { useState } from "react";

export default function SuperadminLoginForm() {
  const [email, setEmail] = useState("thomas.weikop@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/superadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Login mislykkedes.");
        return;
      }

      window.location.href = "/superadmin";
    } catch {
      setError("Netværksfejl under login.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-line bg-white p-8 shadow-[var(--shadow)]"
    >
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#697b9e]">
        Superadmin login
      </p>
      <h1 className="mt-4 text-balance font-display text-[2.6rem] leading-[0.95] text-ink">
        Log ind på ComplyCheck admin
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-soft">
        Adgangen beskytter sessions, specialister, brugere, spørgsmål, scoring
        og admin-brugere.
      </p>

      <div className="mt-8 grid gap-4">
        <div>
          <label
            htmlFor="superadmin-email"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Email
          </label>
          <input
            id="superadmin-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          />
        </div>

        <div>
          <label
            htmlFor="superadmin-password"
            className="mb-2 block text-sm font-semibold text-ink"
          >
            Password
          </label>
          <input
            id="superadmin-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex bg-[#050a1f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#101937] disabled:opacity-50"
      >
        {pending ? "Logger ind..." : "Log ind"}
      </button>

      {error ? <p className="mt-4 text-sm text-[#b64848]">{error}</p> : null}
    </form>
  );
}
