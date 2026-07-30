import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ name: string }>;
};

const MIME_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

export async function GET(_request: NextRequest, { params }: Params) {
  const uploadDir = process.env.WINE_CELLAR_UPLOAD_DIR;
  if (!uploadDir) return NextResponse.json({ error: "Local uploads are not enabled." }, { status: 404 });

  const { name } = await params;
  const safeName = path.basename(name);
  if (safeName !== name) return NextResponse.json({ error: "Invalid file name." }, { status: 400 });

  try {
    const filePath = path.join(uploadDir, safeName);
    const body = await fs.readFile(filePath);
    const contentType = MIME_TYPES[path.extname(safeName).toLowerCase()] || "application/octet-stream";

    return new NextResponse(body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType
      }
    });
  } catch {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }
}
