import { NextRequest, NextResponse } from "next/server";
import { buildHistoryWhere } from "@/lib/history-query";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || 25), 10), 100);
  const where = buildHistoryWhere(searchParams);

  const [rows, total] = await Promise.all([
    prisma.consumptionLog.findMany({
      where,
      include: {
        bottle: {
          select: {
            id: true,
            producer: true,
            wineName: true,
            vintage: true,
            photoUrl: true
          }
        }
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.consumptionLog.count({ where })
  ]);

  return NextResponse.json({
    rows,
    total,
    page,
    pageSize,
    pages: Math.ceil(total / pageSize)
  });
}
