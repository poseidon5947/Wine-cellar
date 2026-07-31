"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BarChart3, Boxes, CircleDollarSign, Grape, MapPinned, RefreshCw, Wine } from "lucide-react";
import { Card } from "@/components/Card";
import { TiltCard } from "@/components/TiltCard";
import type { DrinkStatus } from "@/lib/drink-status";

type DashboardBottle = {
  id: string; producer: string; wineName: string; vintage: string | null;
  type: string; quantity: number; drinkingWindow: string;
  personalRating: number | null; drinkStatus: DrinkStatus;
};

type DashboardResponse = {
  kpis: {
    distinctWines: number; totalBottles: number; totalCellarValue: number;
    typeCounts: { type: string; count: number }[];
    regionCounts: { region: string; count: number }[];
    valueByType: { type: string; value: number }[];
    spendByYear: { year: string; value: number }[];
  };
  lists: { ready: DashboardBottle[]; nextYear: DashboardBottle[]; restock: DashboardBottle[] };
};

export function DashboardClient() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "rgba(80,160,130,0.2)", borderTopColor: "#3a7060" }} />
          <p className="text-sm" style={{ color: "#6a9080" }}>Loading cellar…</p>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="rounded-xl px-6 py-4 text-sm"
      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#b91c1c" }}>
      Unable to load the dashboard.
    </div>
  );

  const totalTypeCount = data.kpis.typeCounts.reduce((s, i) => s + i.count, 0);
  const maxTypeCount   = Math.max(...data.kpis.typeCounts.map((i) => i.count), 1);
  const capacityPct    = Math.min((data.kpis.totalBottles / 1200) * 100, 100);
  const avgValue       = data.kpis.totalBottles > 0 ? data.kpis.totalCellarValue / data.kpis.totalBottles : 0;
  const valuePct       = Math.min((avgValue / 150) * 100, 100);
  const distinctPct    = Math.min(data.kpis.distinctWines, 100);

  return (
    <div className="space-y-8 animate-slide-up">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label">Overview</span>
          <h1 className="mt-1 font-display text-4xl font-bold" style={{ color: "#1a2e28" }}>Cellar Dashboard</h1>
          <div className="mt-2 h-0.5 w-16" style={{ background: "linear-gradient(90deg, #8b1a1a, transparent)" }} />
        </div>
        <Link href="/bottles/new" className="btn-primary">
          <Wine size={16} />Add bottle
        </Link>
      </section>

      {/* KPI cards — TiltCard gives 3D tilt + spotlight */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={<Grape size={20} />} label="Distinct wines"
          value={data.kpis.distinctWines} formatAs="number"
          accent="oklch(35% 0.18 15)" graphLabel="Catalogue records"
          graphValue={`${data.kpis.distinctWines} tracked`} graphPercent={distinctPct} />
        <KpiCard icon={<Boxes size={20} />} label="Total bottles"
          value={data.kpis.totalBottles} formatAs="number"
          accent="oklch(25% 0.15 15)" graphLabel="1,200-bottle target"
          graphValue={`${Math.round(capacityPct)}%`} graphPercent={capacityPct} />
        <KpiCard icon={<CircleDollarSign size={20} />} label="Cellar value"
          value={data.kpis.totalCellarValue} formatAs="currency"
          accent="oklch(52% 0.14 80)" graphLabel="Average / bottle"
          graphValue={avgValue.toLocaleString(undefined, { style: "currency", currency: "AUD", maximumFractionDigits: 0 })}
          graphPercent={valuePct} />

        {/* By-type */}
        <TiltCard className="kpi-card p-5" style={{ borderColor: "oklch(52% 0.14 80 / 0.15)" }}>
          {/* banner.png — bottom-right, blended into card */}
          <div
            aria-hidden="true"
            className="kpi-banner-img"
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: "110px", height: "110px",
              borderBottomRightRadius: "0.75rem",
              pointerEvents: "none", zIndex: 0,
              backgroundImage: "url('/asset/banner.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "luminosity",
              opacity: 0.45,
              WebkitMaskImage: "radial-gradient(ellipse 95% 95% at 100% 100%, black 60%, rgba(0,0,0,0.6) 75%, transparent 92%)",
              maskImage: "radial-gradient(ellipse 95% 95% at 100% 100%, black 60%, rgba(0,0,0,0.6) 75%, transparent 92%)",
              transition: "opacity 0.4s ease",
            }}
          />
          <div className="relative" style={{ zIndex: 1 }}>
            <div className="mb-3 flex items-center gap-2.5" style={{ color: "oklch(65% 0.14 80)" }}>
              <RefreshCw size={18} /><span className="label">By type</span>
            </div>
            <TypeStack counts={data.kpis.typeCounts} total={totalTypeCount} />
            <div className="mt-3 space-y-1.5">
              {data.kpis.typeCounts.map((item) => (
                <div key={item.type} className="grid grid-cols-[72px_1fr_28px] items-center gap-3 text-sm">
                  <span className="truncate" style={{ color: "#4a7060" }}>{item.type}</span>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.7)" }}>
                    <div className="h-full rounded-full" style={{
                      width: `${item.count ? Math.max((item.count / maxTypeCount) * 100, 8) : 0}%`,
                      background: typeColor(item.type),
                      boxShadow: `0 0 16px ${typeColor(item.type)}66`
                    }} />
                  </div>
                  <span className="text-right font-bold tabular-nums" style={{ color: "#1a2e28" }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </TiltCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <CompactList title="Ready to drink" subtitle="Now" bottles={data.lists.ready} accentColor="#22c55e" />
        <CompactList title="Entering window" subtitle="Next year" bottles={data.lists.nextYear} accentColor="#3a7060" />
        <CompactList title="Restock / archive" subtitle="Action needed" bottles={data.lists.restock} accentColor="#ef4444" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <AnalyticsCard
          icon={<BarChart3 size={17} />}
          title="Spend by year"
          rows={data.kpis.spendByYear.map((item) => ({ label: item.year, value: item.value, display: currency(item.value) }))}
          empty="Add purchase dates and prices to build this trend."
          accent="#3a7060"
        />
        <AnalyticsCard
          icon={<MapPinned size={17} />}
          title="Stock by region"
          rows={data.kpis.regionCounts.map((item) => ({ label: item.region, value: item.count, display: `${item.count}` }))}
          empty="Add regions to bottles to see this breakdown."
          accent="#22c55e"
        />
        <AnalyticsCard
          icon={<CircleDollarSign size={17} />}
          title="Value by type"
          rows={data.kpis.valueByType.filter((item) => item.value > 0).map((item) => ({ label: item.type, value: item.value, display: currency(item.value) }))}
          empty="Add purchase prices to build value analytics."
          accent="#ef4444"
        />
      </section>
    </div>
  );
}

/* ── Animated counter hook ── */
function useCountUp(target: number, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return display;
}

function KpiCard({ icon, label, value, formatAs, accent, graphLabel, graphValue, graphPercent }: {
  icon: React.ReactNode; label: string; value: number; formatAs: "number" | "currency";
  accent: string; graphLabel: string; graphValue: string; graphPercent: number;
}) {
  const pct      = Math.max(0, Math.min(graphPercent, 100));
  const counted  = useCountUp(value);
  const gradId   = `spark-${label.replace(/\s+/g, "-")}`;
  const sparkPts = makeSparklinePoints(pct);

  const displayValue = formatAs === "currency"
    ? counted.toLocaleString(undefined, { style: "currency", currency: "AUD", maximumFractionDigits: 0 })
    : counted.toLocaleString();

  return (
    <TiltCard className="kpi-card p-5" style={{ borderColor: `${accent} / 0.15` }}>
          {/* banner.png — bottom-right, blended into card */}
          <div
            aria-hidden="true"
            className="kpi-banner-img"
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: "110px", height: "110px",
              borderBottomRightRadius: "0.75rem",
              pointerEvents: "none", zIndex: 0,
              backgroundImage: "url('/asset/banner.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              /* multiply blends away the grey/white bg — only dark tones stay */
              mixBlendMode: "luminosity",
              opacity: 0.45,
              /* radial mask fades edges so it melts into the card */
              WebkitMaskImage: "radial-gradient(ellipse 95% 95% at 100% 100%, black 60%, rgba(0,0,0,0.6) 75%, transparent 92%)",
              maskImage: "radial-gradient(ellipse 95% 95% at 100% 100%, black 60%, rgba(0,0,0,0.6) 75%, transparent 92%)",
              transition: "opacity 0.4s ease",
            }}
          />

      <div className="relative" style={{ zIndex: 1 }}>
        <div className="mb-3 flex items-center gap-2.5" style={{ color: accent }}>
          {icon}<span className="label">{label}</span>
        </div>
        <div className="font-display text-3xl font-bold tabular-nums" style={{ color: "#1a2e28" }}>{displayValue}</div>
        <div className="mt-3 h-px" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
        <div className="mt-5 grid grid-cols-[1fr_92px] items-end gap-4">
          <div>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span style={{ color: "#6a9080" }}>{graphLabel}</span>
              <span className="font-semibold tabular-nums" style={{ color: "#1a2e28" }}>{graphValue}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.7)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(pct, 4)}%`, background: `linear-gradient(90deg, ${accent}, oklch(75% 0.14 80))`, boxShadow: `0 0 18px ${accent}` }} />
            </div>
          </div>
          <svg viewBox="0 0 92 42" className="h-11 w-full">
            <defs>
              <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor={accent} stopOpacity="0.3" />
                <stop offset="100%" stopColor="oklch(75% 0.14 80)" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            <path d="M2 38H90" stroke="rgba(80,160,130,0.2)" strokeWidth="1" />
            <polyline points={sparkPts} fill="none" stroke={`url(#${gradId})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </TiltCard>
  );
}

