import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding levels...");

  const levels = [
    { number: 1, name: "Niveau 1 - Découverte", description: "Introduction aux concepts de base de l'IA" },
    { number: 2, name: "Niveau 2 - Fondamentaux", description: "Maîtrise des outils IA du quotidien" },
    { number: 3, name: "Niveau 3 - Intermédiaire", description: "Utilisation avancée des assistants IA" },
    { number: 4, name: "Niveau 4 - Avancé", description: "Prompt engineering et optimisation" },
    { number: 5, name: "Niveau 5 - Expert", description: "Intégration et automatisation IA" },
    { number: 6, name: "Niveau 6 - Architecte", description: "Conception de solutions IA complexes" },
    { number: 7, name: "Niveau 7 - Maître", description: "Leadership et stratégie IA" },
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { number: level.number },
      update: level,
      create: level,
    });
    console.log(`  ✓ ${level.name}`);
  }

  console.log("\nSeeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
