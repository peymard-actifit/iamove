import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Récupérer toutes les traductions pour une langue
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("lang") || "FR";
    const type = searchParams.get("type") || "GLOBAL";
    const siteId = searchParams.get("siteId");

    const translations = await prisma.translation.findMany({
      where: {
        language: language.toUpperCase(),
        type: type as "GLOBAL" | "LOCAL",
        ...(type === "LOCAL" ? { siteId } : { siteId: null }),
      },
      select: {
        key: true,
        value: true,
      },
    });

    // Convertir en objet plat { "nav.studio": "Studio", ... }
    const translationsMap: Record<string, string> = {};
    translations.forEach((t) => {
      translationsMap[t.key] = t.value;
    });

    return NextResponse.json(translationsMap);
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
