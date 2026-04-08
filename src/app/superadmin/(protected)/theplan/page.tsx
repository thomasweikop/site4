import TheplanManager from "@/components/superadmin/TheplanManager";
import { getTheplanDataset } from "@/lib/theplanStore";

export const dynamic = "force-dynamic";

export default async function SuperadminTheplanPage() {
  const dataset = await getTheplanDataset();

  return (
    <TheplanManager
      initialLeads={dataset.leads}
      initialContacts={dataset.contacts}
      initialWarmSignals={dataset.warmSignals}
      initialDrafts={dataset.drafts}
    />
  );
}
