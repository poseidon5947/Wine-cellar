CREATE TABLE "BottlePhoto" (
    "id" TEXT NOT NULL,
    "bottleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BottlePhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BottlePhoto_bottleId_idx" ON "BottlePhoto"("bottleId");

CREATE INDEX "BottlePhoto_position_idx" ON "BottlePhoto"("position");

ALTER TABLE "BottlePhoto" ADD CONSTRAINT "BottlePhoto_bottleId_fkey" FOREIGN KEY ("bottleId") REFERENCES "Bottle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
