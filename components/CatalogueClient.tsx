"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Layers2, Search, Share2, Trash2, Wine, SlidersHorizontal, X } from "lucide-react";
import { StatusChip } from "@/components/StatusChip";
import { Card } from "@/components/Card";
import { BOTTLE_STATUSES, WINE_TYPES } from "@/lib/constants";
import type { DrinkStatus } from "@/lib/drink-status";

type BottleRow = {
  id: string;
  photoUrl: string | null;
  producer: string;
  wineName: string;
  vintage: string | null;
  type: string;
  grapes: string | null;
  region: string | null;
  quantity: number;
  storageLocation: string | null;
  status: string;
  drinkingWindow: string;
  personalRating: number | null;
  drinkStatus: DrinkStatus;
  hallidayScore: number | null;
  hookScore: number | null;
  rpScore: number | null;
  larkinScore: number | null;
  myScore: number | null;
  others: string | null;
};

type CatalogueResponse = {
  rows: BottleRow[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

type GroupedBottleRow = {
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

type GroupedCatalogueResponse = {
  rows: GroupedBottleRow[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

const initialFilters = {
  search: "", producer: "", grape: "", region: "", vintage: "", type: "",
  rating: "", quantity: "", windowStart: "", windowEnd: "",
  hallidayScore: "", hookScore: "", rpScore: "", larkinScore: "", myScore: "", others: ""
};

export function CatalogueClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search")?.trim() || "";
  const [filters, setFilters] = useState(() => ({ ...initialFilters, search: initialSearch }));
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"all" | "grouped">("all");
  const [data, setData] = useState<CatalogueResponse | null>(null);
  const [groupedData, setGroupedData] = useState<GroupedCatalogueResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkStorageLocation, setBulkStorageLocation] = useState("");
  const [bulkWorking, setBulkWorking] = useState(false);

  const query = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), pageSize: "25", sortBy, sortDir });
    Object.entries(filters).forEach(([k, v]) => { if (v.trim()) p.set(k, v.trim()); });
    return p.toString();
  }, [filters, page, sortBy, sortDir]);

  const load = useCallback(() => {
    setLoading(true);
    const endpoint = viewMode === "grouped" ? "/api/bottles/grouped" : "/api/bottles";
    fetch(`${endpoint}?${query}`)
      .then((r) => r.json())
      .then((body) => {
        if (viewMode === "grouped") setGroupedData(body);
        else setData(body);
      })
      .finally(() => setLoading(false));
  }, [query, viewMode]);

  useEffect(() => { load(); }, [load]);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((c) => ({ ...c, [key]: value }));
    setPage(1);
  }

  function toggleSort(field: string) {
    if (sortBy === field) setSortDir((c) => (c === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir("asc"); }
  }

  function changeViewMode(mode: "all" | "grouped") {
    setViewMode(mode);
    setPage(1);
    setSelectedIds([]);
  }

  const hasActiveFilters = Object.values(filters).some((v) => v.trim());
  const pageIds = useMemo(() => data?.rows.map((row) => row.id) || [], [data]);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const activeData = viewMode === "grouped" ? groupedData : data;

  useEffect(() => {
    const nextSearch = searchParams.get("search")?.trim() || "";
    setFilters((current) => current.search === nextSearch ? current : { ...current, search: nextSearch });
    setPage(1);
  }, [searchParams]);

  async function drinkOne(e: React.MouseEvent, bottleId: string) {
    e.stopPropagation();
    setMessage("");
    const r = await fetch("/api/bottles/drink", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bottleId })
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) { setMessage(body.error || "Unable to update quantity."); return; }
    setMessage("Logged one bottle consumed.");
    load();
  }

  function exportCsv() {
    window.location.href = `/api/export?${query}`;
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function togglePageSelected() {
    setSelectedIds((current) => {
      if (allPageSelected) return current.filter((id) => !pageIds.includes(id));
      return Array.from(new Set([...current, ...pageIds]));
    });
  }

  async function applyBulkAction(action?: "delete") {
    setMessage("");
    if (!selectedIds.length) return;
    if (action === "delete" && !window.confirm(`Delete ${selectedIds.length} selected bottle records?`)) return;

    setBulkWorking(true);
    const r = await fetch("/api/bottles/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids: selectedIds,
        action,
        status: bulkStatus,
        storageLocation: bulkStorageLocation
      })
    });
    const body = await r.json().catch(() => ({}));
    setBulkWorking(false);
    if (!r.ok) {
      setMessage(body.error || "Unable to apply bulk action.");
      return;
    }
    setMessage(action === "delete" ? `Deleted ${body.updated} records.` : `Updated ${body.updated} records.`);
    setSelectedIds([]);
    setBulkStatus("");
    setBulkStorageLocation("");
    load();
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label">Inventory</span>
          <h1 className="mt-1 font-display text-4xl font-bold" style={{ color: "#1a2e28" }}>Wine Catalogue</h1>
          <div className="mt-2 h-0.5 w-16" style={{ background: "linear-gradient(90deg, #8b1a1a, transparent)" }} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a className="btn-secondary" href="/share" target="_blank" rel="noreferrer">
            <Share2 size={15} />Share view
          </a>
          <button className="btn-secondary" onClick={exportCsv}>
            <Download size={15} />Export CSV
          </button>
          <button className="btn-primary" onClick={() => router.push("/bottles/new")}>
            <Wine size={16} />Add bottle
          </button>
        </div>
      </section>

      {/* Filter panel */}
      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <label className="relative block">
            <span className="label">Search</span>
            <Search className="pointer-events-none absolute left-3 top-[2.15rem]" size={15} style={{ color: "#6a9080" }} />
            <input className="field mt-1.5 pl-9" placeholder="Producer, wine, notes…" value={filters.search} onChange={(e) => updateFilter("search", e.target.value)} />
          </label>
          <FilterInput label="Producer" value={filters.producer} onChange={(v) => updateFilter("producer", v)} />
          <FilterInput label="Grape" value={filters.grape} onChange={(v) => updateFilter("grape", v)} />
          <label className="block">
            <span className="label">Type</span>
            <select className="field mt-1.5" value={filters.type} onChange={(e) => updateFilter("type", e.target.value)}>
              <option value="">All types</option>
              {WINE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg p-1" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(80,160,130,0.2)" }}>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-150"
              style={{ color: viewMode === "all" ? "#1a2e28" : "#6a9080", background: viewMode === "all" ? "rgba(58,112,96,0.12)" : "transparent" }}
              onClick={() => changeViewMode("all")}
            >
              <Wine size={14} />All bottles
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors duration-150"
              style={{ color: viewMode === "grouped" ? "#1a2e28" : "#6a9080", background: viewMode === "grouped" ? "rgba(58,112,96,0.12)" : "transparent" }}
              onClick={() => changeViewMode("grouped")}
            >
              <Layers2 size={14} />Grouped by wine
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 text-sm transition-colors duration-150"
              style={{ color: showAdvanced ? "#3a7060" : "#6a9080" }}
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <SlidersHorizontal size={14} />
              Advanced filters
              <ChevronRight size={13} className={`transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`} />
            </button>
            {hasActiveFilters && (
              <button className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#ef4444" }} onClick={() => { setFilters(initialFilters); setPage(1); }}>
                <X size={12} />Clear filters
              </button>
            )}
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: "rgba(80,160,130,0.2)" }}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <FilterInput label="Vintage" value={filters.vintage} onChange={(v) => updateFilter("vintage", v)} />
              <FilterInput label="Region" value={filters.region} onChange={(v) => updateFilter("region", v)} />
              <FilterInput label="Rating" type="number" value={filters.rating} onChange={(v) => updateFilter("rating", v)} />
              <FilterInput label="Qty" type="number" value={filters.quantity} onChange={(v) => updateFilter("quantity", v)} />
              <FilterInput label="Window start" type="number" value={filters.windowStart} onChange={(v) => updateFilter("windowStart", v)} />
              <FilterInput label="Window end" type="number" value={filters.windowEnd} onChange={(v) => updateFilter("windowEnd", v)} />
              <FilterInput label="Others" value={filters.others} onChange={(v) => updateFilter("others", v)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              <FilterInput label="Halliday" type="number" value={filters.hallidayScore} onChange={(v) => updateFilter("hallidayScore", v)} />
              <FilterInput label="Hook" type="number" value={filters.hookScore} onChange={(v) => updateFilter("hookScore", v)} />
              <FilterInput label="RP" type="number" value={filters.rpScore} onChange={(v) => updateFilter("rpScore", v)} />
              <FilterInput label="Larkin" type="number" value={filters.larkinScore} onChange={(v) => updateFilter("larkinScore", v)} />
              <FilterInput label="My score" type="number" value={filters.myScore} onChange={(v) => updateFilter("myScore", v)} />
            </div>
          </div>
        )}
      </Card>

      {/* Toast */}
      {message && (
        <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium"
          style={{ background: "rgba(58,112,96,0.12)", border: "1px solid rgba(58,112,96,0.3)", color: "#1a4a3a" }}>
          {message}
        </div>
      )}

      {viewMode === "all" && selectedIds.length ? (
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="mr-auto">
              <span className="label">Bulk actions</span>
              <p className="mt-1 text-sm" style={{ color: "#1a2e28" }}>{selectedIds.length} selected</p>
            </div>
            <label className="block min-w-[180px]">
              <span className="label">Status</span>
              <select className="field mt-1.5" value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)}>
                <option value="">No change</option>
                {BOTTLE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="block min-w-[220px]">
              <span className="label">Storage location</span>
              <input className="field mt-1.5" value={bulkStorageLocation} placeholder="No change" onChange={(event) => setBulkStorageLocation(event.target.value)} />
            </label>
            <button className="btn-primary" disabled={bulkWorking} onClick={() => applyBulkAction()}>
              {bulkWorking ? "Working..." : "Apply"}
            </button>
            <button className="btn-secondary" disabled={bulkWorking} style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }} onClick={() => applyBulkAction("delete")}>
              <Trash2 size={15} />Delete
            </button>
          </div>
        </Card>
      ) : null}

      {/* Table card */}
      <Card overflow>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm" style={{ borderBottom: "1px solid rgba(80,160,130,0.2)" }}>
          <span style={{ color: "#4a7060" }}>
            {activeData
              ? <><span className="font-bold" style={{ color: "#1a2e28" }}>{activeData.total.toLocaleString()}</span> {viewMode === "grouped" ? "grouped wines" : "wines"}</>
              : "Loading…"}
          </span>
          {loading && (
            <span className="flex items-center gap-2 text-xs" style={{ color: "#6a9080" }}>
              <div className="h-3.5 w-3.5 rounded-full border border-t-transparent animate-spin" style={{ borderColor: "rgba(80,160,130,0.2)", borderTopColor: "#3a7060" }} />
              Refreshing
            </span>
          )}
        </div>

        {viewMode === "all" ? (
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full text-left text-sm wine-table">
            <thead>
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={allPageSelected} onChange={togglePageSelected} aria-label="Select all rows on this page" />
                </th>
                <th className="px-5 py-3">Photo</th>
                <Sortable label="Producer" field="producer" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <Sortable label="Wine name" field="wineName" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <Sortable label="Vintage" field="vintage" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <Sortable label="Type" field="type" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <Sortable label="Qty" field="quantity" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-3 py-3">Window</th>
                <Sortable label="Rating" field="personalRating" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Scores</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.length ? data.rows.map((b, i) => (
                <tr key={b.id} className="cursor-pointer" style={{ animationDelay: `${i * 30}ms` }} onClick={() => router.push(`/bottles/${b.id}`)}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(b.id)} onChange={() => toggleSelected(b.id)} aria-label={`Select ${b.producer} ${b.wineName}`} />
                  </td>
                  <td className="px-5 py-3"><Thumb url={b.photoUrl} /></td>
                  <td className="px-3 py-3 font-semibold" style={{ color: "#1a2e28" }}>{b.producer}</td>
                  <td className="px-3 py-3" style={{ color: "#4a7060" }}>{b.wineName}</td>
                  <td className="px-3 py-3" style={{ color: "#6a9080" }}>{b.vintage || "—"}</td>
                  <td className="px-3 py-3" style={{ color: "#4a7060" }}>{b.type}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: "rgba(139,26,26,0.12)", color: "#6b1212", border: "1px solid rgba(139,26,26,0.3)" }}>
                      {b.quantity}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs" style={{ color: "#6a9080" }}>{b.drinkingWindow}</td>
                  <td className="px-3 py-3">
                    {b.personalRating
                      ? <span className="font-bold" style={{ color: "#3a7060" }}>{b.personalRating}</span>
                      : <span style={{ color: "#8aaa9a" }}>—</span>}
                  </td>
                  <td className="px-3 py-3"><StatusChip status={b.drinkStatus} /></td>
                  <td className="px-3 py-3 text-xs" style={{ color: "#8aaa9a" }}>
                    <div>H {b.hallidayScore ?? "—"} · Hk {b.hookScore ?? "—"}</div>
                    <div>RP {b.rpScore ?? "—"} · L {b.larkinScore ?? "—"} · My {b.myScore ?? "—"}</div>
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-secondary whitespace-nowrap px-3 py-1.5 text-xs" disabled={b.quantity < 1} onClick={(e) => drinkOne(e, b.id)}>
                      Drink one
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={12} className="px-5 py-12 text-center text-sm" style={{ color: "#8aaa9a" }}>
                    No bottles match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
          <GroupedCatalogueTable rows={groupedData?.rows || []} onOpen={(id) => router.push(`/bottles/${id}`)} />
        )}

        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: "1px solid rgba(80,160,130,0.2)" }}>
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((c) => Math.max(c - 1, 1))}>
            <ChevronLeft size={15} />Previous
          </button>
          <span className="text-sm" style={{ color: "#6a9080" }}>
            Page <span className="font-semibold" style={{ color: "#1a2e28" }}>{activeData?.page ?? page}</span>
            {" "}of <span className="font-semibold" style={{ color: "#1a2e28" }}>{activeData?.pages ?? 1}</span>
          </span>
          <button className="btn-secondary" disabled={!activeData || page >= activeData.pages} onClick={() => setPage((c) => c + 1)}>
            Next<ChevronRight size={15} />
          </button>
        </div>
      </Card>
    </div>
  );
}

