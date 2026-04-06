import LogoReviewManager from "@/components/superadmin/LogoReviewManager";
import {
  getLogoReviewPageData,
  type LogoReviewStatusFilter,
} from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

type SuperadminLogoReviewPageProps = {
  searchParams: Promise<{
    q?: string | string[] | undefined;
    status?: string | string[] | undefined;
    page?: string | string[] | undefined;
  }>;
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatusFilter(value: string | undefined): LogoReviewStatusFilter {
  if (value === "missing" || value === "candidate" || value === "approved" || value === "rejected") {
    return value;
  }

  return "all";
}

export default async function SuperadminLogoReviewPage({
  searchParams,
}: SuperadminLogoReviewPageProps) {
  const params = await searchParams;
  const query = getSingleParam(params.q) ?? "";
  const statusFilter = parseStatusFilter(getSingleParam(params.status));
  const pageParam = Number.parseInt(getSingleParam(params.page) ?? "1", 10);

  const pageData = await getLogoReviewPageData({
    query,
    statusFilter,
    page: Number.isFinite(pageParam) ? pageParam : 1,
  });

  return <LogoReviewManager {...pageData} />;
}
