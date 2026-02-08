/**
 * Charge .env.local (ex. après vercel env pull) puis .env, et exécute prisma migrate dev.
 * Usage: node scripts/migrate-with-env.js [--name MigrationName]
 * Exemple: node scripts/migrate-with-env.js --name add_participation_points
 */

const path = require("path");
const { config } = require("dotenv");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");

// Charger .env.local en premier (Vercel / Neon), puis .env
config({ path: path.join(root, ".env.local") });
config({ path: path.join(root, ".env") });

const args = process.argv.slice(2);
const usePush = args.includes("--push");
const prismaArgs = usePush ? ["prisma", "db", "push"] : ["prisma", "migrate", "dev", "--name", (args[args.indexOf("--name") + 1] || "add_participation_points")];

console.log("DATABASE_URL défini:", process.env.DATABASE_URL ? "oui (" + process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@") + ")" : "non");
console.log(usePush ? "Appliquant le schéma (db push)..." : "Exécution des migrations...");
execSync(`npx ${prismaArgs.join(" ")}`, {
  cwd: root,
  stdio: "inherit",
});
