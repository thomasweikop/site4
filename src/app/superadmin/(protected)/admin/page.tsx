import AdminsManager from "@/components/superadmin/AdminsManager";
import { listSuperadminUsers } from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

export default async function SuperadminAdminPage() {
  const admins = await listSuperadminUsers();

  return <AdminsManager initialAdmins={admins} />;
}
