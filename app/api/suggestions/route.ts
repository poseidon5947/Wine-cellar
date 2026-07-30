import { NextRequest, NextResponse } from "next/server";
import { COMMON_GRAPE_VARIETIES, sortGrapeVarieties } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const SUGGESTION_FIELDS = ["producer", "wineName", "grapes", "region", "storageLocation"] as const;

type SuggestionField = (typeof SUGGESTION_FIELDS)[number];

export async function GET(request: NextRequest) {
  const field = request.nextUrl.searchParams.get("field");

  if (!isSuggestionField(field)) {
    return NextResponse.json({ error: "Unsupported suggestion field." }, { status: 400 });
  }

  const values = await getDistinctValues(field);
  return NextResponse.json({ field, values });
}

function isSuggestionField(field: string | null): field is SuggestionField {
  return SUGGESTION_FIELDS.includes(field as SuggestionField);
}

async function getDistinctValues(field: SuggestionField) {
  switch (field) {
    case "producer": {
      const rows = await prisma.bottle.findMany({
        distinct: ["producer"],
        select: { producer: true },
        where: { producer: { not: "" } },
        orderBy: { producer: "asc" }
      });
      return rows.map((row) => row.producer).filter(Boolean);
    }
    case "wineName": {
      const rows = await prisma.bottle.findMany({
        distinct: ["wineName"],
        select: { wineName: true },
        where: { wineName: { not: "" } },
        orderBy: { wineName: "asc" }
      });
      return rows.map((row) => row.wineName).filter(Boolean);
    }
    case "grapes": {
      const rows = await prisma.bottle.findMany({
        distinct: ["grapes"],
        select: { grapes: true },
        where: { grapes: { not: null } },
        orderBy: { grapes: "asc" }
      });
      return mergeCuratedWithDbValues(
        COMMON_GRAPE_VARIETIES,
        rows.map((row) => row.grapes).filter((value): value is string => Boolean(value?.trim()))
      );
    }
    case "storageLocation": {
      const rows = await prisma.bottle.findMany({
        distinct: ["storageLocation"],
        select: { storageLocation: true },
        where: { storageLocation: { not: null } },
        orderBy: { storageLocation: "asc" }
      });
      return rows.map((row) => row.storageLocation).filter((value): value is string => Boolean(value?.trim()));
    }
    case "region": {
      const rows = await prisma.bottle.findMany({
        distinct: ["region"],
        select: { region: true },
        where: { region: { not: null } },
        orderBy: { region: "asc" }
      });
      return rows.map((row) => row.region).filter((value): value is string => Boolean(value?.trim()));
    }
  }
}

function mergeCuratedWithDbValues(curated: readonly string[], dbValues: string[]) {
  const values = new Map<string, string>();
  curated.forEach((value) => values.set(value.trim().toLowerCase(), value.trim()));
  dbValues.forEach((value) => values.set(value.trim().toLowerCase(), value.trim()));
  return sortGrapeVarieties(Array.from(values.values()));
}
