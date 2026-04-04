"use client";

import { useMemo, useState } from "react";
import type { SubmittedUserRecord } from "@/lib/superadminStore";

type UsersManagerProps = {
  initialUsers: SubmittedUserRecord[];
};

export default function UsersManager({ initialUsers }: UsersManagerProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return users;
    }

    return users.filter((item) =>
      [
        item.lead.company,
        item.lead.name,
        item.lead.title,
        item.lead.email,
        item.lead.phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, users]);

  function updateUser(sessionId: string, patch: Partial<SubmittedUserRecord["lead"]>) {
    setUsers((current) =>
      current.map((item) =>
        item.sessionId === sessionId
          ? { ...item, lead: { ...item.lead, ...patch } }
          : item,
      ),
    );
  }

  async function saveUser(user: SubmittedUserRecord) {
    setSavingId(user.sessionId);
    setMessage(null);

    try {
      const response = await fetch("/api/superadmin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: user.sessionId,
          lead: user.lead,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error || "Kunne ikke gemme bruger.");
        return;
      }

      setMessage(`Gemt: ${user.lead.name}`);
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
          Brugere
        </p>
        <h1 className="mt-4 font-display text-[3rem] leading-[0.94] text-ink">
          Indsendte kontaktoplysninger
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-soft">
          Se og redigér alle indsendte oplysninger fra brugere der har bestilt
          anbefalinger eller specialist-hjælp.
        </p>

        <div className="mt-6">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Søg navn, virksomhed, titel, email eller telefon"
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          />
        </div>

        <p className="mt-4 text-sm text-soft">
          Viser {filteredUsers.length} af {users.length} brugere.
        </p>
        {message ? <p className="mt-3 text-sm text-[#2a5a4f]">{message}</p> : null}
      </section>

      <div className="space-y-4">
        {filteredUsers.map((item) => (
          <details
            key={item.sessionId}
            className="border border-line bg-white shadow-[var(--shadow)]"
          >
            <summary className="cursor-pointer list-none px-6 py-5 [&::-webkit-details-marker]:hidden">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
                    Session {item.sessionId.slice(0, 8)}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {item.lead.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-soft">
                    {item.lead.company} · {item.lead.email}
                  </p>
                </div>
                <div className="text-right text-sm text-soft">
                  <p>{new Date(item.updatedAt).toLocaleString("da-DK")}</p>
                  <p className="mt-2">{item.profile.industry} / {item.profile.companySize}</p>
                </div>
              </div>
            </summary>

            <div className="border-t border-line px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Virksomhed</span>
                  <input
                    value={item.lead.company}
                    onChange={(event) =>
                      updateUser(item.sessionId, { company: event.target.value })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Navn</span>
                  <input
                    value={item.lead.name}
                    onChange={(event) =>
                      updateUser(item.sessionId, { name: event.target.value })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Titel</span>
                  <input
                    value={item.lead.title ?? ""}
                    onChange={(event) =>
                      updateUser(item.sessionId, { title: event.target.value })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Email</span>
                  <input
                    value={item.lead.email}
                    onChange={(event) =>
                      updateUser(item.sessionId, { email: event.target.value })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Telefon</span>
                  <input
                    value={item.lead.phone}
                    onChange={(event) =>
                      updateUser(item.sessionId, { phone: event.target.value })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>
                <label className="grid gap-2 text-sm md:col-span-2">
                  <span className="font-semibold text-ink">Besked</span>
                  <textarea
                    value={item.lead.message}
                    onChange={(event) =>
                      updateUser(item.sessionId, { message: event.target.value })
                    }
                    rows={4}
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => saveUser(item)}
                disabled={savingId === item.sessionId}
                className="mt-5 inline-flex bg-[#050a1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#101937] disabled:opacity-50"
              >
                {savingId === item.sessionId ? "Gemmer..." : "Gem bruger"}
              </button>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
