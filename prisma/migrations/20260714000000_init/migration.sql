-- Initial production schema for Wine Cellar.
-- Generated for PostgreSQL so Vercel can run `prisma migrate deploy`.

CREATE TABLE "Bottle" (
    "id" TEXT NOT NULL,
    "photoUrl" TEXT,
    "producer" TEXT NOT NULL,
    "wineName" TEXT NOT NULL,
    "vintage" TEXT,
    "type" TEXT NOT NULL DEFAULT 'Red',
    "grapes" TEXT,
    "region" TEXT,
    "country" TEXT,
    "alcoholPercent" DOUBLE PRECISION,
    "bottleSize" TEXT NOT NULL DEFAULT '750ml',
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "storageLocation" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "drinkingWindowStart" INTEGER,
    "drinkingWindowEnd" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'In Cellar',
    "personalRating" INTEGER,
    "notes" TEXT,
    "hallidayScore" INTEGER,
    "hookScore" INTEGER,
    "rpScore" INTEGER,
    "larkinScore" INTEGER,
    "myScore" INTEGER,
    "others" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bottle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConsumptionLog" (
    "id" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,

    CONSTRAINT "ConsumptionLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Bottle_producer_idx" ON "Bottle"("producer");
CREATE INDEX "Bottle_wineName_idx" ON "Bottle"("wineName");
CREATE INDEX "Bottle_vintage_idx" ON "Bottle"("vintage");
CREATE INDEX "Bottle_type_idx" ON "Bottle"("type");
CREATE INDEX "Bottle_quantity_idx" ON "Bottle"("quantity");
CREATE INDEX "Bottle_drinkingWindowStart_drinkingWindowEnd_idx" ON "Bottle"("drinkingWindowStart", "drinkingWindowEnd");
CREATE INDEX "ConsumptionLog_bottleId_idx" ON "ConsumptionLog"("bottleId");
CREATE INDEX "ConsumptionLog_date_idx" ON "ConsumptionLog"("date");

ALTER TABLE "ConsumptionLog"
ADD CONSTRAINT "ConsumptionLog_bottleId_fkey"
FOREIGN KEY ("bottleId") REFERENCES "Bottle"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
