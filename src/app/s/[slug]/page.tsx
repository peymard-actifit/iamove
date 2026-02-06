import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PublishedSiteLogin } from "@/components/published/site-login";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublishedSitePage({ params }: PageProps) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      isPublished: true,
      primaryColor: true,
      secondaryColor: true,
      logo: true,
    },
  });

  if (!site) {
    notFound();
  }

  if (!site.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Site non publié
          </h1>
          <p className="text-gray-500">
            Ce site n&apos;est pas encore accessible au public.
          </p>
        </div>
      </div>
    );
  }

  return <PublishedSiteLogin site={site} />;
}