function GroupedCatalogueTable({ rows, onOpen }: { rows: GroupedBottleRow[]; onOpen: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[880px] w-full text-left text-sm wine-table">
        <thead>
          <tr>
            <th className="px-5 py-3">Producer</th>
            <th className="px-3 py-3">Wine name</th>
            <th className="px-3 py-3">Vintage</th>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Total qty</th>
            <th className="px-3 py-3">Location split</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={`${row.producer}-${row.wineName}-${row.vintage || "nv"}`}>
              <td className="px-5 py-4 font-semibold" style={{ color: "#1a2e28" }}>{row.producer}</td>
              <td className="px-3 py-4" style={{ color: "#4a7060" }}>{row.wineName}</td>
              <td className="px-3 py-4" style={{ color: "#6a9080" }}>{row.vintage || "-"}</td>
              <td className="px-3 py-4" style={{ color: "#4a7060" }}>{row.type}</td>
              <td className="px-3 py-4">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-bold"
                  style={{ background: "rgba(58,112,96,0.12)", color: "#1a2e28", border: "1px solid rgba(58,112,96,0.28)" }}>
                  {row.quantity}
                </span>
              </td>
              <td className="px-3 py-4">
                <div className="flex flex-wrap gap-2">
                  {row.locations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      className="rounded-lg px-3 py-2 text-left text-xs transition-colors duration-150 hover:bg-white/30"
                      style={{ color: "#1a2e28", border: "1px solid rgba(80,160,130,0.2)", background: "rgba(255,255,255,0.7)" }}
                      onClick={() => onOpen(location.id)}
                    >
                      <span className="block font-semibold">{location.storageLocation || "Unassigned"}</span>
                      <span style={{ color: "#6a9080" }}>{location.quantity} bottle{location.quantity === 1 ? "" : "s"}</span>
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: "#8aaa9a" }}>
                No grouped wines match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function FilterInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field mt-1.5" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Sortable({ label, field, sortBy, sortDir, onSort }: { label: string; field: string; sortBy: string; sortDir: "asc" | "desc"; onSort: (f: string) => void }) {
  const active = sortBy === field;
  return (
    <th className="px-3 py-3">
      <button className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide text-xs transition-colors duration-150"
        style={{ color: active ? "#3a7060" : "#4a8070" }} onClick={() => onSort(field)}>
        {label}
        {active && (sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
      </button>
    </th>
  );
}

function Thumb({ url }: { url: string | null }) {
  if (!url) return (
    <div className="flex h-14 w-11 items-center justify-center rounded-lg text-xs"
      style={{ background: "rgba(255,255,255,0.7)", color: "#8aaa9a", border: "1px solid rgba(80,160,130,0.2)" }}>—</div>
  );
  return <img src={url} alt="" className="h-14 w-11 rounded-lg object-cover" style={{ border: "1px solid rgba(80,160,130,0.2)" }} />;
}
