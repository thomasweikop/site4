import UsersManager from "@/components/superadmin/UsersManager";
import { listSubmittedUsers } from "@/lib/superadminStore";

export const dynamic = "force-dynamic";

export default async function SuperadminUsersPage() {
  const users = await listSubmittedUsers();

  return <UsersManager initialUsers={users} />;
}
