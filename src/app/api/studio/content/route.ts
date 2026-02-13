import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** GET : liste de tous les contenus (use-cases, forum, tech-tips) de tous les sites */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "use-cases" | "forum" | "tech-tips"

    // Get all sites owned by the user (or all if admin)
    const siteFilter = session.role === "ADMIN" ? {} : { ownerId: session.userId };
    const sites = await prisma.site.findMany({
      where: siteFilter,
      select: { id: true, name: true, slug: true },
    });
    const siteIds = sites.map((s) => s.id);

    if (type === "use-cases") {
      const useCases = await prisma.useCase.findMany({
        where: { siteId: { in: siteIds } },
        include: {
          person: { select: { id: true, name: true, jobTitle: true } },
          site: { select: { id: true, name: true, slug: true } },
          likes: { select: { personId: true } },
          sharedWith: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ items: useCases, sites });
    }

    if (type === "forum") {
      const posts = await prisma.forumPost.findMany({
        where: { siteId: { in: siteIds } },
        include: {
          person: { select: { id: true, name: true, jobTitle: true } },
          site: { select: { id: true, name: true, slug: true } },
          replies: { select: { id: true } },
          sharedWith: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ items: posts, sites });
    }

    if (type === "tech-tips") {
      const tips = await prisma.techTip.findMany({
        where: { siteId: { in: siteIds } },
        include: {
          person: { select: { id: true, name: true, jobTitle: true } },
          site: { select: { id: true, name: true, slug: true } },
          likes: { select: { personId: true } },
          sharedWith: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ items: tips, sites });
    }

    return NextResponse.json({ error: "Type requis (use-cases, forum, tech-tips)" }, { status: 400 });
  } catch (error) {
    console.error("Studio content GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** PATCH : modifier un contenu ou partager/départager avec un site */
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, action } = body;

    if (!type || !id) {
      return NextResponse.json({ error: "Type et ID requis" }, { status: 400 });
    }

    // Share / Unshare
    if (action === "share" || action === "unshare") {
      const { targetSiteId } = body;
      if (!targetSiteId) return NextResponse.json({ error: "targetSiteId requis" }, { status: 400 });

      const connect = action === "share" ? { connect: { id: targetSiteId } } : { disconnect: { id: targetSiteId } };

      if (type === "use-cases") {
        await prisma.useCase.update({ where: { id }, data: { sharedWith: connect } });
      } else if (type === "forum") {
        await prisma.forumPost.update({ where: { id }, data: { sharedWith: connect } });
      } else if (type === "tech-tips") {
        await prisma.techTip.update({ where: { id }, data: { sharedWith: connect } });
      }
      return NextResponse.json({ success: true });
    }

    // Edit content
    if (type === "use-cases") {
      const uc = await prisma.useCase.update({
        where: { id },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description && { description: body.description }),
          ...(body.category !== undefined && { category: body.category }),
          ...(body.tools !== undefined && { tools: body.tools }),
          ...(body.impact !== undefined && { impact: body.impact }),
          ...(body.url !== undefined && { url: body.url }),
        },
      });
      return NextResponse.json(uc);
    }

    if (type === "forum") {
      const post = await prisma.forumPost.update({
        where: { id },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.content && { content: body.content }),
          ...(body.category !== undefined && { category: body.category }),
        },
      });
      return NextResponse.json(post);
    }

    if (type === "tech-tips") {
      const tip = await prisma.techTip.update({
        where: { id },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.content && { content: body.content }),
          ...(body.category !== undefined && { category: body.category }),
        },
      });
      return NextResponse.json(tip);
    }

    return NextResponse.json({ error: "Type non reconnu" }, { status: 400 });
  } catch (error) {
    console.error("Studio content PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/** DELETE : supprimer un contenu */
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "Type et ID requis" }, { status: 400 });
    }

    if (type === "use-cases") {
      await prisma.useCase.delete({ where: { id } });
    } else if (type === "forum") {
      await prisma.forumPost.delete({ where: { id } });
    } else if (type === "tech-tips") {
      await prisma.techTip.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Type non reconnu" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Studio content DELETE error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
