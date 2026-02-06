import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { InviteSetPassword } from "@/components/published/invite-set-password";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;

  // Trouver la personne avec ce token d'invitation
  const person = await prisma.person.findFirst({
    where: { inviteToken: token },
    include: {
      site: {
        select: {
          id: true,
          name: true,
          slug: true,
          isPublished: true,
          primaryColor: true,
          secondaryColor: true,
        },
      },
    },
  });

  if (!person) {
    notFound();
  }

  // Vérifier si le mot de passe a déjà été défini
  if (person.password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Compte déjà activé
          </h1>
          <p className="text-gray-500 mb-6">
            Votre mot de passe a déjà été défini. Vous pouvez vous connecter avec vos identifiants.
          </p>
          <a
            href={`/s/${person.site.slug}`}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white"
            style={{ backgroundColor: person.site.primaryColor }}
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  // Vérifier si le site est publié
  if (!person.site.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Site non publié
          </h1>
          <p className="text-gray-500">
            Le site de l&apos;entreprise &quot;{person.site.name}&quot; n&apos;est pas encore accessible.
            Veuillez contacter votre administrateur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <InviteSetPassword
      token={token}
      person={{
        id: person.id,
        name: person.name,
        email: person.email,
      }}
      site={person.site}
    />
  );
}
