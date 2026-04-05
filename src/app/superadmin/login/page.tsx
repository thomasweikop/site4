import type { Metadata } from "next";
import SuperadminLoginForm from "@/components/superadmin/SuperadminLoginForm";

export const metadata: Metadata = {
  title: "Superadmin Login | ComplyCheck",
  description: "Login til ComplyCheck superadmin.",
};

type SuperadminLoginPageProps = {
  searchParams: Promise<{
    error?: string | string[] | undefined;
  }>;
};

function resolveErrorMessage(value?: string | string[]) {
  const error = Array.isArray(value) ? value[0] : value;

  if (!error) {
    return undefined;
  }

  return decodeURIComponent(error);
}

export default async function SuperadminLoginPage({
  searchParams,
}: SuperadminLoginPageProps) {
  const params = await searchParams;
  const error = resolveErrorMessage(params.error);

  return (
    <main className="min-h-screen bg-page px-6 py-10 text-ink md:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <SuperadminLoginForm error={error} />
      </div>
    </main>
  );
}
