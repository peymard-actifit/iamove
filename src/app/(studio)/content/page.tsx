import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ContentManager } from "@/components/studio/content-manager";

interface ContentPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const session = await getSession();

  if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const defaultTab = params.tab || "use-cases";

  return <ContentManager defaultTab={defaultTab} />;
}
