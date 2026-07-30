import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildCellarSummary } from "@/lib/cellar-summary";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Manual test:
// curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/reminders
// Vercel Cron can send the same bearer token automatically when CRON_SECRET is set in project env vars.
export async function GET(request: NextRequest) {
  const expectedToken = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  if (!expectedToken || authorization !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const to = process.env.REMINDER_EMAIL_TO;

  if (!resendApiKey || !to) {
    return NextResponse.json({ error: "Reminder email environment variables are not configured." }, { status: 500 });
  }

  const bottles = await prisma.bottle.findMany({
    orderBy: [{ producer: "asc" }, { wineName: "asc" }]
  });
  const { lists } = buildCellarSummary(bottles);

  if (!lists.ready.length && !lists.nextYear.length && !lists.restock.length) {
    return NextResponse.json({ skipped: true, reason: "No reminder items." });
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: process.env.REMINDER_EMAIL_FROM || "Wine Cellar <onboarding@resend.dev>",
    to,
    subject: `Wine Cellar drinking-window reminders - ${new Date().toLocaleDateString("en-AU", { month: "long", year: "numeric" })}`,
    html: renderEmail(lists)
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({
    sent: true,
    counts: {
      ready: lists.ready.length,
      nextYear: lists.nextYear.length,
      restock: lists.restock.length
    }
  });
}

type ReminderBottle = {
  producer: string;
  wineName: string;
  vintage: string | null;
  quantity: number;
};

function renderEmail(lists: {
  ready: ReminderBottle[];
  nextYear: ReminderBottle[];
  restock: ReminderBottle[];
}) {
  return `
    <div style="margin:0;padding:24px;background:#140c0d;color:#f5f0e8;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:680px;margin:0 auto;background:#1c1719;border:1px solid rgba(212,175,55,0.24);border-radius:12px;padding:24px;">
        <p style="margin:0 0 6px;color:#d4af37;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;">Wine Cellar</p>
        <h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;color:#f5f0e8;">Monthly drinking-window reminders</h1>
        ${section("Ready to drink", "Bottles currently marked Ready or Drink now.", lists.ready)}
        ${section("Entering window next year", "Bottles whose drinking window starts next calendar year.", lists.nextYear)}
        ${section("Restock / archive", "Bottles that are out of stock.", lists.restock)}
      </div>
    </div>
  `;
}

function section(title: string, subtitle: string, bottles: ReminderBottle[]) {
  return `
    <div style="margin-top:22px;">
      <h2 style="margin:0;color:#d4af37;font-size:17px;">${escapeHtml(title)}</h2>
      <p style="margin:4px 0 12px;color:#8a7080;font-size:13px;">${escapeHtml(subtitle)}</p>
      ${bottles.length ? table(bottles) : `<p style="margin:0;color:#8a7080;font-size:14px;">No bottles in this group.</p>`}
    </div>
  `;
}

function table(bottles: ReminderBottle[]) {
  return `
    <table style="width:100%;border-collapse:collapse;border:1px solid rgba(255,255,255,0.08);">
      <thead>
        <tr>
          <th align="left" style="padding:10px;color:#9a7c22;font-size:12px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.08);">Wine</th>
          <th align="left" style="padding:10px;color:#9a7c22;font-size:12px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.08);">Vintage</th>
          <th align="right" style="padding:10px;color:#9a7c22;font-size:12px;text-transform:uppercase;border-bottom:1px solid rgba(255,255,255,0.08);">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${bottles.map((bottle) => `
          <tr>
            <td style="padding:10px;color:#f5f0e8;border-bottom:1px solid rgba(255,255,255,0.06);">
              <strong>${escapeHtml(bottle.producer)}</strong><br />
              <span style="color:#b09aa8;">${escapeHtml(bottle.wineName)}</span>
            </td>
            <td style="padding:10px;color:#b09aa8;border-bottom:1px solid rgba(255,255,255,0.06);">${escapeHtml(bottle.vintage || "-")}</td>
            <td align="right" style="padding:10px;color:#f5f0e8;border-bottom:1px solid rgba(255,255,255,0.06);">${bottle.quantity}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
