"use client";

import { useMemo, useState } from "react";
import type { EditableVendor } from "@/lib/superadminStore";

type LogoReviewManagerProps = {
  initialVendors: EditableVendor[];
};

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<EditableVendor["logoStatus"], string> = {
  missing: "Mangler",
  candidate: "Kandidat fundet",
  approved: "Godkendt",
  rejected: "Afvist",
};

const STATUS_ORDER: Record<EditableVendor["logoStatus"], number> = {
  candidate: 0,
  missing: 1,
  rejected: 2,
  approved: 3,
};

export default function LogoReviewManager({
  initialVendors,
}: LogoReviewManagerProps) {
  const [vendors, setVendors] = useState(initialVendors);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredVendors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...vendors]
      .filter((vendor) => {
        if (statusFilter !== "all" && vendor.logoStatus !== statusFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          vendor.name,
          vendor.website,
          vendor.logoCandidateUrl,
          vendor.logoOfficialSourceUrl,
          vendor.logoNotes,
          vendor.websiteSummaryDa,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((left, right) => {
        const statusDiff =
          STATUS_ORDER[left.logoStatus] - STATUS_ORDER[right.logoStatus];

        if (statusDiff !== 0) {
          return statusDiff;
        }

        return left.name.localeCompare(right.name, "da");
      });
  }, [query, statusFilter, vendors]);

  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedVendors = filteredVendors.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const counts = useMemo(() => {
    return vendors.reduce(
      (accumulator, vendor) => {
        accumulator[vendor.logoStatus] += 1;
        return accumulator;
      },
      {
        missing: 0,
        candidate: 0,
        approved: 0,
        rejected: 0,
      } satisfies Record<EditableVendor["logoStatus"], number>,
    );
  }, [vendors]);

  function updateVendor(
    vendorKey: string,
    patch: Partial<EditableVendor>,
  ) {
    setVendors((current) =>
      current.map((vendor) =>
        vendor.key === vendorKey ? { ...vendor, ...patch } : vendor,
      ),
    );
  }

  async function saveVendor(vendor: EditableVendor, successMessage?: string) {
    setSavingKey(vendor.key);
    setMessage(null);

    try {
      const response = await fetch("/api/superadmin/vendors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendor),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error || "Kunne ikke gemme logo-status.");
        return false;
      }

      setMessage(successMessage || `Gemt: ${vendor.name}`);
      return true;
    } catch {
      setMessage("Netværksfejl under gemning.");
      return false;
    } finally {
      setSavingKey(null);
    }
  }

  async function updateVendorStatus(
    vendor: EditableVendor,
    nextStatus: EditableVendor["logoStatus"],
  ) {
    const nextVendor = {
      ...vendor,
      logoStatus: nextStatus,
    };

    updateVendor(vendor.key, { logoStatus: nextStatus });
    await saveVendor(
      nextVendor,
      `${vendor.name}: ${STATUS_LABELS[nextStatus].toLowerCase()}`,
    );
  }

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
          Logo-review
        </p>
        <h1 className="mt-4 text-balance font-display text-[3rem] leading-[0.94] text-ink">
          Logo-kandidater
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-soft">
          Gennemgå specialister i batches af 20. Tilføj kandidat-logo, link til
          officiel kilde og godkend direkte uden at åbne hver specialist for
          sig.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Søg virksomhed, noter eller kilde"
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          >
            <option value="all">Alle logo-statusser</option>
            <option value="missing">Mangler</option>
            <option value="candidate">Kandidat fundet</option>
            <option value="approved">Godkendt</option>
            <option value="rejected">Afvist</option>
          </select>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {(
            [
              ["missing", "Mangler"],
              ["candidate", "Kandidat fundet"],
              ["approved", "Godkendt"],
              ["rejected", "Afvist"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="border border-line bg-paper px-4 py-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#697b9e]">
                {label}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#050a1f]">
                {counts[key]}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 text-sm text-soft md:flex-row md:items-center md:justify-between">
          <p>
            Viser {pagedVendors.length} på side {currentPage} af {totalPages}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="inline-flex border border-line bg-white px-4 py-2 font-semibold text-ink transition hover:bg-paper disabled:opacity-40"
            >
              Forrige 20
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              disabled={currentPage === totalPages}
              className="inline-flex border border-line bg-white px-4 py-2 font-semibold text-ink transition hover:bg-paper disabled:opacity-40"
            >
              Næste 20
            </button>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-[#2a5a4f]">{message}</p> : null}
      </section>

      <div className="space-y-4">
        {pagedVendors.map((vendor) => {
          const pending = savingKey === vendor.key;

          return (
            <section
              key={vendor.key}
              className="border border-line bg-white p-6 shadow-[var(--shadow)]"
            >
              <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
                <div className="space-y-3">
                  <div className="flex aspect-square items-center justify-center border border-line bg-paper p-4">
                    {vendor.logoCandidateUrl ? (
                      <img
                        src={vendor.logoCandidateUrl}
                        alt={`${vendor.name} logo-kandidat`}
                        className="max-h-full max-w-full object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
                          Logo
                        </p>
                        <p className="mt-3 text-sm text-soft">Ingen kandidat endnu</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-ink">{vendor.name}</p>
                    <p className="text-soft">{vendor.type}</p>
                    <a
                      href={vendor.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-[#2a5a4f] underline underline-offset-4"
                    >
                      Åbn website
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
                      {vendor.name}
                    </h2>
                    <span className="border border-line bg-paper px-3 py-1 text-xs font-semibold text-soft">
                      {STATUS_LABELS[vendor.logoStatus]}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm">
                      <span className="font-semibold text-ink">Kandidat-logo URL</span>
                      <input
                        value={vendor.logoCandidateUrl}
                        onChange={(event) =>
                          updateVendor(vendor.key, {
                            logoCandidateUrl: event.target.value,
                          })
                        }
                        className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                      />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="font-semibold text-ink">Officiel kildeside</span>
                      <input
                        value={vendor.logoOfficialSourceUrl}
                        onChange={(event) =>
                          updateVendor(vendor.key, {
                            logoOfficialSourceUrl: event.target.value,
                          })
                        }
                        className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm">
                    <span className="font-semibold text-ink">Logo-noter</span>
                    <textarea
                      rows={4}
                      value={vendor.logoNotes}
                      onChange={(event) =>
                        updateVendor(vendor.key, {
                          logoNotes: event.target.value,
                        })
                      }
                      className="border border-line bg-paper px-4 py-3 text-sm leading-6 text-ink outline-none focus:border-[#2a5a4f]"
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => saveVendor(vendor)}
                      disabled={pending}
                      className="inline-flex bg-[#050a1f] px-4 py-2 text-sm font-semibold !text-white transition hover:bg-[#101937] disabled:opacity-40"
                    >
                      {pending ? "Gemmer..." : "Gem felter"}
                    </button>
                    {vendor.logoOfficialSourceUrl ? (
                      <a
                        href={vendor.logoOfficialSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper"
                      >
                        Åbn officiel kilde
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-3 border border-line bg-paper p-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#697b9e]">
                    Hurtige handlinger
                  </p>
                  <button
                    type="button"
                    onClick={() => updateVendorStatus(vendor, "candidate")}
                    disabled={pending}
                    className="w-full border border-line bg-white px-4 py-3 text-left text-sm font-semibold text-ink transition hover:bg-[#eef4ff] disabled:opacity-40"
                  >
                    Sæt som kandidat fundet
                  </button>
                  <button
                    type="button"
                    onClick={() => updateVendorStatus(vendor, "approved")}
                    disabled={pending}
                    className="w-full bg-[#2a5a4f] px-4 py-3 text-left text-sm font-semibold !text-white transition hover:bg-[#20483f] disabled:opacity-40"
                  >
                    Godkend logo
                  </button>
                  <button
                    type="button"
                    onClick={() => updateVendorStatus(vendor, "rejected")}
                    disabled={pending}
                    className="w-full border border-[#c86b6b] bg-white px-4 py-3 text-left text-sm font-semibold text-[#8b3939] transition hover:bg-[#fff1f1] disabled:opacity-40"
                  >
                    Afvis logo
                  </button>
                  <button
                    type="button"
                    onClick={() => updateVendorStatus(vendor, "missing")}
                    disabled={pending}
                    className="w-full border border-line bg-white px-4 py-3 text-left text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-40"
                  >
                    Sæt tilbage til mangler
                  </button>
                  <p className="pt-2 text-xs leading-5 text-soft">
                    Kun status <span className="font-semibold text-ink">Godkendt</span> viser
                    logoet live på websitet.
                  </p>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
