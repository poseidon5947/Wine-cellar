import { NextRequest, NextResponse } from "next/server";
import { buildHistoryWhere } from "@/lib/history-query";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const EXPORT_FIELDS = [
  "date",
  "bottle producer",
  "bottle wineName",
  "bottle vintage",
  "quantity",
  "note"
] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rows = await prisma.consumptionLog.findMany({
    where: buildHistoryWhere(searchParams),
    include: {
      bottle: {
        select: {
          producer: true,
          wineName: true,
          vintage: true
        }
      }
    },
    orderBy: [{ date: "desc" }, { id: "desc" }]
  });

  const csv = [
    EXPORT_FIELDS.join(","),
    ...rows.map((row) => [
      csvCell(row.date),
      csvCell(row.bottle.producer),
      csvCell(row.bottle.wineName),
      csvCell(row.bottle.vintage),
      csvCell(row.quantity),
      csvCell(row.note)
    ].join(","))
  ].join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="wine-cellar-history-${stamp}.csv"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}

function csvCell(value: unknown) {
  if (value instanceof Date) return csvCell(value.toISOString().slice(0, 10));
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
