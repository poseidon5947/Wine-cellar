import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { addBottleDerivedFields, normalizeBottleInput } from "@/lib/bottle";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const bottle = await prisma.bottle.findUnique({
    where: { id },
    include: {
      consumptionLogs: { orderBy: { date: "desc" } },
      photos: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] }
    }
  });

  if (!bottle) return NextResponse.json({ error: "Bottle not found." }, { status: 404 });
  return NextResponse.json(addBottleDerivedFields(bottle));
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const input = await request.json();
    const data = normalizeBottleInput(input);
    const bottle = await prisma.bottle.update({
      where: { id },
      data: data as Prisma.BottleUpdateInput
    });

    return NextResponse.json(addBottleDerivedFields(bottle));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update bottle." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.bottle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
