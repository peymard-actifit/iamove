import { NextResponse } from "next/server";
import { getSession, upgradeToAdmin, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    const result = await upgradeToAdmin(session.userId, code);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Mettre à jour la session avec le nouveau rôle
    await createSession({
      userId: session.userId,
      userType: "STUDIO_USER",
      email: session.email,
      name: session.name,
      role: "ADMIN",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upgrade admin error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
