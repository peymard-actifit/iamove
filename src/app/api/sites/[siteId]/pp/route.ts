import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getPPForAction, type PPAction } from "@/lib/pp-rules";

/** GET : récupérer les PP et le rang de la personne connectée (site publié, PERSON uniquement) */
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
    if (session.userType !== "PERSON") {
      return NextResponse.json({ pp: 0, rank: 0 });
    }

    const person = await prisma.person.findFirst({
      where: { id: session.userId, siteId },
      select: { participationPoints: true },
    });
    if (!person) {
      return NextResponse.json({ pp: 0, rank: 0 });
    }

    // Rang = nombre de personnes du même site avec strictement plus de PP + 1
    const rank = await prisma.person.count({
      where: {
        siteId,
        participationPoints: { gt: person.participationPoints },
      },
    });

    return NextResponse.json({
      pp: person.participationPoints,
      rank: rank + 1,
    });
  } catch (error) {
    console.error("PP GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST : ajouter des PP pour une action (PERSON uniquement, usage site publié) */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.userType !== "PERSON") {
      return NextResponse.json({ error: "Seul l'usage du site publié génère des PP" }, { status: 403 });
    }

    const { siteId } = await params;
    const body = await request.json();
    const { action } = body as { action: PPAction; metadata?: Record<string, unknown> };

    if (!action || typeof action !== "string") {
      return NextResponse.json({ error: "action requise" }, { status: 400 });
    }

    const points = getPPForAction(action as PPAction);
    if (points <= 0) {
      return NextResponse.json({ error: "Action inconnue ou sans gain" }, { status: 400 });
    }

    const person = await prisma.person.findFirst({
      where: { id: session.userId, siteId },
      select: { id: true, participationPoints: true },
    });
    if (!person) {
      return NextResponse.json({ error: "Personne non trouvée sur ce site" }, { status: 404 });
    }

    const newTotal = person.participationPoints + points;
    await prisma.person.update({
      where: { id: person.id },
      data: { participationPoints: newTotal },
    });

    const rank = await prisma.person.count({
      where: {
        siteId,
        participationPoints: { gt: newTotal },
      },
    });

    return NextResponse.json({
      newTotal,
      added: points,
      rank: rank + 1,
    });
  } catch (error) {
    console.error("PP POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
