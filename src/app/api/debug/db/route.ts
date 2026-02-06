import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 30) + "...",
      NODE_ENV: process.env.NODE_ENV,
    },
    database: {
      connected: false,
      error: null,
      tables: [],
    },
  };

  try {
    // Test de connexion
    await prisma.$connect();
    diagnostics.database = {
      ...diagnostics.database as object,
      connected: true,
    };

    // Vérifier les tables existantes
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    diagnostics.database = {
      ...diagnostics.database as object,
      tables: tables.map((t) => t.tablename),
    };

    // Compter les utilisateurs
    try {
      const userCount = await prisma.studioUser.count();
      (diagnostics.database as Record<string, unknown>).studioUserCount = userCount;
    } catch (e) {
      (diagnostics.database as Record<string, unknown>).studioUserError = String(e);
    }

  } catch (error) {
    diagnostics.database = {
      ...diagnostics.database as object,
      connected: false,
      error: String(error),
    };
  } finally {
    await prisma.$disconnect();
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
