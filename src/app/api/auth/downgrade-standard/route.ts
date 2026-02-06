import { NextResponse } from "next/server";
import { getSession, downgradeToStandard, createSession } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await downgradeToStandard(session.userId);

    // Mettre à jour la session avec le nouveau rôle
    await createSession({
      userId: session.userId,
      userType: "STUDIO_USER",
      email: session.email,
      name: session.name,
      role: "STANDARD",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Downgrade standard error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
