import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

// Vérifier que JWT_SECRET est défini en production
const jwtSecretValue = process.env.JWT_SECRET;
if (!jwtSecretValue && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET doit être défini en production");
}

const JWT_SECRET = new TextEncoder().encode(
  jwtSecretValue || "iamove-dev-secret-key-DO-NOT-USE-IN-PRODUCTION"
);

const COOKIE_NAME = "iamove-session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 jours en secondes

export interface SessionPayload {
  userId: string;
  userType: "STUDIO_USER" | "PERSON";
  email: string;
  name: string;
  role?: "STANDARD" | "ADMIN";
  siteId?: string;
  exp?: number;
}

// =============================================================================
// HASH & VERIFY PASSWORD
// =============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// =============================================================================
// JWT TOKEN MANAGEMENT
// =============================================================================

export async function createToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

export async function createSession(payload: Omit<SessionPayload, "exp">): Promise<void> {
  const token = await createToken(payload);
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// =============================================================================
// STUDIO USER AUTH
// =============================================================================

export async function loginStudioUser(email: string, password: string) {
  const user = await prisma.studioUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { error: "Email ou mot de passe incorrect" };
  }

  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: "Email ou mot de passe incorrect" };
  }

  // Mettre à jour la date de dernière connexion
  await prisma.studioUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    userId: user.id,
    userType: "STUDIO_USER",
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return { success: true, user };
}

export async function registerStudioUser(name: string, email: string, password: string) {
  const existing = await prisma.studioUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return { error: "Un compte existe déjà avec cet email" };
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.studioUser.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "STANDARD",
    },
  });

  await createSession({
    userId: user.id,
    userType: "STUDIO_USER",
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return { success: true, user };
}

// =============================================================================
// PERSON AUTH (SITE USERS)
// =============================================================================

export async function loginPerson(siteSlug: string, email: string, password: string) {
  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
  });

  if (!site) {
    return { error: "Site non trouvé" };
  }

  if (!site.isPublished) {
    return { error: "Ce site n'est pas encore publié" };
  }

  const person = await prisma.person.findUnique({
    where: {
      siteId_email: {
        siteId: site.id,
        email: email.toLowerCase(),
      },
    },
  });

  if (!person || !person.password) {
    return { error: "Email ou mot de passe incorrect" };
  }

  const isValid = await verifyPassword(password, person.password);
  if (!isValid) {
    return { error: "Email ou mot de passe incorrect" };
  }

  // Mettre à jour la connexion
  await prisma.person.update({
    where: { id: person.id },
    data: { 
      lastLoginAt: new Date(),
      isOnline: true,
      lastSeenAt: new Date(),
    },
  });

  await createSession({
    userId: person.id,
    userType: "PERSON",
    email: person.email,
    name: person.name,
    siteId: site.id,
  });

  return { success: true, person };
}

export async function initializePersonPassword(token: string, password: string) {
  const person = await prisma.person.findUnique({
    where: { inviteToken: token },
    include: { site: true },
  });

  if (!person) {
    return { error: "Lien d'invitation invalide" };
  }

  if (person.inviteExpiresAt && person.inviteExpiresAt < new Date()) {
    return { error: "Ce lien d'invitation a expiré" };
  }

  if (!person.site.isPublished) {
    return { error: "Ce site n'est pas encore publié" };
  }

  const hashedPassword = await hashPassword(password);

  await prisma.person.update({
    where: { id: person.id },
    data: {
      password: hashedPassword,
      inviteToken: null,
      inviteExpiresAt: null,
    },
  });

  return { success: true, siteSlug: person.site.slug };
}

// =============================================================================
// ADMIN CODE CHECK
// =============================================================================

// Code admin configurable via variable d'environnement
const ADMIN_CODE = process.env.ADMIN_CODE || "1241";

export async function upgradeToAdmin(userId: string, code: string) {
  if (code !== ADMIN_CODE) {
    return { error: "Code administrateur incorrect" };
  }

  await prisma.studioUser.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  });

  return { success: true };
}

export async function downgradeToStandard(userId: string) {
  await prisma.studioUser.update({
    where: { id: userId },
    data: { role: "STANDARD" },
  });

  return { success: true };
}
