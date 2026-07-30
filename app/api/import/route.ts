import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { normalizeBottleInput, type BottleInput } from "@/lib/bottle";
import { prisma } from "@/lib/prisma";

type ImportRequest = {
  rows: Record<string, unknown>[];
  mapping: Record<string, string>;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ImportRequest;
    if (!Array.isArray(body.rows) || !body.rows.length) {
      return NextResponse.json({ error: "No CSV rows were provided." }, { status: 400 });
    }

    const prepared = body.rows
      .map((row) => mapRow(row, body.mapping))
      .filter((row) => row.producer && row.wineName)
      .map((row) => normalizeBottleInput(row) as Prisma.BottleCreateManyInput);

    if (!prepared.length) {
      return NextResponse.json({ error: "No rows contained both producer and wine name." }, { status: 400 });
    }

    const result = await prisma.bottle.createMany({ data: prepared });
    return NextResponse.json({ imported: result.count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to import CSV." }, { status: 400 });
  }
}

function mapRow(row: Record<string, unknown>, mapping: Record<string, string>): BottleInput {
  const output: Record<string, unknown> = {};

  for (const [field, column] of Object.entries(mapping)) {
    if (!column) continue;
    output[field] = row[column];
  }

  return output as BottleInput;
}
