import TheplanManager from "@/components/superadmin/TheplanManager";
import { getTheplanDataset } from "@/lib/theplanStore";
import { listSuperadminLogs } from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

export default async function SuperadminTheplanPage() {
  const [dataset, logs] = await Promise.all([
    getTheplanDataset(),
    listSuperadminLogs(100),
  ]);

  const importLogs = logs.filter((log) => log.action === "imported_theplan_excel");
  const rolledBackImportLogIds = new Set(
    logs
      .filter((log) => log.action === "rolled_back_theplan_import")
      .map((log) => Number(log.payload?.sourceLogId))
      .filter((value) => Number.isFinite(value)),
  );

  return (
    <TheplanManager
      initialLeads={dataset.leads}
      initialContacts={dataset.contacts}
      initialWarmSignals={dataset.warmSignals}
      initialDrafts={dataset.drafts}
      importLogs={importLogs}
      rolledBackImportLogIds={[...rolledBackImportLogIds]}
    />
  );
}
