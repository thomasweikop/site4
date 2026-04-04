import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { VENDOR_DIRECTORY } from "@/lib/nis2BuildPack";

const TOTAL_VENDOR_COUNT = VENDOR_DIRECTORY.length;

export const metadata: Metadata = {
  title: "Admin Vendors | ComplyCheck",
  description: `Internt katalog over de ${TOTAL_VENDOR_COUNT} leverandørprofiler i match-motoren.`,
};

export default function AdminVendorsPage() {
  return (
    <main className="bg-page text-ink">
      <SiteHeader />

      <section className="px-6 py-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="border border-line bg-white p-8 shadow-[var(--shadow)]">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#4c655d]">
              Admin / vendors
            </p>
            <h1 className="mt-4 font-display text-4xl leading-none text-ink">
              Vendor master
            </h1>
            <p className="mt-4 text-sm leading-6 text-soft">
              Oversigt over kataloget der driver match-motoren.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {VENDOR_DIRECTORY.map((vendor) => (
              <article
                key={`${vendor.type}-${vendor.rankInType}-${vendor.name}`}
                className="border border-line bg-white p-5 shadow-[var(--shadow)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#4c655d]">
                      {vendor.type}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-ink">
                      {vendor.name}
                    </h2>
                  </div>
                  <span className="border border-line bg-paper px-3 py-1 text-xs text-soft">
                    Score {vendor.score}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm leading-6 text-soft">
                  <p>{vendor.bestFor}</p>
                  <p>Size fit: {vendor.sizeFit.join(", ")}</p>
                  <p>Pris: {vendor.priceBand}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
