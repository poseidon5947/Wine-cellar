import { NextRequest, NextResponse } from "next/server";
import { lookupCriticScores } from "@/lib/critic-lookup";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const bottle = await prisma.bottle.findUnique({
    where: { id },
    select: { producer: true, wineName: true, vintage: true }
  });

  if (!bottle) return NextResponse.json({ error: "Bottle not found." }, { status: 404 });

  const result = await lookupCriticScores(bottle.producer, bottle.wineName, bottle.vintage || "");
  if (!result) return NextResponse.json({ scores: null, message: "Critic score lookup is not configured." });

  return NextResponse.json({ scores: result });
}
