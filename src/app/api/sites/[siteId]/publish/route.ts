import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const { publish } = body;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: {
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error("Error publishing site:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
