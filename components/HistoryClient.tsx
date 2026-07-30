"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, History, X } from "lucide-react";
import { Card } from "@/components/Card";

type HistoryRow = {
  id: string;
  date: string;
  quantity: number;
  note: string | null;
  bottle: {
    id: string;
    producer: string;
    wineName: string;
    vintage: string | null;
    photoUrl: string | null;
  };
};

type HistoryResponse = {
  rows: HistoryRow[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

const initialFilters = { from: "", to: "" };

export function HistoryClient() {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "25" });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters, page]);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/history?${query}`)
      .then((response) => response.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [query]);

  useEffect(() => { load(); }, [load]);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  function exportCsv() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    window.location.href = `/api/history/export?${params.toString()}`;
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label">Activity</span>
          <h1 className="mt-1 font-display text-4xl font-bold" style={{ color: "#f5f0e8" }}>Cellar History</h1>
          <div className="mt-2 h-0.5 w-16" style={{ background: "linear-gradient(90deg, #8b1a1a, transparent)" }} />
        </div>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ color: "#d4af37", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.24)" }}>
          <History size={15} />Consumption log
        </div>
      </section>

      <Card className="p-5">
        <div className="grid gap-3 sm:grid-cols-[220px_220px_auto]">
          <FilterInput label="From" type="date" value={filters.from} onChange={(value) => updateFilter("from", value)} />
          <FilterInput label="To" type="date" value={filters.to} onChange={(value) => updateFilter("to", value)} />
          <div className="flex items-end">
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn-secondary" onClick={exportCsv}>
                <Download size={15} />Download CSV
              </button>
              {hasActiveFilters && (
                <button className="btn-secondary" onClick={() => { setFilters(initialFilters); setPage(1); }}>
                  <X size={14} />Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card overflow>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ color: "#b09aa8" }}>
            {data
              ? <><span className="font-bold" style={{ color: "#f5f0e8" }}>{data.total.toLocaleString()}</span> history entries</>
              : "Loading..."}
          </span>
          {loading && (
            <span className="flex items-center gap-2 text-xs" style={{ color: "#8a7080" }}>
              <div className="h-3.5 w-3.5 rounded-full border border-t-transparent animate-spin" style={{ borderColor: "rgba(139,26,26,0.4)", borderTopColor: "#8b1a1a" }} />
              Refreshing
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left text-sm wine-table">
            <thead>
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-3 py-3">Bottle</th>
                <th className="px-3 py-3">Quantity consumed</th>
                <th className="px-3 py-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.length ? data.rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-3 text-xs" style={{ color: "#8a7080" }}>
                    {new Date(row.date).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Thumb url={row.bottle.photoUrl} />
                      <div>
                        <Link href={`/bottles/${row.bottle.id}`} className="font-semibold transition-colors duration-150 hover:text-[#d4af37]" style={{ color: "#f5f0e8" }}>
                          {row.bottle.producer}
                        </Link>
                        <div className="mt-0.5 text-xs" style={{ color: "#8a7080" }}>
                          {row.bottle.wineName}{row.bottle.vintage ? ` - ${row.bottle.vintage}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-bold tabular-nums" style={{ color: "#f5f0e8" }}>{row.quantity}</td>
                  <td className="px-3 py-3" style={{ color: "#b09aa8" }}>{row.note || "-"}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm" style={{ color: "#5a4550" }}>
                    No cellar history for the current date range.
                  </td>
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

function FilterInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field mt-1.5" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Thumb({ url }: { url: string | null }) {
  if (!url) return (
    <div className="flex h-14 w-11 items-center justify-center rounded-lg text-xs"
      style={{ background: "rgba(255,255,255,0.04)", color: "#5a4550", border: "1px solid rgba(255,255,255,0.06)" }}>-</div>
  );
  return <img src={url} alt="" className="h-14 w-11 rounded-lg object-cover" style={{ border: "1px solid rgba(255,255,255,0.08)" }} />;
}
