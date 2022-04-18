import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import * as crypto from "crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed_clears(p: string, n: string): Promise<void> {
  console.log(`🌱 seeding challenge ${n} clears...`);

  const f_stream = fs.createReadStream(p, `utf-8`);
  const rl = readline.createInterface({ input: f_stream, crlfDelay: Infinity });

  for await (const l of rl) {
    await prisma.passwordClear.create({
      data: {
        challenge: {
          connect: {
            name: n
          }
        },
        password: crypto.createHash(`sha256`).update(l).digest(`hex`)
      }
    });
  }
}

async function main() {

  // challenge names
  console.log(`🌱 seeding challenge names...`);
  await prisma.passwordChallenge.createMany({
    data: [
      { name: `jwt` },
      { name: `nist` },
      { name: `http` }
    ]
  });

  console.log(`🌱 seeding challenge clears...`);
  await seed_clears(path.resolve(__dirname, `../assets/passwords/nist-clears.txt`), `nist`);
  await seed_clears(path.resolve(__dirname, `../assets/passwords/http-clears.txt`), `http`);
  await seed_clears(path.resolve(__dirname, `../assets/passwords/jwt-clears.txt`), `jwt`);
}

main()
  .catch((e) => {
    console.log(`failed to seed db. it's probably already seeded? err: ${e}`);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect);
