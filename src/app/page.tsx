import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ArrowRight, Sparkles, Users, BarChart3, GraduationCap } from "lucide-react";

export default async function Home() {
  const session = await getSession();

  // Si connecté, rediriger vers le dashboard
  if (session && session.userType === "STUDIO_USER") {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            Studio de création de sites IA
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              iamove
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Créez des sites d&apos;accompagnement pour aider vos équipes à monter en compétences 
            sur les technologies liées à l&apos;Intelligence Artificielle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Se connecter
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Gestion d&apos;équipe</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Créez des organigrammes et gérez les droits de chaque collaborateur
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 mb-4">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Formation IA</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Assistant IA intégré pour accompagner la progression de chacun
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 mb-4">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Évaluation</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Quizz personnalisés pour valider les compétences par niveau
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 iamove - Studio de création de sites d&apos;accompagnement IA</p>
        </div>
      </footer>
    </main>
  );
}
