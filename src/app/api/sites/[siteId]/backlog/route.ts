import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkAndAwardBadges } from "@/lib/badges";

/** GET : liste des items du backlog */
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

    const items = await prisma.backlogItem.findMany({
      where: { siteId },
      include: {
        creator: { select: { id: true, name: true, department: true } },
        owner: { select: { id: true, name: true, department: true } },
        sponsor: { select: { id: true, name: true, department: true } },
        promotedUseCase: { select: { id: true } },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Backlog GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST : créer un item backlog (toute personne) */
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

    // Trouver la personne
    let personId = session.userId;
    if (session.userType === "STUDIO_USER") {
      const person = await prisma.person.findFirst({
        where: { siteId, email: session.email },
        select: { id: true },
      });
      if (person) personId = person.id;
      else return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
    }

    const { title, description, service, category, tools, impact, url, ownerId, sponsorId, targetDate } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Titre et description requis" }, { status: 400 });
    }

    const item = await prisma.backlogItem.create({
      data: {
        title,
        description,
        service: service || null,
        category: category || null,
        tools: tools || null,
        impact: impact || null,
        url: url || null,
        ownerId: ownerId || null,
        sponsorId: sponsorId || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        creatorId: personId,
        siteId,
        status: "A_VALIDER",
      },
      include: {
        creator: { select: { id: true, name: true, department: true } },
        owner: { select: { id: true, name: true, department: true } },
        sponsor: { select: { id: true, name: true, department: true } },
      },
    });

    // PP : proposer un cas d'usage backlog = 30 PP
    await prisma.person.update({
      where: { id: personId },
      data: { participationPoints: { increment: 30 }, lastSeenAt: new Date() },
    });
    checkAndAwardBadges(personId, siteId).catch(() => {});

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Backlog POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : modifier un item backlog (admin only pour la plupart, créateur pour ses items) */
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
    const { id, action } = body;

    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    // Promotion MEP → UseCase
    if (action === "promote") {
      const item = await prisma.backlogItem.findUnique({
        where: { id },
        include: { promotedUseCase: true },
      });
      if (!item) return NextResponse.json({ error: "Item non trouvé" }, { status: 404 });
      if (item.status !== "MEP") return NextResponse.json({ error: "Seuls les items MEP peuvent être promus" }, { status: 400 });
      if (item.promotedUseCase) return NextResponse.json({ error: "Déjà promu en use case" }, { status: 409 });

      // Créer le use case pour l'owner (ou le creator si pas d'owner)
      const ucPersonId = item.ownerId || item.creatorId;
      const useCase = await prisma.useCase.create({
        data: {
          title: item.title,
          description: item.description,
          category: item.category,
          tools: item.tools,
          impact: item.impact,
          url: item.url,
          personId: ucPersonId,
          siteId: item.siteId,
          status: "PUBLISHED",
          backlogItemId: item.id,
        },
      });

      // Si le sponsor est différent de l'owner, créer aussi un use case pour le sponsor
      if (item.sponsorId && item.sponsorId !== ucPersonId) {
        await prisma.useCase.create({
          data: {
            title: item.title,
            description: item.description,
            category: item.category,
            tools: item.tools,
            impact: item.impact,
            url: item.url,
            personId: item.sponsorId,
            siteId: item.siteId,
            status: "PUBLISHED",
          },
        });
      }

      return NextResponse.json({ success: true, useCaseId: useCase.id });
    }

    // Mise à jour classique (admin ou créateur)
    const existing = await prisma.backlogItem.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Item non trouvé" }, { status: 404 });

    // Vérifier les droits : admin du site ou créateur
    let personId = session.userId;
    let isAdmin = false;
    if (session.userType === "STUDIO_USER") {
      isAdmin = true;
      const person = await prisma.person.findFirst({
        where: { siteId, email: session.email },
        select: { id: true, personRole: true },
      });
      if (person) {
        personId = person.id;
        isAdmin = person.personRole === "ADMIN" || true; // Studio user = admin
      }
    } else {
      const person = await prisma.person.findUnique({
        where: { id: personId },
        select: { personRole: true },
      });
      isAdmin = person?.personRole === "ADMIN";
    }

    const isCreator = existing.creatorId === personId;
    if (!isAdmin && !isCreator) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Construire les données à mettre à jour
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.service !== undefined) updateData.service = body.service;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tools !== undefined) updateData.tools = body.tools;
    if (body.impact !== undefined) updateData.impact = body.impact;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.estimatedEffort !== undefined) updateData.estimatedEffort = body.estimatedEffort;
    if (body.actualEffort !== undefined) updateData.actualEffort = body.actualEffort;
    if (body.targetDate !== undefined) updateData.targetDate = body.targetDate ? new Date(body.targetDate) : null;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.ownerId !== undefined) updateData.ownerId = body.ownerId || null;
    if (body.sponsorId !== undefined) updateData.sponsorId = body.sponsorId || null;

    const updated = await prisma.backlogItem.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { id: true, name: true, department: true } },
        owner: { select: { id: true, name: true, department: true } },
        sponsor: { select: { id: true, name: true, department: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Backlog PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** DELETE : supprimer un item backlog (admin only) */
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

    await prisma.backlogItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Backlog DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
