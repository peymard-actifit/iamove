import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { language } = await request.json();

    if (!language || typeof language !== "string") {
      return NextResponse.json({ error: "Langue invalide" }, { status: 400 });
    }

    await prisma.studioUser.update({
      where: { id: session.userId },
      data: { language },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating language:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ language: "FR" });
    }

    const user = await prisma.studioUser.findUnique({
      where: { id: session.userId },
      select: { language: true },
    });

    return NextResponse.json({ language: user?.language || "FR" });
  } catch {
    return NextResponse.json({ language: "FR" });
  }
}
