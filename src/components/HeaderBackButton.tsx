"use client";

import { useRouter } from "next/navigation";

type HeaderBackButtonProps = {
  fallbackHref?: string;
};

export default function HeaderBackButton({
  fallbackHref = "/",
}: HeaderBackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
    >
      <span aria-hidden="true">&lt;</span>
      <span>Forrige</span>
    </button>
  );
}
