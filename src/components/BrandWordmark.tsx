import Link from "next/link";
import RegulationBadge from "@/components/RegulationBadge";

type BrandWordmarkProps = {
  href?: string;
  inverse?: boolean;
  siteLabel?: string;
};

export default function BrandWordmark({
  href = "/",
  inverse = false,
  siteLabel = "NIS2",
}: BrandWordmarkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3"
      aria-label={`ComplyCheck ${siteLabel}`}
    >
      <RegulationBadge label={siteLabel} className="h-12 w-12 shrink-0" />
      <span
        className={`text-[1.68rem] font-bold tracking-[-0.05em] ${
          inverse ? "text-white" : "text-ink"
        }`}
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        ComplyCheck
      </span>
    </Link>
  );
}
