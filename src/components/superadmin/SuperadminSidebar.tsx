"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type SuperadminSidebarProps = {
  email: string;
};

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS = [
  { href: "/superadmin", label: "Overblik" },
  { href: "/superadmin/log", label: "Log" },
  { href: "/superadmin/specialister", label: "Specialister" },
  { href: "/superadmin/logoer", label: "Logoer" },
  { href: "/superadmin/brugere", label: "Brugere" },
  { href: "/superadmin/sporgsmal", label: "Spørgsmål" },
  { href: "/superadmin/scoring", label: "Scoring" },
  { href: "/superadmin/admin", label: "Admin" },
] satisfies NavItem[];

export default function SuperadminSidebar({ email }: SuperadminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingLogout, setPendingLogout] = useState(false);

  async function logout() {
    setPendingLogout(true);

    try {
      await fetch("/api/superadmin/logout", { method: "POST" });
      router.push("/superadmin/login");
      router.refresh();
    } finally {
      setPendingLogout(false);
    }
  }

  return (
    <aside className="w-full border-b border-line bg-white lg:w-[300px] lg:border-b-0 lg:border-r">
      <div className="border-b border-line px-8 py-8">
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.24em] text-[#697b9e]">
          ComplyCheck Superadmin
        </p>
        <p className="mt-4 text-sm leading-6 text-soft">{email}</p>
      </div>

      <nav className="px-6 py-8">
        <div className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/superadmin"
                ? pathname === "/superadmin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center rounded-[1.6rem] bg-[#050a1f] px-6 py-5 text-lg font-semibold !text-white"
                    : "flex items-center rounded-[1.6rem] px-6 py-5 text-lg font-semibold text-ink transition hover:bg-paper"
                }
              >
                <span className={active ? "!text-white" : undefined}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <button
            type="button"
            onClick={logout}
            disabled={pendingLogout}
            className="inline-flex border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-50"
          >
            {pendingLogout ? "Logger ud..." : "Log ud"}
          </button>
        </div>
      </nav>
    </aside>
  );
}
