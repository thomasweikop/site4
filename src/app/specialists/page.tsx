import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import {
  VENDOR_DIRECTORY,
  VENDOR_TYPE_META,
  type VendorType,
} from "@/lib/nis2BuildPack";

export const metadata: Metadata = {
  title: "Specialist Liste | ComplyCheck",
  description:
    "Se hele specialistkataloget med 125 leverandører fordelt på legal, GRC, technical, SOC og audit.",
};

const TYPE_ORDER: VendorType[] = ["legal", "grc", "technical", "soc", "audit"];

export default function SpecialistsPage() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader current="specialists" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Specialist liste
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.25rem]">
              Alle 125 leverandører i kataloget
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-soft md:text-base">
              Listen er organiseret efter leverandørtype og viser de profiler der
              i modellen bruges til at matche governance, compliance, tekniske
              kontroller, SOC og assurance-behov.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-5">
              {TYPE_ORDER.map((type) => (
                <div key={type} className="border border-line bg-paper px-4 py-4">
                  <p className="text-sm font-semibold text-ink">
                    {VENDOR_TYPE_META[type].label}
                  </p>
                  <p className="mt-2 text-sm text-soft">
                    {
                      VENDOR_DIRECTORY.filter((vendor) => vendor.type === type)
                        .length
                    }{" "}
                    profiler
                  </p>
                </div>
              ))}
            </div>
          </section>

          {TYPE_ORDER.map((type) => {
            const vendors = VENDOR_DIRECTORY.filter((vendor) => vendor.type === type).sort(
              (left, right) => left.rankInType - right.rankInType,
            );

            return (
              <section
                key={type}
                className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10"
              >
                <div className="max-w-3xl">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
                    {VENDOR_TYPE_META[type].label}
                  </p>
                  <h2 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[2.8rem]">
                    {vendors.length} profiler i denne kategori
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-soft md:text-base">
                    {VENDOR_TYPE_META[type].summary}
                  </p>
                </div>

                <div className="mt-8 overflow-x-auto border border-line">
                  <table className="min-w-full border-collapse bg-white text-sm">
                    <thead className="bg-paper">
                      <tr>
                        <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">
                          #
                        </th>
                        <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">
                          Virksomhed
                        </th>
                        <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">
                          Market fit
                        </th>
                        <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">
                          Vurdering af kompetencer
                        </th>
                        <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">
                          Website
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((vendor) => (
                        <tr
                          key={`${type}-${vendor.name}`}
                          className="border-b border-line align-top last:border-b-0"
                        >
                          <td className="px-4 py-4 text-soft">
                            {vendor.rankInType}
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-ink">{vendor.name}</p>
                          </td>
                          <td className="px-4 py-4 text-soft">
                            {vendor.sizeFit.join(", ")}
                          </td>
                          <td className="px-4 py-4 text-soft">
                            {vendor.bestFor}
                          </td>
                          <td className="px-4 py-4">
                            <a
                              href={vendor.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex border border-line bg-paper px-3 py-2 font-semibold text-ink transition hover:bg-white"
                            >
                              Åbn website
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
