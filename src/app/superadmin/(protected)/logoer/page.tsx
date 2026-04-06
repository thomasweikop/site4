import LogoReviewManager from "@/components/superadmin/LogoReviewManager";
import { listEditableVendors } from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

export default async function SuperadminLogoReviewPage() {
  const vendors = await listEditableVendors();

  return <LogoReviewManager initialVendors={vendors} />;
}
