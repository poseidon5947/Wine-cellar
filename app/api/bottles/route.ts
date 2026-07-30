import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { addBottleDerivedFields, normalizeBottleInput } from "@/lib/bottle";
import { buildBottleWhere, safeBottleSort } from "@/lib/bottle-query";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || 25), 10), 100);
  const sortBy = safeBottleSort(searchParams.get("sortBy"));
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
  const where = buildBottleWhere(searchParams);

  const [rows, total] = await Promise.all([
    prisma.bottle.findMany({
      where,
      orderBy: [{ [sortBy]: sortDir }, { producer: "asc" }, { wineName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.bottle.count({ where })
  ]);

  return NextResponse.json({
    rows: rows.map(addBottleDerivedFields),
    total,
    page,
    pageSize,
    pages: Math.ceil(total / pageSize)
  });
}

export async function POST(request: NextRequest) {
  try {
    const input = await request.json();
    const data = normalizeBottleInput(input);
    const bottle = await prisma.bottle.create({ data: data as Prisma.BottleCreateInput });
    return NextResponse.json(addBottleDerivedFields(bottle), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create bottle." }, { status: 400 });
  }
}
