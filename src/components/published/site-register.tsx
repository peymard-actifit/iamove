"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui";
import { Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle2 } from "lucide-react";

interface Site {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string | null;
}

interface PublishedSiteRegisterProps {
  site: Site;
}

export function PublishedSiteRegister({ site }: PublishedSiteRegisterProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    jobTitle: "",
    department: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/sites/${site.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          jobTitle: formData.jobTitle || null,
          department: formData.department || null,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        // Redirection vers la page de connexion après 2 secondes
        setTimeout(() => {
          router.push(`/s/${site.slug}`);
        }, 2000);
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${site.primaryColor}20 0%, ${site.secondaryColor}20 100%)`,
        }}
      >
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Inscription réussie !
            </h2>
            <p className="text-gray-500">
              Votre compte a été créé. Vous allez être redirigé vers la page de connexion...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${site.primaryColor}20 0%, ${site.secondaryColor}20 100%)`,
      }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {site.logo ? (
            <img src={site.logo} alt={site.name} className="h-16 mx-auto mb-4" />
          ) : (
            <div 
              className="mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${site.primaryColor}, ${site.secondaryColor})` }}
            >
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          )}
          <CardTitle className="text-2xl">{site.name}</CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Créez votre compte
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="jobTitle" className="text-sm font-medium">
                  Fonction
                </label>
                <Input
                  id="jobTitle"
                  type="text"
                  placeholder="Développeur"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="department" className="text-sm font-medium">
                  Service
                </label>
                <Input
                  id="department"
                  type="text"
                  placeholder="IT"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
              style={{ backgroundColor: site.primaryColor }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Créer mon compte
            </Button>
            
            <a 
              href={`/s/${site.slug}`}
              className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Déjà inscrit ? Se connecter
            </a>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
