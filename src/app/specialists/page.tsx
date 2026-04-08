import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import TrackedWebsiteLink from "@/components/TrackedWebsiteLink";
import {
  VENDOR_DIRECTORY,
  VENDOR_TYPE_META,
  type VendorType,
} from "@/lib/nis2BuildPack";

export const metadata: Metadata = {
  title: "Specialist Liste | ComplyCheck",
  description:
    "Se specialistkataloget fordelt på legal, GRC, technical, SOC og audit.",
};

const TYPE_ORDER: VendorType[] = ["legal", "grc", "technical", "soc", "audit"];

export default function SpecialistsPage() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader current="specialists" />

      <section className="px-6 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="border border-line bg-white p-8 shadow-[var(--shadow)] md:p-10">
            <h1 className="mt-4 text-balance font-display text-4xl leading-none text-ink md:text-[3.25rem]">
              Specialistkatalog
            </h1>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-soft md:text-base">
              Listen er organiseret efter leverandørtype og viser de profiler der
              i modellen bruges til at matche governance, compliance, tekniske
              kontroller, SOC og assurance-behov.
            </p>
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
                  <h2 className="text-balance text-[0.88rem] font-semibold uppercase tracking-[0.32em] text-[#4c655d] md:text-[1rem]">
                    {VENDOR_TYPE_META[type].label.toUpperCase()}
                  </h2>
                </div>

                <div className="mt-8 overflow-x-auto border border-line">
                  <table className="min-w-full border-collapse bg-white text-sm">
                    <thead className="bg-paper">
                      <tr>
                        <th className="border-b border-line px-4 py-3 text-left font-semibold text-ink">
                          Virksomhed
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
                          <td className="px-4 py-4">
                            <p className="font-semibold text-ink">{vendor.name}</p>
                          </td>
                          <td className="px-4 py-4">
                            <TrackedWebsiteLink
                              href={vendor.website}
                              vendorName={vendor.name}
                              source="specialists_page"
                              className="inline-flex border border-line bg-paper px-3 py-2 font-semibold text-ink transition hover:bg-white"
                            >
                              Website
                            </TrackedWebsiteLink>
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
