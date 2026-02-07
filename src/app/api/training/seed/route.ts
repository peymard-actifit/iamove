import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Méthodes de formation initiales avec leurs traductions
const TRAINING_METHODS = [
  {
    name: "Serious Game",
    description: "Apprenez en jouant ! Des mini-jeux interactifs pour maîtriser les concepts de l'IA de manière ludique et engageante.",
    icon: "Gamepad2",
    type: "SERIOUS_GAME" as const,
    order: 1,
    translations: {
      EN: { name: "Serious Game", description: "Learn while playing! Interactive mini-games to master AI concepts in a fun and engaging way." },
      DE: { name: "Serious Game", description: "Lernen durch Spielen! Interaktive Mini-Spiele, um KI-Konzepte spielerisch zu meistern." },
      ES: { name: "Juego Serio", description: "¡Aprende jugando! Mini-juegos interactivos para dominar los conceptos de IA de forma lúdica." },
      IT: { name: "Serious Game", description: "Impara giocando! Mini-giochi interattivi per padroneggiare i concetti dell'IA in modo divertente." },
      FI: { name: "Oppimispeli", description: "Opi pelaamalla! Interaktiivisia minipelejä tekoälyn käsitteiden hallitsemiseksi hauskalla tavalla." },
    },
  },
  {
    name: "Tutoriels Guidés",
    description: "Des guides pas à pas pour découvrir et maîtriser chaque aspect de l'intelligence artificielle à votre rythme.",
    icon: "BookOpen",
    type: "TUTORIAL" as const,
    order: 2,
    translations: {
      EN: { name: "Guided Tutorials", description: "Step-by-step guides to discover and master every aspect of artificial intelligence at your own pace." },
      DE: { name: "Geführte Tutorials", description: "Schritt-für-Schritt-Anleitungen, um jeden Aspekt der künstlichen Intelligenz in Ihrem eigenen Tempo zu meistern." },
      ES: { name: "Tutoriales Guiados", description: "Guías paso a paso para descubrir y dominar cada aspecto de la inteligencia artificial a tu ritmo." },
      IT: { name: "Tutorial Guidati", description: "Guide passo-passo per scoprire e padroneggiare ogni aspetto dell'intelligenza artificiale al tuo ritmo." },
      FI: { name: "Ohjatut Tutoriaalit", description: "Askeleittain etenevät oppaat tekoälyn jokaisen näkökohdan hallitsemiseksi omaan tahtiin." },
    },
  },
  {
    name: "Exercices Pratiques",
    description: "Mettez en pratique vos connaissances avec des exercices concrets à réaliser dans votre environnement de travail.",
    icon: "Wrench",
    type: "EXERCISE" as const,
    order: 3,
    translations: {
      EN: { name: "Practical Exercises", description: "Put your knowledge into practice with concrete exercises to perform in your work environment." },
      DE: { name: "Praktische Übungen", description: "Setzen Sie Ihr Wissen mit konkreten Übungen in Ihrer Arbeitsumgebung in die Praxis um." },
      ES: { name: "Ejercicios Prácticos", description: "Pon en práctica tus conocimientos con ejercicios concretos para realizar en tu entorno de trabajo." },
      IT: { name: "Esercizi Pratici", description: "Metti in pratica le tue conoscenze con esercizi concreti da svolgere nel tuo ambiente di lavoro." },
      FI: { name: "Käytännön Harjoitukset", description: "Sovella tietojasi konkreettisilla harjoituksilla työympäristössäsi." },
    },
  },
  {
    name: "Vidéos de Formation",
    description: "Des vidéos explicatives et des démonstrations pour visualiser les concepts et techniques de l'IA.",
    icon: "Video",
    type: "VIDEO" as const,
    order: 4,
    translations: {
      EN: { name: "Training Videos", description: "Explanatory videos and demonstrations to visualize AI concepts and techniques." },
      DE: { name: "Schulungsvideos", description: "Erklärvideos und Demonstrationen zur Visualisierung von KI-Konzepten und -Techniken." },
      ES: { name: "Vídeos de Formación", description: "Vídeos explicativos y demostraciones para visualizar los conceptos y técnicas de la IA." },
      IT: { name: "Video Formativi", description: "Video esplicativi e dimostrazioni per visualizzare i concetti e le tecniche dell'IA." },
      FI: { name: "Koulutusvideot", description: "Selittäviä videoita ja demonstraatioita tekoälyn käsitteiden ja tekniikoiden havainnollistamiseksi." },
    },
  },
  {
    name: "Articles & Lectures",
    description: "Des articles approfondis et des ressources de lecture pour approfondir vos connaissances théoriques.",
    icon: "FileText",
    type: "ARTICLE" as const,
    order: 5,
    translations: {
      EN: { name: "Articles & Reading", description: "In-depth articles and reading resources to deepen your theoretical knowledge." },
      DE: { name: "Artikel & Lektüre", description: "Ausführliche Artikel und Lektüre-Ressourcen zur Vertiefung Ihres theoretischen Wissens." },
      ES: { name: "Artículos y Lecturas", description: "Artículos en profundidad y recursos de lectura para profundizar en sus conocimientos teóricos." },
      IT: { name: "Articoli e Letture", description: "Articoli approfonditi e risorse di lettura per approfondire le conoscenze teoriche." },
      FI: { name: "Artikkelit ja Lukemisto", description: "Syvällisiä artikkeleita ja lukemisresursseja teoreettisen tiedon syventämiseksi." },
    },
  },
  {
    name: "Modules Interactifs",
    description: "Des parcours interactifs avec quiz intégrés pour tester et valider vos compétences au fur et à mesure.",
    icon: "Layers",
    type: "INTERACTIVE" as const,
    order: 6,
    translations: {
      EN: { name: "Interactive Modules", description: "Interactive courses with integrated quizzes to test and validate your skills as you go." },
      DE: { name: "Interaktive Module", description: "Interaktive Kurse mit integrierten Quiz, um Ihre Fähigkeiten laufend zu testen und zu validieren." },
      ES: { name: "Módulos Interactivos", description: "Cursos interactivos con cuestionarios integrados para probar y validar sus habilidades progresivamente." },
      IT: { name: "Moduli Interattivi", description: "Percorsi interattivi con quiz integrati per testare e validare le tue competenze man mano." },
      FI: { name: "Interaktiiviset Moduulit", description: "Interaktiivisia kursseja integroiduilla tietokilpailuilla taitojesi testaamiseksi ja validoimiseksi." },
    },
  },
];

