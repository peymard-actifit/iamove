"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui";
import { Eye, EyeOff, LogIn } from "lucide-react";

interface Site {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string | null;
}

interface PublishedSiteLoginProps {
  site: Site;
}

export function PublishedSiteLogin({ site }: PublishedSiteLoginProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteSlug: site.slug,
          ...formData,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        router.push(`/s/${site.slug}/app`);
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

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
              <LogIn className="h-8 w-8 text-white" />
            </div>
          )}
          <CardTitle className="text-2xl">{site.name}</CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Connectez-vous à votre espace
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
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

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
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
          </CardContent>

          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              isLoading={isLoading}
              style={{ backgroundColor: site.primaryColor }}
            >
              Se connecter
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
