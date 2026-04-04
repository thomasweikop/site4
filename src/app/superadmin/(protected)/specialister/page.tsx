import SpecialistsManager from "@/components/superadmin/SpecialistsManager";
import { listEditableVendors } from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

export default async function SuperadminSpecialistsPage() {
  const vendors = await listEditableVendors();

  return <SpecialistsManager initialVendors={vendors} />;
}
