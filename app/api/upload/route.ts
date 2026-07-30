import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const localUploadDir = process.env.WINE_CELLAR_UPLOAD_DIR;

  if (!localUploadDir && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured. Add Vercel Blob credentials before uploading images." },
      { status: 501 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file was uploaded." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
    }

    const maxBytes = 4 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: "Image is too large. Please upload an image smaller than 4 MB." }, { status: 413 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    if (localUploadDir) {
      await fs.mkdir(localUploadDir, { recursive: true });
      const fileName = `${Date.now()}-${randomUUID()}-${safeName}`;
      const filePath = path.join(localUploadDir, fileName);
      await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));
      return NextResponse.json({ url: `/api/uploads/${fileName}` });
    }

    const blob = await put(`wine-labels/${Date.now()}-${safeName}`, file, {
      access: "public",
      contentType: file.type
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
