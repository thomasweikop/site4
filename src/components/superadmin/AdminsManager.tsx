"use client";

import { useState } from "react";
import type { SuperadminUser } from "@/lib/superadminStore";

type AdminsManagerProps = {
  initialAdmins: SuperadminUser[];
};

export default function AdminsManager({ initialAdmins }: AdminsManagerProps) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function addAdmin() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/superadmin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        error?: string;
        admin?: SuperadminUser;
      };

      if (!response.ok || !payload.admin) {
        setMessage(payload.error || "Kunne ikke oprette admin.");
        return;
      }

      const createdAdmin = payload.admin;

      setAdmins((current) =>
        [...current, createdAdmin].sort((left, right) =>
          left.email.localeCompare(right.email, "da"),
        ),
      );
      setEmail("");
      setPassword("");
      setMessage(`Admin oprettet: ${createdAdmin.email}`);
    } catch {
      setMessage("Netværksfejl under oprettelse.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
          Admin
        </p>
        <h1 className="mt-4 font-display text-[3rem] leading-[0.94] text-ink">
          Admin-adgange
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-soft">
          Se hvem der har adgang til superadmin, og opret nye administratorer
          direkte herfra.
        </p>
        {message ? <p className="mt-4 text-sm text-[#2a5a4f]">{message}</p> : null}
      </section>

      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <h2 className="text-xl font-semibold text-ink">Tilføj ny admin</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-semibold text-ink">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="navn@virksomhed.dk"
              className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="font-semibold text-ink">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 tegn"
              className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={addAdmin}
          disabled={pending}
          className="mt-5 inline-flex bg-[#050a1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#101937] disabled:opacity-50"
        >
          {pending ? "Opretter..." : "Tilføj admin"}
        </button>
      </section>

      <section className="space-y-4">
        {admins.map((admin) => (
          <article
            key={admin.id}
            className="border border-line bg-white p-6 shadow-[var(--shadow)]"
          >
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
              Admin
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">
              {admin.email}
            </h2>
            <p className="mt-3 text-sm leading-6 text-soft">
              Oprettet {new Date(admin.createdAt).toLocaleString("da-DK")}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
