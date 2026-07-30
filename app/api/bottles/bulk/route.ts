import { NextRequest, NextResponse } from "next/server";
import { BOTTLE_STATUSES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type BulkBody = {
  ids?: unknown;
  action?: unknown;
  status?: unknown;
  storageLocation?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as BulkBody;
    const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === "string" && Boolean(id)) : [];
    if (!ids.length) return NextResponse.json({ error: "Select at least one bottle." }, { status: 400 });

    if (body.action === "delete") {
      const result = await prisma.bottle.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ updated: result.count });
    }

    const data: { status?: string; storageLocation?: string | null } = {};
    if (typeof body.status === "string" && body.status) {
      if (!BOTTLE_STATUSES.includes(body.status as (typeof BOTTLE_STATUSES)[number])) {
        return NextResponse.json({ error: "Unsupported status." }, { status: 400 });
      }
      data.status = body.status;
    }
    if (typeof body.storageLocation === "string") {
      data.storageLocation = body.storageLocation.trim() || null;
    }
    if (!Object.keys(data).length) return NextResponse.json({ error: "Choose a bulk change first." }, { status: 400 });

    const result = await prisma.bottle.updateMany({ where: { id: { in: ids } }, data });
    return NextResponse.json({ updated: result.count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to apply bulk action." }, { status: 400 });
  }
}
