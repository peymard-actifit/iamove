import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** GET : liste des tech tips du site */
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

    const tips = await prisma.techTip.findMany({
      where: {
        OR: [
          { siteId },
          { sharedWith: { some: { id: siteId } } },
        ],
      },
      include: {
        person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
        site: { select: { id: true, name: true } },
        likes: { select: { personId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tips);
  } catch (error) {
    console.error("TechTip GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST : créer un tech tip */
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
    const { title, content, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
    }

    let personId = session.userId;
    if (session.userType === "STUDIO_USER") {
      const person = await prisma.person.findFirst({ where: { siteId, email: session.email } });
      if (!person) return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
      personId = person.id;
    }

    const tip = await prisma.techTip.create({
      data: { title, content, category, personId, siteId },
      include: {
        person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
        likes: { select: { personId: true } },
      },
    });

    // PP : créer un tech tip = 30 PP
    await prisma.person.update({
      where: { id: personId },
      data: { participationPoints: { increment: 30 }, lastSeenAt: new Date() },
    });

    return NextResponse.json(tip, { status: 201 });
  } catch (error) {
    console.error("TechTip POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : liker/unliker ou modifier un tech tip */
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
    if (body.action === "like" && body.techTipId) {
      let personId = session.userId;
      if (session.userType === "STUDIO_USER") {
        const person = await prisma.person.findFirst({ where: { siteId, email: session.email } });
        if (!person) return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
        personId = person.id;
      }

      const existing = await prisma.techTipLike.findUnique({
        where: { techTipId_personId: { techTipId: body.techTipId, personId } },
      });

      if (existing) {
        await prisma.techTipLike.delete({ where: { id: existing.id } });
        return NextResponse.json({ liked: false });
      } else {
        await prisma.techTipLike.create({
          data: { techTipId: body.techTipId, personId },
        });
        await prisma.person.update({
          where: { id: personId },
          data: { participationPoints: { increment: 5 }, lastSeenAt: new Date() },
        });
        return NextResponse.json({ liked: true });
      }
    }

    // Update tech tip (owner only, if no likes)
    if (body.id) {
      let personId = session.userId;
      if (session.userType === "STUDIO_USER") {
        const person = await prisma.person.findFirst({ where: { siteId, email: session.email } });
        if (!person) return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
        personId = person.id;
      }

      const existing = await prisma.techTip.findUnique({
        where: { id: body.id },
        include: { likes: { select: { id: true } } },
      });
      if (!existing) return NextResponse.json({ error: "Tech tip non trouvé" }, { status: 404 });
      if (existing.personId !== personId) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
      if (existing.likes.length > 0) return NextResponse.json({ error: "Modification impossible : ce tip a déjà reçu des avis" }, { status: 403 });

      const tip = await prisma.techTip.update({
        where: { id: body.id },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.content && { content: body.content }),
          ...(body.category !== undefined && { category: body.category }),
        },
        include: {
          person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
          likes: { select: { personId: true } },
        },
      });
      return NextResponse.json(tip);
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
  } catch (error) {
    console.error("TechTip PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** DELETE : supprimer un tech tip */
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

    await prisma.techTip.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("TechTip DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