function CompactList({ title, subtitle, bottles, accentColor }: {
  title: string; subtitle: string; bottles: DashboardBottle[]; accentColor: string;
}) {
  return (
    <Card overflow>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(80,160,130,0.2)" }}>
        <div>
          <p className="font-semibold" style={{ color: "#1a2e28" }}>{title}</p>
          <p className="text-xs" style={{ color: accentColor }}>{subtitle}</p>
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold tabular-nums"
          style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }}>
          {bottles.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm wine-table">
          <thead>
            <tr>
              <th className="px-5 py-2.5">Wine</th>
              <th className="px-3 py-2.5">Type</th>
              <th className="px-3 py-2.5">Qty</th>
              <th className="px-3 py-2.5">Window</th>
            </tr>
          </thead>
          <tbody>
            {bottles.length ? bottles.map((b) => (
              <tr key={b.id}>
                <td className="px-5 py-3">
                  <Link href={`/bottles/${b.id}`}
                    className="font-semibold transition-colors duration-150 hover:text-[--accent]"
                    style={{ color: "#1a2e28", ["--accent" as string]: accentColor } as React.CSSProperties}>
                    {b.producer}
                  </Link>
                  <div className="mt-0.5 text-xs" style={{ color: "#6a9080" }}>
                    {b.wineName}{b.vintage ? ` · ${b.vintage}` : ""}
                  </div>
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: "#4a7060" }}>{b.type}</td>
                <td className="px-3 py-3 font-bold tabular-nums" style={{ color: "#1a2e28" }}>{b.quantity}</td>
                <td className="px-3 py-3 text-xs" style={{ color: "#4a7060" }}>{b.drinkingWindow}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: "#8aaa9a" }}>No bottles in this list.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TypeStack({ counts, total }: { counts: { type: string; count: number }[]; total: number }) {
  if (!total) return (
    <div className="h-3 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.7)" }}>
      <div className="h-full w-full" style={{ background: "linear-gradient(90deg,rgba(80,160,130,0.15),rgba(80,160,130,0.3))" }} />
    </div>
  );
  return (
    <div className="flex h-3 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.7)" }}>
      {counts.filter((i) => i.count > 0).map((i) => (
        <div key={i.type} title={`${i.type}: ${i.count}`}
          style={{ width: `${(i.count / total) * 100}%`, background: typeColor(i.type) }} />
      ))}
    </div>
  );
}

