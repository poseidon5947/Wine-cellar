"use client";

import Papa from "papaparse";
import { useState } from "react";
import { CheckCircle2, FileSpreadsheet, Upload, AlertCircle } from "lucide-react";
import { BOTTLE_SIZES, BOTTLE_STATUSES, WINE_TYPES } from "@/lib/constants";
import { Card } from "@/components/Card";

const bottleFields = [
  "photoUrl", "producer", "wineName", "vintage", "type", "grapes",
  "region", "country", "alcoholPercent", "bottleSize", "quantity",
  "storageLocation", "purchaseDate", "purchasePrice",
  "drinkingWindowStart", "drinkingWindowEnd", "status", "personalRating",
  "notes", "myNotes", "hookScore", "hallidayScore", "rpScore", "larkinScore", "myScore", "others"
] as const;

type BottleField = (typeof bottleFields)[number];

export function ImportClient() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  const previewRows = rows.slice(0, 5);
  const requiredMapped = Boolean(mapping.producer && mapping.wineName);

  function parseFile(file: File) {
    setMessage("");
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const nextRows = result.data.filter((row) => Object.values(row).some((v) => String(v ?? "").trim()));
        const nextHeaders = result.meta.fields || [];
        setHeaders(nextHeaders);
        setRows(nextRows);
        setMapping((c) => ({ ...suggestMappings(nextHeaders), ...c }));
      },
      error: (e) => { setMessage(e.message); setMessageType("error"); }
    });
  }

  async function importRows() {
    setLoading(true);
    setMessage("");
    const r = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, mapping })
    });
    const body = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) { setMessage(body.error || "Unable to import CSV."); setMessageType("error"); return; }
    setMessage(`Successfully imported ${body.imported} bottle records.`);
    setMessageType("success");
  }

  function update(field: BottleField, column: string) {
    setMapping((c) => ({ ...c, [field]: column }));
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label">Data import</span>
          <h1 className="mt-1 font-display text-4xl font-bold" style={{ color: "#1a2e28" }}>CSV Import</h1>
          <div className="mt-2 h-0.5 w-16" style={{ background: "linear-gradient(90deg, #8b1a1a, transparent)" }} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* File drop + accepted values */}
        <div className="space-y-4">
          <label
            className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl p-6 text-center transition-all duration-200 photo-drop"
            onDragOver={(e) => e.preventDefault()}
          >
            <FileSpreadsheet size={44} style={{ color: rows.length ? "#3a7060" : "#8aaa9a" }} />
            <span className="mt-3 block text-sm font-semibold" style={{ color: "#1a2e28" }}>
              {rows.length ? `${rows.length} rows loaded` : "Choose CSV from Google Sheets"}
            </span>
            <span className="mt-1 block text-xs" style={{ color: "#6a9080" }}>
              {rows.length ? `${headers.length} columns detected` : "Header row required"}
            </span>
            <input className="sr-only" type="file" accept=".csv,text/csv"
              onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])} />
          </label>

          <Card className="p-4 text-sm space-y-3">
            <p className="font-semibold" style={{ color: "#3a7060" }}>Accepted values</p>
            <div>
              <span className="label">Type</span>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#4a7060" }}>{WINE_TYPES.join(", ")}</p>
            </div>
            <div>
              <span className="label">Size</span>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#4a7060" }}>{BOTTLE_SIZES.join(", ")}</p>
            </div>
            <div>
              <span className="label">Status</span>
              <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#4a7060" }}>{BOTTLE_STATUSES.join(", ")}</p>
            </div>
          </Card>
        </div>

        {/* Column mapping */}
        <Card className="p-5">
          {!headers.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileSpreadsheet size={48} style={{ color: "#8aaa9a" }} />
              <p className="mt-3 text-sm" style={{ color: "#8aaa9a" }}>Upload a CSV file to begin mapping columns</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold" style={{ color: "#3a7060" }}>Column mapping</h2>
                <p className="mt-0.5 text-xs" style={{ color: "#6a9080" }}>Map your spreadsheet columns to bottle fields</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {bottleFields.map((field) => (
                  <label key={field} className="block">
                    <span className="label">{labelFor(field)}</span>
                    <select className="field mt-1.5" value={mapping[field] || ""} onChange={(e) => update(field, e.target.value)}>
                      <option value="">Do not import</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4" style={{ borderTop: "1px solid rgba(80,160,130,0.2)" }}>
                <p className="text-sm" style={{ color: requiredMapped ? "#15803d" : "#6a9080" }}>
                  {requiredMapped ? "✓ Ready to import" : "Producer and wine name must be mapped"}
                </p>
                <button className="btn-primary" disabled={!requiredMapped || loading} onClick={importRows}>
                  <Upload size={15} />{loading ? "Importing…" : "Import rows"}
                </button>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Status message */}
      {message && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: messageType === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${messageType === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: messageType === "success" ? "#15803d" : "#b91c1c"
          }}>
          {messageType === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message}
        </div>
      )}

      {/* Preview table */}
      {previewRows.length > 0 && (
        <Card overflow>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(80,160,130,0.2)" }}>
            <h2 className="font-semibold" style={{ color: "#1a2e28" }}>CSV preview</h2>
            <p className="mt-0.5 text-xs" style={{ color: "#6a9080" }}>First {previewRows.length} rows</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm wine-table">
              <thead>
                <tr>{headers.map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}</tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    {headers.map((h) => (
                      <td key={h} className="max-w-[200px] truncate px-3 py-2.5" style={{ color: "#4a7060" }}>
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function normalize(v: string) { return v.toLowerCase().replace(/[^a-z0-9]/g, ""); }

function suggestMappings(headers: string[]) {
  const result: Record<string, string> = {};
  for (const field of bottleFields) {
    const found = headers.find((h) => normalize(h) === normalize(field) || normalize(h).includes(normalize(field)));
    if (found) result[field] = found;
  }
  return result;
}

function labelFor(field: string) {
  if (field === "rpScore") return "Wine Front";
  return field.replace(/([A-Z])/g, " $1").replace(/^./, (l) => l.toUpperCase());
}
