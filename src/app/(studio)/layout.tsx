import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { StudioHeader } from "@/components/studio/header";
import { StudioProviders } from "@/components/studio/studio-providers";

export const metadata: Metadata = {
  title: "Studio IAMOVE",
  description: "Studio de création de sites d'accompagnement IA",
};

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
    <StudioProviders>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <StudioHeader session={session} />
        <main className="container mx-auto px-4 py-4">{children}</main>
      </div>
    </StudioProviders>
  );
}