// POST - Initialiser les méthodes de formation
export async function POST() {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    let created = 0;
    let updated = 0;

    for (const method of TRAINING_METHODS) {
      // Vérifier si la méthode existe déjà
      const existing = await prisma.trainingMethod.findFirst({
        where: { name: method.name },
      });

      if (existing) {
        // Mettre à jour
        await prisma.trainingMethod.update({
          where: { id: existing.id },
          data: {
            description: method.description,
            icon: method.icon,
            type: method.type,
            order: method.order,
          },
        });
        updated++;
      } else {
        // Créer
        const newMethod = await prisma.trainingMethod.create({
          data: {
            name: method.name,
            description: method.description,
            icon: method.icon,
            type: method.type,
            order: method.order,
            isActive: true,
          },
        });

        // Créer la traduction FR
        await prisma.trainingMethodTranslation.create({
          data: {
            methodId: newMethod.id,
            language: "FR",
            name: method.name,
            description: method.description,
          },
        });

        // Créer les autres traductions
        for (const [lang, trans] of Object.entries(method.translations)) {
          await prisma.trainingMethodTranslation.create({
            data: {
              methodId: newMethod.id,
              language: lang,
              name: trans.name,
              description: trans.description,
            },
          });
        }

        created++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      total: TRAINING_METHODS.length,
    });
  } catch (error) {
    console.error("[training/seed] Erreur:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// GET - Obtenir les méthodes de formation
export async function GET() {
  try {
    const methods = await prisma.trainingMethod.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        translations: true,
        _count: {
          select: { modules: true },
        },
      },
    });

    return NextResponse.json({ methods });
  } catch (error) {
    console.error("[training/seed] Erreur GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
