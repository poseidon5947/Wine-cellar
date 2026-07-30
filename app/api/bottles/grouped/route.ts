import { NextRequest, NextResponse } from "next/server";
import { buildBottleWhere } from "@/lib/bottle-query";
import { prisma } from "@/lib/prisma";

type GroupedBottle = {
  producer: string;
  wineName: string;
  vintage: string | null;
  type: string;
  quantity: number;
  locations: {
    id: string;
    storageLocation: string | null;
    quantity: number;
  }[];
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") || 25), 10), 100);
  const where = buildBottleWhere(searchParams);

  const bottles = await prisma.bottle.findMany({
    where,
    select: {
      id: true,
      producer: true,
      wineName: true,
      vintage: true,
      type: true,
      quantity: true,
      storageLocation: true
    },
    orderBy: [{ producer: "asc" }, { wineName: "asc" }, { vintage: "asc" }, { storageLocation: "asc" }]
  });

  const grouped = new Map<string, GroupedBottle>();
  for (const bottle of bottles) {
    const key = [bottle.producer, bottle.wineName, bottle.vintage || ""].join("\u0000");
    const group = grouped.get(key) || {
      producer: bottle.producer,
      wineName: bottle.wineName,
      vintage: bottle.vintage,
      type: bottle.type,
      quantity: 0,
      locations: []
    };

    group.quantity += bottle.quantity;
    group.locations.push({
      id: bottle.id,
      storageLocation: bottle.storageLocation,
      quantity: bottle.quantity
    });
    grouped.set(key, group);
  }

  const rows = Array.from(grouped.values());
  const total = rows.length;
  return NextResponse.json({
    rows: rows.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    pages: Math.ceil(total / pageSize)
  });
}
