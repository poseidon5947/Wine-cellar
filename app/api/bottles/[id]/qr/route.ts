import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const bottle = await prisma.bottle.findUnique({ where: { id }, select: { id: true } });
  if (!bottle) return NextResponse.json({ error: "Bottle not found." }, { status: 404 });

  const url = new URL(`/bottles/${id}`, request.nextUrl.origin).toString();
  const png = await QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 360,
    color: {
      dark: "#140c0d",
      light: "#ffffff"
    }
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "image/png"
    }
  });
}
