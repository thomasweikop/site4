import ScoringManager from "@/components/superadmin/ScoringManager";
import { getEditableScoringConfig } from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

export default async function SuperadminScoringPage() {
  const config = await getEditableScoringConfig();

  return <ScoringManager initialConfig={config} />;
}
