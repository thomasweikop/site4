"use client";

import Link from "next/link";
import { useState } from "react";
import type {
  EditableVendor,
  LogoReviewPageData,
} from "@/lib/superadminStore";

type LogoReviewManagerProps = LogoReviewPageData;

const STATUS_LABELS: Record<EditableVendor["logoStatus"], string> = {
  missing: "Mangler",
  candidate: "Kandidat fundet",
  approved: "Godkendt",
  rejected: "Afvist",
};

export default function LogoReviewManager({
  vendors: initialVendors,
  counts,
  totalCount,
  totalPages,
  currentPage,
  query,
  statusFilter,
}: LogoReviewManagerProps) {
  const [vendors, setVendors] = useState(initialVendors);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  function buildPageHref(nextPage: number) {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const search = params.toString();
    return search ? `/superadmin/logoer?${search}` : "/superadmin/logoer";
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

        <form
          method="GET"
          action="/superadmin/logoer"
          className="mt-6 space-y-4"
        >
          <input type="hidden" name="page" value="1" />
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px_auto]">
            <input
              name="q"
              defaultValue={query}
              placeholder="Søg virksomhed, noter eller kilde"
              className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            />
            <select
              name="status"
              defaultValue={statusFilter}
              className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
            >
              <option value="all">Alle logo-statusser</option>
              <option value="missing">Mangler</option>
              <option value="candidate">Kandidat fundet</option>
              <option value="approved">Godkendt</option>
              <option value="rejected">Afvist</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-[#050a1f] px-5 py-3 text-sm font-semibold !text-white transition hover:bg-[#101937]"
            >
              Opdater liste
            </button>
          </div>
        </form>

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
            Viser {vendors.length} på side {currentPage} af {totalPages} ·{" "}
            {totalCount} matcher nuværende filter
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={buildPageHref(currentPage - 1)}
              aria-disabled={currentPage === 1}
              className={`inline-flex border border-line bg-white px-4 py-2 font-semibold text-ink transition hover:bg-paper ${
                currentPage === 1 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              Forrige 20
            </Link>
            <Link
              href={buildPageHref(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              className={`inline-flex border border-line bg-white px-4 py-2 font-semibold text-ink transition hover:bg-paper ${
                currentPage === totalPages
                  ? "pointer-events-none opacity-40"
                  : ""
              }`}
            >
              Næste 20
            </Link>
            <Link
              href="/superadmin/logoer"
              className="inline-flex border border-line bg-white px-4 py-2 font-semibold text-ink transition hover:bg-paper"
            >
              Nulstil filtre
            </Link>
          </div>
        </div>

        {message ? <p className="mt-4 text-sm text-[#2a5a4f]">{message}</p> : null}
      </section>

      <div className="space-y-4">
        {vendors.map((vendor) => {
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
