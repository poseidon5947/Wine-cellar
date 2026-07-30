import { NextResponse } from "next/server";
import { buildCellarSummary } from "@/lib/cellar-summary";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bottles = await prisma.bottle.findMany({
    orderBy: [{ producer: "asc" }, { wineName: "asc" }]
  });

  return NextResponse.json(buildCellarSummary(bottles));
}
