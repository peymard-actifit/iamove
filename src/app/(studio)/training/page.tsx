import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { TrainingPageContent } from "@/components/studio/training-page-content";

// Vercel Pro : max 60s pour les fonctions serveur
export const maxDuration = 60;

/**
 * Page Training — version allégée.
 * L'authentification est vérifiée côté serveur, mais les données
 * (méthodes, modules, parcours) sont chargées côté client pour
 * éviter les problèmes de streaming RSC avec de gros payloads.
 */
export default async function TrainingPage() {
  const session = await getSession();
  
  if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Plus de chargement de données ici — tout se fait côté client
  return <TrainingPageContent />;
}
