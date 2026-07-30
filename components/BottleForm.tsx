"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Printer, Save, Trash2, UploadCloud, Wine, Star, Award, X } from "lucide-react";
import { BOTTLE_SIZES, BOTTLE_STATUSES, COUNTRIES, STORAGE_LOCATIONS, WINE_TYPES } from "@/lib/constants";
import { StatusChip } from "@/components/StatusChip";
import { Card } from "@/components/Card";
import { ComboField } from "@/components/ComboField";
import type { DrinkStatus } from "@/lib/drink-status";

type FormState = {
  photoUrl: string; producer: string; wineName: string; vintage: string;
  type: string; grapes: string; region: string; country: string;
  alcoholPercent: string; bottleSize: string; quantity: string;
  storageLocation: string; purchaseDate: string; purchasePrice: string;
  drinkingWindowStart: string; drinkingWindowEnd: string; status: string;
  personalRating: string; notes: string; myNotes: string; hallidayScore: string;
  hookScore: string; rpScore: string; larkinScore: string; myScore: string; others: string;
};

type ConsumptionLog = { id: string; date: string; quantity: number; note: string | null };
type BottlePhoto = { id: string; url: string; position: number; createdAt: string };

type LoadedBottle = FormState & {
  id: string; drinkStatus: DrinkStatus; consumptionLogs?: ConsumptionLog[]; photos?: BottlePhoto[];
};

const initialForm: FormState = {
  photoUrl: "", producer: "", wineName: "", vintage: "", type: "Red",
  grapes: "", region: "", country: "Australia", alcoholPercent: "",
  bottleSize: "750ml", quantity: "0", storageLocation: "", purchaseDate: "",
  purchasePrice: "", drinkingWindowStart: "", drinkingWindowEnd: "",
  status: "In Cellar", personalRating: "", notes: "", myNotes: "", hallidayScore: "",
  hookScore: "", rpScore: "", larkinScore: "", myScore: "", others: ""
};

