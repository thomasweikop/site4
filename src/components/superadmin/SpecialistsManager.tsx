"use client";

import { useMemo, useState } from "react";
import type { EditableVendor } from "@/lib/superadminStore";

type SpecialistsManagerProps = {
  initialVendors: EditableVendor[];
};

export default function SpecialistsManager({
  initialVendors,
}: SpecialistsManagerProps) {
  const [vendors, setVendors] = useState(initialVendors);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const haystack = [
        vendor.name,
        vendor.bestFor,
        vendor.websiteSummaryDa,
        vendor.sectorFit,
        vendor.specialtyHighlights.join(" "),
        vendor.websiteSignalTags.join(" "),
        vendor.bestMatchAreas.join(" "),
        vendor.capabilityAreaLabels.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      if (typeFilter !== "all" && vendor.type !== typeFilter) {
        return false;
      }

      if (!query.trim()) {
        return true;
      }

      return haystack.includes(query.trim().toLowerCase());
    });
  }, [query, typeFilter, vendors]);

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

  function parseNullableNumber(value: string) {
    if (!value.trim()) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function saveVendor(vendor: EditableVendor) {
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
        setMessage(payload.error || "Kunne ikke gemme specialist.");
        return;
      }

      setMessage(`Gemt: ${vendor.name}`);
    } catch {
      setMessage("Netværksfejl under gemning.");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="border border-line bg-white p-8 shadow-[var(--shadow)]">
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.26em] text-[#697b9e]">
          Specialister
        </p>
        <h1 className="mt-4 text-balance font-display text-[3rem] leading-[0.94] text-ink">
          Specialistdatabase
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-soft">
          Søg i alle specialister, fold dem ud og redigér profil, kompetencer,
          scoring og kontaktoplysninger på en enkel måde.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Søg virksomhed, kompetence eller markedsfokus"
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          />
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-[#2a5a4f]"
          >
            <option value="all">Alle typer</option>
            <option value="legal">Legal</option>
            <option value="grc">GRC</option>
            <option value="technical">Technical</option>
            <option value="soc">SOC</option>
            <option value="audit">Audit</option>
          </select>
        </div>

        <p className="mt-4 text-sm text-soft">
          Viser {filteredVendors.length} af {vendors.length} specialister.
        </p>

        {message ? <p className="mt-3 text-sm text-[#2a5a4f]">{message}</p> : null}
      </section>

      <div className="space-y-4">
        {filteredVendors.map((vendor) => (
          <details
            key={vendor.key}
            className="border border-line bg-white shadow-[var(--shadow)]"
          >
            <summary className="cursor-pointer list-none px-6 py-5 [&::-webkit-details-marker]:hidden">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#697b9e]">
                    {vendor.type}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">
                    {vendor.name}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-soft">
                    {vendor.websiteSummaryDa || vendor.bestFor}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="border border-line bg-paper px-3 py-1 text-xs font-semibold text-soft">
                    Score {vendor.score}
                  </span>
                  <span className="border border-line bg-paper px-3 py-1 text-xs font-semibold text-soft">
                    {vendor.sizeFit.join(", ")}
                  </span>
                  <span className="border border-line bg-paper px-3 py-1 text-xs font-semibold text-soft">
                    Profil {vendor.profileTier}
                  </span>
                </div>
              </div>
            </summary>

            <div className="border-t border-line px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Virksomhed</span>
                  <input
                    value={vendor.name}
                    onChange={(event) =>
                      updateVendor(vendor.key, { name: event.target.value })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Type</span>
                  <select
                    value={vendor.type}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        type: event.target.value as EditableVendor["type"],
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  >
                    <option value="legal">Legal</option>
                    <option value="grc">GRC</option>
                    <option value="technical">Technical</option>
                    <option value="soc">SOC</option>
                    <option value="audit">Audit</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Profilniveau</span>
                  <select
                    value={vendor.profileTier}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        profileTier: event.target.value as EditableVendor["profileTier"],
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  >
                    <option value="directory">Directory</option>
                    <option value="verified">Verified</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Website</span>
                  <input
                    value={vendor.website}
                    onChange={(event) =>
                      updateVendor(vendor.key, { website: event.target.value })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Score</span>
                  <input
                    type="number"
                    value={vendor.score}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        score: Number(event.target.value) || 0,
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm md:col-span-2">
                  <span className="font-semibold text-ink">Vurdering af NIS2 kompetencer</span>
                  <textarea
                    value={vendor.bestFor}
                    onChange={(event) =>
                      updateVendor(vendor.key, { bestFor: event.target.value })
                    }
                    rows={3}
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm md:col-span-2">
                  <span className="font-semibold text-ink">Website-resume (DK)</span>
                  <textarea
                    value={vendor.websiteSummaryDa}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        websiteSummaryDa: event.target.value,
                      })
                    }
                    rows={3}
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Market fit</span>
                  <input
                    value={vendor.sectorFit}
                    onChange={(event) =>
                      updateVendor(vendor.key, { sectorFit: event.target.value })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Størrelses-fit</span>
                  <input
                    value={vendor.sizeFit.join(", ")}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        sizeFit: event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean) as EditableVendor["sizeFit"],
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm md:col-span-2">
                  <span className="font-semibold text-ink">Website-tags</span>
                  <input
                    value={vendor.websiteSignalTags.join(", ")}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        websiteSignalTags: event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Anbefalet rolle</span>
                  <input
                    value={vendor.recommendedRole}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        recommendedRole: event.target.value,
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Anbefalet når</span>
                  <input
                    value={vendor.recommendedWhen}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        recommendedWhen: event.target.value,
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm md:col-span-2">
                  <span className="font-semibold text-ink">Specialer</span>
                  <textarea
                    value={vendor.specialtyHighlights.join("\n")}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        specialtyHighlights: event.target.value
                          .split("\n")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                    rows={5}
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Website-signal</span>
                  <input
                    type="number"
                    value={vendor.websiteSignalScore}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        websiteSignalScore: Number(event.target.value) || 0,
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Website-dybde</span>
                  <input
                    type="number"
                    value={vendor.websiteDepthScore}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        websiteDepthScore: Number(event.target.value) || 0,
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Sager pr. år</span>
                  <input
                    type="number"
                    value={vendor.casesPerYear ?? ""}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        casesPerYear: parseNullableNumber(event.target.value),
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Dedikerede specialister</span>
                  <input
                    type="number"
                    value={vendor.dedicatedSpecialists ?? ""}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        dedicatedSpecialists: parseNullableNumber(
                          event.target.value,
                        ),
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="font-semibold text-ink">Manuel boost</span>
                  <input
                    type="number"
                    value={vendor.manualBoostScore}
                    onChange={(event) =>
                      updateVendor(vendor.key, {
                        manualBoostScore: Number(event.target.value) || 0,
                      })
                    }
                    className="border border-line bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-[#2a5a4f]"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-3 border border-line bg-paper p-4 text-xs text-soft md:grid-cols-4">
                <p>
                  <span className="font-semibold text-ink">Website evidence:</span>{" "}
                  {vendor.websiteEvidenceScore}
                </p>
                <p>
                  <span className="font-semibold text-ink">Profil-completeness:</span>{" "}
                  {vendor.profileCompletenessScore}
                </p>
                <p>
                  <span className="font-semibold text-ink">Capability breadth:</span>{" "}
                  {vendor.capabilityBreadthScore}
                </p>
                <p>
                  <span className="font-semibold text-ink">Sider scannet:</span>{" "}
                  {vendor.pagesScanned}
                </p>
              </div>

              {vendor.sourceUrls.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-ink">Kildesider</p>
                  <div className="flex flex-wrap gap-2">
                    {vendor.sourceUrls.map((sourceUrl) => (
                      <a
                        key={`${vendor.key}-${sourceUrl}`}
                        href={sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex border border-line bg-white px-3 py-2 text-xs text-ink transition hover:bg-paper"
                      >
                        {sourceUrl}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => saveVendor(vendor)}
                  disabled={savingKey === vendor.key}
                  className="inline-flex bg-[#050a1f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#101937] disabled:opacity-50"
                >
                  {savingKey === vendor.key ? "Gemmer..." : "Gem specialist"}
                </button>
                <a
                  href={vendor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
                >
                  Åbn website
                </a>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
