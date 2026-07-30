import { NextRequest, NextResponse } from "next/server";
import { addBottleDerivedFields } from "@/lib/bottle";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { bottleId, note } = await request.json();

  if (!bottleId) {
    return NextResponse.json({ error: "Bottle ID is required." }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const bottle = await tx.bottle.findUnique({ where: { id: bottleId } });
      if (!bottle) throw new Error("Bottle not found.");
      if (bottle.quantity <= 0) throw new Error("This wine is already out of stock.");

      await tx.consumptionLog.create({
        data: {
          bottleId,
          quantity: 1,
          note: typeof note === "string" && note.trim() ? note.trim() : null
        }
      });

      return tx.bottle.update({
        where: { id: bottleId },
        data: { quantity: { decrement: 1 } }
      });
    });

    return NextResponse.json(addBottleDerivedFields(updated));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to drink bottle." }, { status: 400 });
  }
}
