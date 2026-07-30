"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, Wine } from "lucide-react";
import { Card } from "@/components/Card";
import { StatusChip } from "@/components/StatusChip";
import { WINE_TYPES } from "@/lib/constants";
import type { DrinkStatus } from "@/lib/drink-status";

type ShareBottle = {
  id: string;
  producer: string;
  wineName: string;
  vintage: string | null;
  type: string;
  grapes: string | null;
  region: string | null;
  quantity: number;
  drinkingWindow: string;
  drinkStatus: DrinkStatus;
};

type ShareResponse = {
  rows: ShareBottle[];
  total: number;
  page: number;
  pages: number;
};

export function ShareCatalogueClient() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ShareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), pageSize: "25", sortBy: "producer", sortDir: "asc" });
    if (search.trim()) p.set("search", search.trim());
    if (type) p.set("type", type);
    return p.toString();
  }, [page, search, type]);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/share/bottles?${query}`)
      .then((response) => response.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6 animate-slide-up">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label">Read-only cellar</span>
          <h1 className="mt-1 font-display text-4xl font-bold" style={{ color: "#f5f0e8" }}>Wine Cellar</h1>
          <div className="mt-2 h-0.5 w-16" style={{ background: "linear-gradient(90deg, #8b1a1a, transparent)" }} />
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ color: "#d4af37", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.24)" }}>
          <Wine size={15} />View only
        </div>
      </section>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative block">
            <span className="label">Search</span>
            <Search className="pointer-events-none absolute left-3 top-[2.15rem]" size={15} style={{ color: "#8a7080" }} />
            <input className="field mt-1.5 pl-9" value={search} placeholder="Producer, wine, notes..." onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          </label>
          <label className="block">
            <span className="label">Type</span>
            <select className="field mt-1.5" value={type} onChange={(event) => { setType(event.target.value); setPage(1); }}>
              <option value="">All types</option>
              {WINE_TYPES.map((wineType) => <option key={wineType} value={wineType}>{wineType}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <Card overflow>
        <div className="flex items-center justify-between px-5 py-3.5 text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ color: "#b09aa8" }}>
            {data ? <><span className="font-bold" style={{ color: "#f5f0e8" }}>{data.total.toLocaleString()}</span> wines</> : "Loading..."}
          </span>
          {loading && <span className="text-xs" style={{ color: "#8a7080" }}>Refreshing</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm wine-table">
            <thead>
              <tr>
                <th className="px-5 py-3">Producer</th>
                <th className="px-3 py-3">Wine</th>
                <th className="px-3 py-3">Vintage</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Grapes</th>
                <th className="px-3 py-3">Region</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-3 py-3">Window</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.length ? data.rows.map((bottle) => (
                <tr key={bottle.id}>
                  <td className="px-5 py-3 font-semibold" style={{ color: "#f5f0e8" }}>{bottle.producer}</td>
                  <td className="px-3 py-3" style={{ color: "#b09aa8" }}>{bottle.wineName}</td>
                  <td className="px-3 py-3" style={{ color: "#8a7080" }}>{bottle.vintage || "-"}</td>
                  <td className="px-3 py-3" style={{ color: "#b09aa8" }}>{bottle.type}</td>
                  <td className="px-3 py-3" style={{ color: "#8a7080" }}>{bottle.grapes || "-"}</td>
                  <td className="px-3 py-3" style={{ color: "#8a7080" }}>{bottle.region || "-"}</td>
                  <td className="px-3 py-3 font-bold tabular-nums" style={{ color: "#f5f0e8" }}>{bottle.quantity}</td>
                  <td className="px-3 py-3 text-xs" style={{ color: "#8a7080" }}>{bottle.drinkingWindow}</td>
                  <td className="px-3 py-3"><StatusChip status={bottle.drinkStatus} /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm" style={{ color: "#5a4550" }}>No bottles to show.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>
            <ChevronLeft size={15} />Previous
          </button>
          <span className="text-sm" style={{ color: "#8a7080" }}>
            Page <span className="font-semibold" style={{ color: "#f5f0e8" }}>{data?.page ?? page}</span>
            {" "}of <span className="font-semibold" style={{ color: "#f5f0e8" }}>{data?.pages ?? 1}</span>
          </span>
          <button className="btn-secondary" disabled={!data || page >= data.pages} onClick={() => setPage((current) => current + 1)}>
            Next<ChevronRight size={15} />
          </button>
        </div>
      </Card>
    </div>
  );
}
