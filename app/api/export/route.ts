import { NextRequest, NextResponse } from "next/server";
import { buildBottleWhere, safeBottleSort } from "@/lib/bottle-query";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const EXPORT_FIELDS = [
  "producer",
  "wineName",
  "vintage",
  "type",
  "grapes",
  "region",
  "country",
  "alcoholPercent",
  "bottleSize",
  "quantity",
  "storageLocation",
  "purchaseDate",
  "purchasePrice",
  "drinkingWindowStart",
  "drinkingWindowEnd",
  "status",
  "personalRating",
  "hookScore",
  "hallidayScore",
  "rpScore",
  "larkinScore",
  "myScore",
  "others",
  "notes",
  "myNotes",
  "photoUrl"
] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sortBy = safeBottleSort(searchParams.get("sortBy"));
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
  const rows = await prisma.bottle.findMany({
    where: buildBottleWhere(searchParams),
    orderBy: [{ [sortBy]: sortDir }, { producer: "asc" }, { wineName: "asc" }]
  });

  const csv = [
    EXPORT_FIELDS.join(","),
    ...rows.map((row) => EXPORT_FIELDS.map((field) => csvCell(row[field])).join(","))
  ].join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="wine-cellar-${stamp}.csv"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}

function csvCell(value: unknown) {
  if (value instanceof Date) return csvCell(value.toISOString().slice(0, 10));
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
