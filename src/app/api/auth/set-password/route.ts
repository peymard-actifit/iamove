import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token et mot de passe requis" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères" },
        { status: 400 }
      );
    }

    // Trouver la personne avec ce token
    const person = await prisma.person.findFirst({
      where: { inviteToken: token },
    });

    if (!person) {
      return NextResponse.json(
        { error: "Lien d'invitation invalide ou expiré" },
        { status: 404 }
      );
    }

    // Vérifier si le mot de passe est déjà défini
    if (person.password) {
      return NextResponse.json(
        { error: "Le mot de passe a déjà été défini" },
        { status: 400 }
      );
    }

    // Hasher et sauvegarder le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.person.update({
      where: { id: person.id },
      data: {
        password: hashedPassword,
        inviteToken: null, // Invalider le token après utilisation
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
