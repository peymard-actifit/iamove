import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkAndAwardBadges } from "@/lib/badges";

/** GET : liste des use cases du site */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { siteId } = await params;

    const useCases = await prisma.useCase.findMany({
      where: {
        OR: [
          { siteId, status: "PUBLISHED" },
          { sharedWith: { some: { id: siteId } }, status: "PUBLISHED" },
        ],
      },
      include: {
        person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
        site: { select: { id: true, name: true } },
        likes: { select: { personId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(useCases);
  } catch (error) {
    console.error("UseCase GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST : créer un use case */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { siteId } = await params;
    const body = await request.json();
    const { title, description, category, tools, impact, url } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description requis" }, { status: 400 });
    }

    // Trouver la personne
    let personId = session.userId;
    if (session.userType === "STUDIO_USER") {
      const person = await prisma.person.findFirst({ where: { siteId, email: session.email } });
      if (!person) return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
      personId = person.id;
    }

    const useCase = await prisma.useCase.create({
      data: { title, description, category, tools, impact, url, personId, siteId },
      include: {
        person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
        likes: { select: { personId: true } },
      },
    });

    // PP : créer un use case = 50 PP
    await prisma.person.update({
      where: { id: personId },
      data: { participationPoints: { increment: 50 }, lastSeenAt: new Date() },
    });
    checkAndAwardBadges(personId, siteId).catch(() => {});

    return NextResponse.json(useCase, { status: 201 });
  } catch (error) {
    console.error("UseCase POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : mettre à jour / liker un use case */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { siteId } = await params;
    const body = await request.json();

    // Like/unlike
    if (body.action === "like" && body.useCaseId) {
      let personId = session.userId;
      if (session.userType === "STUDIO_USER") {
        const person = await prisma.person.findFirst({ where: { siteId, email: session.email } });
        if (!person) return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
        personId = person.id;
      }

      const existing = await prisma.useCaseLike.findUnique({
        where: { useCaseId_personId: { useCaseId: body.useCaseId, personId } },
      });

      if (existing) {
        await prisma.useCaseLike.delete({ where: { id: existing.id } });
        return NextResponse.json({ liked: false });
      } else {
        await prisma.useCaseLike.create({
          data: { useCaseId: body.useCaseId, personId },
        });
        // PP : liker = 5 PP
        await prisma.person.update({
          where: { id: personId },
          data: { participationPoints: { increment: 5 }, lastSeenAt: new Date() },
        });
        return NextResponse.json({ liked: true });
      }
    }

    // Update use case (owner only, if no likes)
    if (body.id && body.action !== "like") {
      let personId = session.userId;
      if (session.userType === "STUDIO_USER") {
        const person = await prisma.person.findFirst({ where: { siteId, email: session.email } });
        if (!person) return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
        personId = person.id;
      }

      const existing = await prisma.useCase.findUnique({
        where: { id: body.id },
        include: { likes: { select: { id: true } } },
      });
      if (!existing) return NextResponse.json({ error: "Use case non trouvé" }, { status: 404 });
      if (existing.personId !== personId) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      if (existing.likes.length > 0) return NextResponse.json({ error: "Modification impossible : ce use case a déjà reçu des avis" }, { status: 403 });

      const useCase = await prisma.useCase.update({
        where: { id: body.id },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description && { description: body.description }),
          ...(body.category !== undefined && { category: body.category }),
          ...(body.tools !== undefined && { tools: body.tools }),
          ...(body.impact !== undefined && { impact: body.impact }),
          ...(body.url !== undefined && { url: body.url }),
        },
        include: {
          person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
          likes: { select: { personId: true } },
        },
      });
      return NextResponse.json(useCase);
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("UseCase PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** DELETE : supprimer un use case */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    await prisma.useCase.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UseCase DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
