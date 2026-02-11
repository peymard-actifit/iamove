import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { PublishedSiteRegister } from "@/components/published/site-register";

interface PageProps {
  params: Promise<{ slug: string; token: string }>;
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

export default async function PublishedSiteRegisterWithTokenPage({ params }: PageProps) {
  const { slug, token } = await params;

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

  // Vérifier le token d'inscription à usage unique
  const registrationToken = await prisma.registrationToken.findUnique({
    where: { token },
  });

  if (!registrationToken || registrationToken.siteId !== site.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Lien invalide
          </h1>
          <p className="text-gray-500">
            Ce lien d&apos;inscription n&apos;existe pas ou n&apos;est pas valide.
          </p>
        </div>
      </div>
    );
  }

  // Vérifier si le token a déjà été utilisé
  if (registrationToken.usedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Lien déjà utilisé
          </h1>
          <p className="text-gray-500">
            Ce lien d&apos;inscription a déjà été utilisé.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Contactez l&apos;administrateur pour obtenir un nouveau lien.
          </p>
        </div>
      </div>
    );
  }

  // Vérifier si le token a expiré
  if (registrationToken.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Lien expiré
          </h1>
          <p className="text-gray-500">
            Ce lien d&apos;inscription a expiré.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Contactez l&apos;administrateur pour obtenir un nouveau lien.
          </p>
        </div>
      </div>
    );
  }

  // Récupérer la liste des personnes existantes pour le choix du responsable
  const existingPersons = await prisma.person.findMany({
    where: { siteId: site.id },
    select: {
      id: true,
      name: true,
      jobTitle: true,
      department: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <PublishedSiteRegister 
      site={site} 
      existingPersons={existingPersons} 
      registrationToken={token}
    />
  );
}
