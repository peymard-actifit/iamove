import { NextResponse } from "next/server";
import { getSession, destroySession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    // Récupérer la session avant de la détruire pour mettre à jour isOnline
    const session = await getSession();
    
    if (session?.userType === "PERSON") {
      await prisma.person.update({
        where: { id: session.userId },
        data: { 
          isOnline: false,
          lastSeenAt: new Date(),
        },
      }).catch(() => {}); // Ignorer si la personne n'existe plus
    }

    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
