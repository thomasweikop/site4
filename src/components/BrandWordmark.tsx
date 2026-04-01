import Link from "next/link";

type BrandWordmarkProps = {
  href?: string;
  inverse?: boolean;
};

export default function BrandWordmark({
  href = "/",
  inverse = false,
}: BrandWordmarkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center text-[1.9rem] font-extrabold tracking-[-0.06em] ${
        inverse ? "text-white" : "text-ink"
      }`}
      aria-label="ComplyCheck"
    >
      <span>Comply</span>
      <span className={inverse ? "text-white/78" : "text-[#3d4c67]"}>Check</span>
    </Link>
  );
}
