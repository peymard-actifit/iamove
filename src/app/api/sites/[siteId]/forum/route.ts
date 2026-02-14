import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkAndAwardBadges } from "@/lib/badges";

/** GET : liste des posts du forum */
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

    const posts = await prisma.forumPost.findMany({
      where: {
        OR: [
          { siteId },
          { sharedWith: { some: { id: siteId } } },
        ],
      },
      include: {
        person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
        site: { select: { id: true, name: true } },
        replies: {
          include: {
            person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Forum GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** POST : créer un post sur le forum */
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

    const post = await prisma.forumPost.create({
      data: { title, content, category: category || null, personId, siteId },
      include: {
        person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
        replies: {
          include: {
            person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
          },
        },
      },
    });

    // PP : poster sur le forum = 20 PP
    await prisma.person.update({
      where: { id: personId },
      data: { participationPoints: { increment: 20 }, lastSeenAt: new Date() },
    });
    checkAndAwardBadges(personId, siteId).catch(() => {});

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Forum POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : modifier un post (owner only, si pas de réponses) */
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
    const { id, title, content, category } = body;

    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    let personId = session.userId;
    if (session.userType === "STUDIO_USER") {
      const person = await prisma.person.findFirst({ where: { siteId, email: session.email } });
      if (!person) return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
      personId = person.id;
    }

    const existing = await prisma.forumPost.findUnique({
      where: { id },
      include: { replies: { select: { id: true } } },
    });
    if (!existing) return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    if (existing.personId !== personId) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    if (existing.replies.length > 0) return NextResponse.json({ error: "Modification impossible : cette discussion a déjà des réponses" }, { status: 403 });

    const post = await prisma.forumPost.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category !== undefined && { category }),
      },
      include: {
        person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
        replies: {
          include: {
            person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("Forum PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** DELETE : supprimer un post (owner only) */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { siteId } = await params;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    // Vérifier que le post appartient à l'utilisateur
    let personId = session.userId;
    if (session.userType === "STUDIO_USER") {
      const person = await prisma.person.findFirst({ where: { siteId, email: session.email } });
      if (person) personId = person.id;
    }

    const post = await prisma.forumPost.findUnique({ where: { id }, select: { personId: true } });
    if (!post) return NextResponse.json({ error: "Post non trouvé" }, { status: 404 });
    if (post.personId !== personId) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });

    // Supprimer les réponses d'abord puis le post
    await prisma.forumReply.deleteMany({ where: { postId: id } });
    await prisma.forumPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forum DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
