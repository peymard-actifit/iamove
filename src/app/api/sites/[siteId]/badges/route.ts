import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** GET : liste des badges du site + badges globaux */
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

    const badges = await prisma.badge.findMany({
      where: { OR: [{ siteId }, { siteId: null }] },
      include: {
        earnedBy: {
          include: {
            person: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error("Badges GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST : créer un badge (studio uniquement) */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { siteId } = await params;
    const body = await request.json();
    const { name, description, icon, category, criteria, ppReward } = body;

    if (!name) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }

    const badge = await prisma.badge.create({
      data: {
        name,
        description,
        icon,
        category,
        criteria: criteria ? JSON.stringify(criteria) : null,
        ppReward: ppReward || 0,
        siteId,
      },
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error("Badge POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : mettre à jour un badge ou attribuer un badge à une personne */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    await params;
    const body = await request.json();

    // Attribuer un badge à une personne
    if (body.action === "award" && body.badgeId && body.personId) {
      const existing = await prisma.personBadge.findUnique({
        where: { personId_badgeId: { personId: body.personId, badgeId: body.badgeId } },
      });
      if (existing) {
        return NextResponse.json({ error: "Badge déjà attribué" }, { status: 409 });
      }

      const badge = await prisma.badge.findUnique({ where: { id: body.badgeId } });
      
      const personBadge = await prisma.personBadge.create({
        data: { personId: body.personId, badgeId: body.badgeId },
      });

      // PP : récompense du badge
      if (badge && badge.ppReward > 0) {
        await prisma.person.update({
          where: { id: body.personId },
          data: { participationPoints: { increment: badge.ppReward }, lastSeenAt: new Date() },
        });
      }

      return NextResponse.json(personBadge);
    }

    // Update badge
    if (body.id) {
      const badge = await prisma.badge.update({
        where: { id: body.id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.icon !== undefined && { icon: body.icon }),
          ...(body.category !== undefined && { category: body.category }),
          ...(body.criteria !== undefined && { criteria: JSON.stringify(body.criteria) }),
          ...(body.ppReward !== undefined && { ppReward: body.ppReward }),
        },
      });
      return NextResponse.json(badge);
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("Badge PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** DELETE : supprimer un badge */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    await prisma.badge.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Badge DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
