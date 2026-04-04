import type { ReactNode } from "react";
import SuperadminSidebar from "@/components/superadmin/SuperadminSidebar";
import { requireSuperadmin } from "@/lib/superadminAuth";
import { getSuperadminOverview } from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

export default async function SuperadminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireSuperadmin();
  const counts = await getSuperadminOverview();

  return (
    <main className="min-h-screen bg-page text-ink">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <SuperadminSidebar email={user.email} counts={counts} />
        <div className="flex-1 px-6 py-8 md:px-8 lg:px-10">{children}</div>
      </div>
    </main>
  );
}
