import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { url } = await request.json();
    if (typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "Photo URL is required." }, { status: 400 });
    }

    const bottle = await prisma.bottle.findUnique({ where: { id }, select: { id: true } });
    if (!bottle) return NextResponse.json({ error: "Bottle not found." }, { status: 404 });

    const lastPhoto = await prisma.bottlePhoto.findFirst({
      where: { bottleId: id },
      orderBy: { position: "desc" },
      select: { position: true }
    });

    const photo = await prisma.bottlePhoto.create({
      data: {
        bottleId: id,
        url: url.trim(),
        position: (lastPhoto?.position ?? -1) + 1
      }
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to add photo." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { photoId } = await request.json();
    if (typeof photoId !== "string" || !photoId) {
      return NextResponse.json({ error: "Photo ID is required." }, { status: 400 });
    }

    await prisma.bottlePhoto.deleteMany({ where: { id: photoId, bottleId: id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to remove photo." }, { status: 400 });
  }
}