function AnalyticsCard({ icon, title, rows, empty, accent }: {
  icon: React.ReactNode;
  title: string;
  rows: { label: string; value: number; display: string }[];
  empty: string;
  accent: string;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2.5" style={{ color: accent }}>
        {icon}
        <span className="section-title-text font-semibold" style={{ color: "#3a7060" }}>{title}</span>
      </div>
      {rows.length ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[96px_1fr_76px] items-center gap-3 text-sm">
              <span className="truncate" style={{ color: "#4a7060" }}>{row.label}</span>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.7)" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max((row.value / max) * 100, 4)}%`,
                    background: `linear-gradient(90deg, ${accent}, #3a7060)`,
                    boxShadow: `0 0 16px ${accent}55`
                  }}
                />
              </div>
              <span className="text-right text-xs font-semibold tabular-nums" style={{ color: "#1a2e28" }}>{row.display}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: "#6a9080" }}>{empty}</p>
      )}
    </Card>
  );
}

function currency(value: number) {
  return value.toLocaleString(undefined, { style: "currency", currency: "AUD", maximumFractionDigits: 0 });
}

function typeColor(type: string) {
  const map: Record<string, string> = {
    Red: "oklch(30% 0.18 15)", White: "oklch(72% 0.14 80)",
    Sparkling: "oklch(82% 0.10 85)", Rose: "oklch(62% 0.18 0)",
    Fortified: "oklch(45% 0.12 40)", Dessert: "oklch(65% 0.18 300)"
  };
  return map[type] ?? "#4a7060";
}

function makeSparklinePoints(percent: number) {
  const base = Math.max(4, Math.min(percent, 100));
  const vals = [base*0.35, base*0.52, base*0.45, base*0.70, base*0.62, base*0.86, base].map((v) => Math.max(v, 3));
  return vals.map((v, i) => `${4+i*14},${(38-(v/100)*32).toFixed(1)}`).join(" ");
}
