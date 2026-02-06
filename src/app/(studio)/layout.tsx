import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudioHeader } from "@/components/studio/header";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.userType !== "STUDIO_USER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StudioHeader session={session} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