export function BottleForm({ mode, bottleId }: { mode: "create" | "edit"; bottleId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [loaded, setLoaded] = useState<LoadedBottle | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [extraPhotos, setExtraPhotos] = useState<BottlePhoto[]>([]);
  const [activePhotoUrl, setActivePhotoUrl] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !bottleId) return;
    fetch(`/api/bottles/${bottleId}`)
      .then((r) => r.json())
      .then((b) => {
        if (b.error) throw new Error(b.error);
        const n = fromApi(b);
        const photos = Array.isArray(b.photos) ? b.photos : [];
        setLoaded({ ...n, id: b.id, drinkStatus: b.drinkStatus, consumptionLogs: b.consumptionLogs, photos });
        setExtraPhotos(photos);
        setActivePhotoUrl("");
        setForm(n);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load bottle."))
      .finally(() => setLoading(false));
  }, [bottleId, mode]);

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const photoPreview = activePhotoUrl || preview || form.photoUrl;
  const storageLocationOptions = useMemo(() => {
    const current = form.storageLocation;
    if (current && !isStorageLocation(current)) return [current, "", ...STORAGE_LOCATIONS];
    return ["", ...STORAGE_LOCATIONS];
  }, [form.storageLocation]);
  const storageLocationLabels = useMemo(() => {
    const current = form.storageLocation;
    return current && !isStorageLocation(current)
      ? { "": "Unassigned", [current]: `(unassigned) ${current}` }
      : { "": "Unassigned" };
  }, [form.storageLocation]);

  const payload = useMemo(() => ({
    ...form,
    alcoholPercent: n(form.alcoholPercent),
    quantity: Number(form.quantity || 0),
    purchasePrice: n(form.purchasePrice),
    drinkingWindowStart: n(form.drinkingWindowStart),
    drinkingWindowEnd: n(form.drinkingWindowEnd),
    personalRating: n(form.personalRating),
    hallidayScore: n(form.hallidayScore),
    hookScore: n(form.hookScore),
    rpScore: n(form.rpScore),
    larkinScore: n(form.larkinScore),
    myScore: n(form.myScore),
  }), [form]);

  function update(key: keyof FormState, value: string) {
    setForm((c) => ({ ...c, [key]: value }));
  }

  async function uploadSelectedFile() {
    if (!file) return form.photoUrl;
    const body = new FormData();
    body.set("file", file);
    const r = await fetch("/api/upload", { method: "POST", body });
    const res = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(res.error || "Unable to upload image.");
    return res.url as string;
  }

  async function uploadAdditionalPhotos(files: FileList | null) {
    if (!bottleId || !files?.length) return;
    setPhotoUploading(true);
    setError("");
    try {
      const uploaded: BottlePhoto[] = [];
      for (const image of Array.from(files)) {
        const body = new FormData();
        body.set("file", image);
        const uploadResponse = await fetch("/api/upload", { method: "POST", body });
        const uploadBody = await uploadResponse.json().catch(() => ({}));
        if (!uploadResponse.ok) throw new Error(uploadBody.error || "Unable to upload image.");

        const photoResponse = await fetch(`/api/bottles/${bottleId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: uploadBody.url })
        });
        const photoBody = await photoResponse.json().catch(() => ({}));
        if (!photoResponse.ok) throw new Error(photoBody.error || "Unable to add photo.");
        uploaded.push(photoBody);
      }
      setExtraPhotos((current) => [...current, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to upload photos.");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function removeAdditionalPhoto(photo: BottlePhoto) {
    if (!bottleId || !window.confirm("Remove this photo?")) return;
    setPhotoUploading(true);
    setError("");
    try {
      const response = await fetch(`/api/bottles/${bottleId}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId: photo.id })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Unable to remove photo.");
      setExtraPhotos((current) => current.filter((item) => item.id !== photo.id));
      if (activePhotoUrl === photo.url) setActivePhotoUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to remove photo.");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const photoUrl = await uploadSelectedFile();
      const r = await fetch(
        mode === "edit" ? `/api/bottles/${bottleId}` : "/api/bottles",
        { method: mode === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, photoUrl }) }
      );
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body.error || "Unable to save bottle.");
      router.push("/catalogue");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save bottle.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!bottleId || !window.confirm("Delete this bottle record?")) return;
    setSaving(true);
    await fetch(`/api/bottles/${bottleId}`, { method: "DELETE" });
    router.push("/catalogue");
    router.refresh();
  }

  function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "rgba(139,26,26,0.3)", borderTopColor: "#8b1a1a" }} />
          <p className="text-sm" style={{ color: "#8a7080" }}>Loading bottle…</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-slide-up">
      {/* Header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="label">{mode === "edit" ? "Edit bottle" : "Add bottle"}</span>
          <h1 className="mt-1 font-display text-4xl font-bold" style={{ color: "#f5f0e8" }}>
            {mode === "edit" ? form.wineName || "Bottle details" : "New cellar entry"}
          </h1>
          <div className="mt-2 h-0.5 w-16" style={{ background: "linear-gradient(90deg, #8b1a1a, transparent)" }} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {loaded && <StatusChip status={loaded.drinkStatus} />}
          {mode === "edit" && (
            <>
              <a className="btn-secondary" href={`/bottles/${bottleId}/label`} target="_blank" rel="noreferrer">
                <Printer size={15} />Print label
              </a>
              <button type="button" className="btn-secondary" style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }} onClick={onDelete} disabled={saving}>
                <Trash2 size={15} />Delete
              </button>
            </>
          )}
          <button className="btn-primary" disabled={saving}>
            <Save size={15} />{saving ? "Saving…" : "Save bottle"}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      {/* Main grid */}
      <section className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Photo upload */}
        <div className="space-y-4">
          <label
            className="flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl p-4 text-center transition-all duration-200 photo-drop"
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Wine label preview"
                className="max-h-[280px] w-auto rounded-lg object-contain"
                style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }} />
            ) : (
              <span className="flex flex-col items-center gap-3" style={{ color: "#5a4550" }}>
                <ImagePlus size={40} />
                <span>
                  <span className="block text-sm font-semibold" style={{ color: "#b09aa8" }}>Drop label photo</span>
                  <span className="block text-xs mt-0.5">or click to choose file</span>
                </span>
              </span>
            )}
            <input className="sr-only" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <label className="block">
            <span className="label">Photo URL</span>
            <input className="field mt-1.5" value={form.photoUrl} onChange={(e) => update("photoUrl", e.target.value)} placeholder="https://…" />
          </label>
          {file && (
            <p className="flex items-center gap-2 text-sm" style={{ color: "#b09aa8" }}>
              <UploadCloud size={15} />{file.name}
            </p>
          )}
          {mode === "edit" ? (
            <div className="space-y-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between gap-3">
                <span className="label">Additional photos</span>
                <label className="btn-secondary cursor-pointer">
                  <ImagePlus size={15} />{photoUploading ? "Uploading..." : "Add"}
                  <input className="sr-only" type="file" accept="image/*" multiple disabled={photoUploading} onChange={(e) => uploadAdditionalPhotos(e.target.files)} />
                </label>
              </div>
              {extraPhotos.length ? (
                <div className="grid grid-cols-4 gap-2">
                  {extraPhotos.map((photo) => (
                    <div key={photo.id} className="group relative">
                      <button type="button" className="block w-full" onClick={() => setActivePhotoUrl(photo.url)} aria-label="Preview photo">
                        <img src={photo.url} alt="" className="aspect-[3/4] w-full rounded-lg object-cover" style={{ border: activePhotoUrl === photo.url ? "1px solid #d4af37" : "1px solid rgba(255,255,255,0.08)" }} />
                      </button>
                      <button type="button" className="absolute right-1 top-1 rounded-full p-1 opacity-90 transition-opacity hover:opacity-100" style={{ background: "rgba(20,12,13,0.88)", color: "#f5f0e8" }} onClick={() => removeAdditionalPhoto(photo)} aria-label="Remove photo">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs" style={{ color: "#8a7080" }}>Add side labels, back labels, or receipt photos after saving this bottle.</p>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: "#8a7080" }}>Additional photos can be added after saving.</p>
          )}
        </div>

        {/* Detail sections */}
        <div className="space-y-5">
          <Card className="p-5">
            <SectionTitle icon={<Wine size={16} />} title="Wine details" />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ComboField field="producer" label="Producer" value={form.producer} onChange={(v) => update("producer", v)} required />
              <ComboField field="wineName" label="Wine name" value={form.wineName} onChange={(v) => update("wineName", v)} required />
              <Field label="Vintage" value={form.vintage} onChange={(v) => update("vintage", v)} placeholder="2021 or NV" />
              <SelectField label="Type" value={form.type} onChange={(v) => update("type", v)} options={WINE_TYPES} />
              <ComboField field="grapes" label="Grapes" value={form.grapes} onChange={(v) => update("grapes", v)} />
              <ComboField field="region" label="Region" value={form.region} onChange={(v) => update("region", v)} />
              <SelectField label="Country" value={form.country} onChange={(v) => update("country", v)} options={COUNTRIES} />
              <Field label="Alcohol %" type="number" step="0.1" value={form.alcoholPercent} onChange={(v) => update("alcoholPercent", v)} />
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle icon={<Star size={16} />} title="Cellar & purchase" />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SelectField label="Bottle size" value={form.bottleSize} onChange={(v) => update("bottleSize", v)} options={BOTTLE_SIZES} />
              <Field label="Quantity" type="number" min="0" value={form.quantity} onChange={(v) => update("quantity", v)} required />
              <SelectField label="Storage location" value={form.storageLocation} onChange={(v) => update("storageLocation", v)} options={storageLocationOptions} optionLabels={storageLocationLabels} />
              <Field label="Purchase date" type="date" value={form.purchaseDate} onChange={(v) => update("purchaseDate", v)} />
              <Field label="Purchase price" type="number" step="0.01" value={form.purchasePrice} onChange={(v) => update("purchasePrice", v)} />
              <SelectField label="Status" value={form.status} onChange={(v) => update("status", v)} options={BOTTLE_STATUSES} />
              <Field label="Window start" type="number" value={form.drinkingWindowStart} onChange={(v) => update("drinkingWindowStart", v)} />
              <Field label="Window end" type="number" value={form.drinkingWindowEnd} onChange={(v) => update("drinkingWindowEnd", v)} />
              <Field label="Personal rating" type="number" min="1" max="5" value={form.personalRating} onChange={(v) => update("personalRating", v)} />
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle icon={<Award size={16} />} title="Critic scores" />
            <div className="mt-4 grid gap-4 sm:grid-cols-5">
              <Field label="Halliday" type="number" value={form.hallidayScore} onChange={(v) => update("hallidayScore", v)} />
              <Field label="Hook" type="number" value={form.hookScore} onChange={(v) => update("hookScore", v)} />
              <Field label="RP" type="number" value={form.rpScore} onChange={(v) => update("rpScore", v)} />
              <Field label="Larkin" type="number" value={form.larkinScore} onChange={(v) => update("larkinScore", v)} />
              <Field label="My score" type="number" value={form.myScore} onChange={(v) => update("myScore", v)} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Others" value={form.others} onChange={(v) => update("others", v)} placeholder="Wine Spectator 97" />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="label">Critic Review</span>
                <textarea className="field mt-1.5 min-h-[180px]" value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Paste the critic review text here..." />
              </label>
              <label className="block">
                <span className="label">My Notes</span>
                <textarea className="field mt-1.5 min-h-[180px]" value={form.myNotes}
                  onChange={(e) => update("myNotes", e.target.value)}
                  placeholder="Your own tasting notes, food pairings, occasions..." />
              </label>
            </div>
          </Card>
        </div>
      </section>

      {/* Consumption history */}
      {loaded?.consumptionLogs?.length ? (
        <Card overflow>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="font-semibold" style={{ color: "#f5f0e8" }}>Bottle history</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm wine-table">
              <thead>
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {loaded.consumptionLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-3">{new Date(log.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3">{log.quantity}</td>
                    <td className="px-5 py-3" style={{ color: "#8a7080" }}>{log.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </form>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span style={{ color: "#9a7c22" }}>{icon}</span>
      <span className="section-title-text font-semibold transition-all duration-300" style={{ color: "#d4af37" }}>{title}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.12)" }} />
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, min, max, step, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; min?: string; max?: string; step?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field mt-1.5" type={type} value={value} required={required}
        min={min} max={max} step={step} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function SelectField<T extends readonly string[]>({ label, value, onChange, options, optionLabels }: {
  label: string; value: string; onChange: (v: string) => void; options: T; optionLabels?: Record<string, string>;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="field mt-1.5" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o || "__empty"} value={o}>{optionLabels?.[o] || o}</option>)}
      </select>
    </label>
  );
}

function isStorageLocation(value: string) {
  return STORAGE_LOCATIONS.includes(value as (typeof STORAGE_LOCATIONS)[number]);
}

function s(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

function n(value: string) {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function fromApi(b: Record<string, unknown>): FormState {
  return {
    photoUrl: s(b.photoUrl), producer: s(b.producer), wineName: s(b.wineName),
    vintage: s(b.vintage), type: s(b.type) || "Red", grapes: s(b.grapes),
    region: s(b.region), country: s(b.country) || "Australia",
    alcoholPercent: s(b.alcoholPercent), bottleSize: s(b.bottleSize) || "750ml",
    quantity: s(b.quantity) || "0", storageLocation: s(b.storageLocation),
    purchaseDate: b.purchaseDate ? String(b.purchaseDate).slice(0, 10) : "",
    purchasePrice: s(b.purchasePrice), drinkingWindowStart: s(b.drinkingWindowStart),
    drinkingWindowEnd: s(b.drinkingWindowEnd), status: s(b.status) || "In Cellar",
    personalRating: s(b.personalRating), notes: s(b.notes), myNotes: s(b.myNotes),
    hallidayScore: s(b.hallidayScore), hookScore: s(b.hookScore),
    rpScore: s(b.rpScore), larkinScore: s(b.larkinScore),
    myScore: s(b.myScore), others: s(b.others),
  };
}
