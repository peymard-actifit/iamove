import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { PublishedSiteRegister } from "@/components/published/site-register";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await prisma.site.findUnique({
    where: { slug },
    select: { name: true },
  });

  return {
    title: site ? `Inscription - ${site.name}` : "Inscription",
  };
}

export default async function PublishedSiteRegisterPage({ params }: PageProps) {
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
      settings: {
        select: {
          allowPublicRegistration: true,
        },
      },
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

  // Vérifier si l'inscription publique est activée
  if (!site.settings?.allowPublicRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Inscription désactivée
          </h1>
          <p className="text-gray-500">
            L&apos;inscription publique n&apos;est pas activée pour ce site.
          </p>
          <a 
            href={`/s/${slug}`}
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return <PublishedSiteRegister site={site} />;
}
