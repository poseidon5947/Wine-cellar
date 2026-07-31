import { PrismaClient } from "@prisma/client";

if (process.env.WINE_CELLAR_DESKTOP_RUNTIME !== "1") {
  const databaseUrl = firstPostgresUrl([
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL_UNPOOLED
  ]);
  if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  desktopDbReady?: Promise<void>;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

async function ensureDesktopDatabase() {
  if (process.env.WINE_CELLAR_DESKTOP_RUNTIME !== "1") return;

  globalForPrisma.desktopDbReady ??= (async () => {
    await basePrisma.$executeRawUnsafe("PRAGMA foreign_keys = ON");
    await basePrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Bottle" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "photoUrl" TEXT,
        "producer" TEXT NOT NULL,
        "wineName" TEXT NOT NULL,
        "vintage" TEXT,
        "type" TEXT NOT NULL DEFAULT 'Red',
        "grapes" TEXT,
        "region" TEXT,
        "country" TEXT,
        "alcoholPercent" REAL,
        "bottleSize" TEXT NOT NULL DEFAULT '750ml',
        "quantity" INTEGER NOT NULL DEFAULT 0,
        "storageLocation" TEXT,
        "purchaseDate" DATETIME,
        "purchasePrice" REAL,
        "drinkingWindowStart" INTEGER,
        "drinkingWindowEnd" INTEGER,
        "status" TEXT NOT NULL DEFAULT 'In Cellar',
        "personalRating" INTEGER,
        "notes" TEXT,
        "myNotes" TEXT,
        "hallidayScore" INTEGER,
        "hookScore" INTEGER,
        "rpScore" INTEGER,
        "larkinScore" INTEGER,
        "myScore" INTEGER,
        "others" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await basePrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ConsumptionLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bottleId" TEXT NOT NULL,
        "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "note" TEXT,
        CONSTRAINT "ConsumptionLog_bottleId_fkey"
          FOREIGN KEY ("bottleId") REFERENCES "Bottle" ("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await basePrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BottlePhoto" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bottleId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "position" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BottlePhoto_bottleId_fkey"
          FOREIGN KEY ("bottleId") REFERENCES "Bottle" ("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Bottle_producer_idx" ON "Bottle"("producer")`);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Bottle_wineName_idx" ON "Bottle"("wineName")`);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Bottle_vintage_idx" ON "Bottle"("vintage")`);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Bottle_type_idx" ON "Bottle"("type")`);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Bottle_quantity_idx" ON "Bottle"("quantity")`);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Bottle_drinkingWindowStart_drinkingWindowEnd_idx" ON "Bottle"("drinkingWindowStart", "drinkingWindowEnd")`);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConsumptionLog_bottleId_idx" ON "ConsumptionLog"("bottleId")`);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ConsumptionLog_date_idx" ON "ConsumptionLog"("date")`);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BottlePhoto_bottleId_idx" ON "BottlePhoto"("bottleId")`);
    await basePrisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BottlePhoto_position_idx" ON "BottlePhoto"("position")`);
  })();

  await globalForPrisma.desktopDbReady;
}

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        await ensureDesktopDatabase();
        return query(args);
      }
    }
  }
}) as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

function firstPostgresUrl(values: Array<string | undefined>) {
  return values.find((value) => typeof value === "string" && /^(postgresql|postgres):\/\//.test(value));
}
