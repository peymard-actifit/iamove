import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId } = await params;

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        settings: true,
        persons: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && site.ownerId !== session.userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Générer un nouveau slug
    const newName = `${site.name} (copie)`;
    let baseSlug = slugify(newName);
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.site.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Créer la copie du site
    const newSite = await prisma.site.create({
      data: {
        name: newName,
        slug,
        description: site.description,
        logo: site.logo,
        primaryColor: site.primaryColor,
        secondaryColor: site.secondaryColor,
        isPublished: false,
        ownerId: session.userId,
        settings: site.settings ? {
          create: {
            tab1Title: site.settings.tab1Title,
            tab1Enabled: site.settings.tab1Enabled,
            tab1ColumnsVisible: site.settings.tab1ColumnsVisible,
            tab2Title: site.settings.tab2Title,
            tab2Enabled: site.settings.tab2Enabled,
            tab2Layout: site.settings.tab2Layout,
            tab3Title: site.settings.tab3Title,
            tab3Enabled: site.settings.tab3Enabled,
            tab4Title: site.settings.tab4Title,
            tab4Enabled: site.settings.tab4Enabled,
            tab4SystemPrompt: site.settings.tab4SystemPrompt,
            tab5Title: site.settings.tab5Title,
            tab5Enabled: site.settings.tab5Enabled,
            tab5QuestionsPerQuiz: site.settings.tab5QuestionsPerQuiz,
            tab5PassThreshold: site.settings.tab5PassThreshold,
          },
        } : { create: {} },
      },
    });

    // Dupliquer les personnes (sans les mots de passe)
    const personIdMap = new Map<string, string>();
    
    // Première passe : créer les personnes sans les liens hiérarchiques
    for (const person of site.persons) {
      const newPerson = await prisma.person.create({
        data: {
          email: person.email,
          name: person.name,
          firstName: person.firstName,
          lastName: person.lastName,
          jobTitle: person.jobTitle,
          department: person.department,
          phone: person.phone,
          avatar: person.avatar,
          currentLevel: person.currentLevel,
          canViewAll: person.canViewAll,
          siteId: newSite.id,
        },
      });
      personIdMap.set(person.id, newPerson.id);
    }

    // Deuxième passe : mettre à jour les liens hiérarchiques
    for (const person of site.persons) {
      if (person.managerId) {
        const newPersonId = personIdMap.get(person.id);
        const newManagerId = personIdMap.get(person.managerId);
        if (newPersonId && newManagerId) {
          await prisma.person.update({
            where: { id: newPersonId },
            data: { managerId: newManagerId },
          });
        }
      }
    }

    return NextResponse.json(newSite, { status: 201 });
  } catch (error) {
    console.error("Error duplicating site:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
