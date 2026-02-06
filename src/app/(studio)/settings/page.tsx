import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { AccountSettings } from "@/components/studio/account-settings";

export default async function SettingsPage() {
  const session = await getSession();
  
  if (!session || session.userType !== "STUDIO_USER") {
    redirect("/login");
  }

  const user = await prisma.studioUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres du compte</h1>
        <p className="text-gray-500 mt-1">
          Gérez vos informations personnelles et votre sécurité
        </p>
      </div>

      <AccountSettings user={user} />
    </div>
  );
}
