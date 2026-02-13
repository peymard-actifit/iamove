import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** POST : ajouter une réponse à un post du forum */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string; postId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { siteId, postId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 });
    }

    let personId = session.userId;
    if (session.userType === "STUDIO_USER") {
      const person = await prisma.person.findFirst({ where: { siteId, email: session.email } });
      if (!person) return NextResponse.json({ error: "Personne non trouvée" }, { status: 404 });
      personId = person.id;
    }

    const reply = await prisma.forumReply.create({
      data: { content, personId, postId },
      include: {
        person: { select: { id: true, name: true, jobTitle: true, avatar: true } },
      },
    });

    // PP : répondre au forum = 10 PP
    await prisma.person.update({
      where: { id: personId },
      data: { participationPoints: { increment: 10 }, lastSeenAt: new Date() },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error("Forum reply POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
