"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type SuperadminSidebarProps = {
  email: string;
  counts: {
    logCount: number;
    vendorCount: number;
    userCount: number;
    questionCount: number;
    adminCount: number;
  };
};

type CountKey = keyof SuperadminSidebarProps["counts"];

type NavItem = {
  href: string;
  label: string;
  countKey?: CountKey;
};

const NAV_ITEMS = [
  { href: "/superadmin", label: "Overblik", countKey: "logCount" },
  { href: "/superadmin/log", label: "Log", countKey: "logCount" },
  { href: "/superadmin/specialister", label: "Specialister", countKey: "vendorCount" },
  { href: "/superadmin/brugere", label: "Brugere", countKey: "userCount" },
  { href: "/superadmin/sporgsmal", label: "Spørgsmål", countKey: "questionCount" },
  { href: "/superadmin/scoring", label: "Scoring" },
  { href: "/superadmin/admin", label: "Admin", countKey: "adminCount" },
] satisfies NavItem[];

export default function SuperadminSidebar({
  email,
  counts,
}: SuperadminSidebarProps) {
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
            const countValue = item.countKey
              ? counts[item.countKey]
              : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  active
                    ? "flex items-center justify-between rounded-[1.6rem] bg-[#050a1f] px-6 py-5 text-lg font-semibold text-white"
                    : "flex items-center justify-between rounded-[1.6rem] px-6 py-5 text-lg font-semibold text-ink transition hover:bg-paper"
                }
              >
                <span>{item.label}</span>
                {countValue !== undefined ? (
                  <span
                    className={
                      active
                        ? "rounded-full bg-white/18 px-3 py-1 text-sm text-white"
                        : "rounded-full bg-paper px-3 py-1 text-sm text-soft"
                    }
                  >
                    {countValue}
                  </span>
                ) : null}
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
