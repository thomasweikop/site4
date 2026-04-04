import BrandWordmark from "@/components/BrandWordmark";
import HeaderBackButton from "@/components/HeaderBackButton";
import HeaderMenu from "@/components/HeaderMenu";

type SiteHeaderProps = {
  current?: "home" | "scan" | "about" | "partners" | "privacy" | "specialists";
};

export default function SiteHeader({ current }: SiteHeaderProps) {
  const showBackBar = current && current !== "home";

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6 md:px-8 lg:px-10">
        <BrandWordmark />

        <HeaderMenu />
      </div>

      {showBackBar ? (
        <div className="bg-sage">
          <div className="mx-auto max-w-7xl px-6 py-3 md:px-8 lg:px-10">
            <HeaderBackButton />
          </div>
        </div>
      ) : null}
    </header>
  );
}
