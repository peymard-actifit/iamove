import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

/** GET : liste de tous les utilisateurs Studio (admin only) */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const users = await prisma.studioUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        language: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { sites: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Studio users GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST : créer un utilisateur Studio (admin only) */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nom, email et mot de passe requis" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères" }, { status: 400 });
    }

    // Vérifier que l'email n'existe pas déjà
    const existing = await prisma.studioUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.studioUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "ADMIN" ? "ADMIN" : "STANDARD",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        language: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { sites: true } },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Studio users POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : modifier un utilisateur Studio (admin only) */
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    // Ne pas permettre de modifier son propre compte via cette route
    if (id === session.userId) {
      return NextResponse.json({ error: "Utilisez les paramètres du compte pour modifier votre propre profil" }, { status: 400 });
    }

    // Réinitialisation du mot de passe
    if (action === "reset-password") {
      const { newPassword } = body;
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: "Nouveau mot de passe requis (8 caractères min.)" }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.studioUser.update({
        where: { id },
        data: { password: hashedPassword },
      });
      return NextResponse.json({ success: true });
    }

    // Changement de rôle
    if (action === "toggle-role") {
      const user = await prisma.studioUser.findUnique({ where: { id }, select: { role: true } });
      if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
      const newRole = user.role === "ADMIN" ? "STANDARD" : "ADMIN";
      await prisma.studioUser.update({ where: { id }, data: { role: newRole } });
      return NextResponse.json({ success: true, newRole });
    }

    // Modification générale (nom, email)
    const data: Record<string, string> = {};
    if (body.name) data.name = body.name;
    if (body.email) {
      // Vérifier unicité de l'email
      const existing = await prisma.studioUser.findFirst({ where: { email: body.email, NOT: { id } } });
      if (existing) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
      data.email = body.email;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
    }

    const user = await prisma.studioUser.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Studio users PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** DELETE : supprimer un utilisateur Studio (admin only) */
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    // Ne pas permettre de se supprimer soi-même
    if (id === session.userId) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
    }

    await prisma.studioUser.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Studio users DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
