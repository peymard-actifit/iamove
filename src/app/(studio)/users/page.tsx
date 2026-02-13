import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudioUsersManager } from "@/components/studio/studio-users-manager";

export default async function UsersPage() {
  const session = await getSession();

  if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <StudioUsersManager currentUserId={session.userId} />;
}
