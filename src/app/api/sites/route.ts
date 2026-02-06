import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// GET - Liste des sites
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const sites = await prisma.site.findMany({
      where: session.role === "ADMIN" 
        ? {} 
        : { ownerId: session.userId },
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { persons: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(sites);
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un site
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Le nom du site est requis (min 2 caractères)" },
        { status: 400 }
      );
    }

    // Générer un slug unique
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.site.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const site = await prisma.site.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        ownerId: session.userId,
        settings: {
          create: {}, // Crée les paramètres par défaut
        },
      },
      include: {
        settings: true,
      },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
