import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
      where: { siteId },
      include: {
        person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
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
      data: { title, content, category, personId, siteId },
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Forum POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** DELETE : supprimer un post */
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

    await prisma.forumPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forum DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
