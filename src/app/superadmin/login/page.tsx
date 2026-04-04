import type { Metadata } from "next";
import SuperadminLoginForm from "@/components/superadmin/SuperadminLoginForm";

export const metadata: Metadata = {
  title: "Superadmin Login | ComplyCheck",
  description: "Login til ComplyCheck superadmin.",
};

export default function SuperadminLoginPage() {
  return (
    <main className="min-h-screen bg-page px-6 py-10 text-ink md:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <SuperadminLoginForm />
      </div>
    </main>
  );
}
