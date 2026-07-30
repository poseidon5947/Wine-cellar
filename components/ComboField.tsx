"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { COMMON_GRAPE_VARIETIES } from "@/lib/constants";

type SuggestionField = "producer" | "wineName" | "grapes" | "region" | "storageLocation";

type ComboFieldProps = {
  field: SuggestionField;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
};

const suggestionCache = new Map<SuggestionField, string[]>();

const defaultSuggestions: Record<SuggestionField, string[]> = {
  producer: [],
  wineName: [],
  grapes: [...COMMON_GRAPE_VARIETIES],
  region: [
    "Barossa Valley",
    "Bordeaux",
    "Burgundy",
    "Champagne",
    "Clare Valley",
    "Coonawarra",
    "Hunter Valley",
    "Margaret River",
    "McLaren Vale",
    "Mornington Peninsula",
    "Yarra Valley"
  ],
  storageLocation: ["Cellar", "Wine fridge", "Rack A", "Rack B", "Rack C"]
};

function mergeSuggestions(field: SuggestionField, values: string[]) {
  const merged = new Map<string, string>();
  [...values, ...defaultSuggestions[field]].forEach((suggestion) => {
    const key = suggestion.trim().toLowerCase();
    if (key && !merged.has(key)) merged.set(key, suggestion.trim());
  });
  return Array.from(merged.values());
}

export function ComboField({ field, label, value, onChange, required, placeholder }: ComboFieldProps) {
  const [suggestions, setSuggestions] = useState<string[]>(() => suggestionCache.get(field) || []);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(!suggestionCache.has(field));
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (suggestionCache.has(field)) {
      setSuggestions(suggestionCache.get(field) || []);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(`/api/suggestions?field=${field}`, { cache: "force-cache" })
      .then((response) => response.json())
      .then((body) => {
        const values = Array.isArray(body.values) ? body.values.filter((item: unknown) => typeof item === "string") : [];
        const merged = mergeSuggestions(field, values);
        suggestionCache.set(field, merged);
        if (!cancelled) setSuggestions(merged);
      })
      .catch(() => {
        if (!cancelled) setSuggestions(defaultSuggestions[field]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [field]);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    const matches = query
      ? suggestions.filter((suggestion) => suggestion.toLowerCase().includes(query))
      : suggestions;

    return matches.filter((suggestion) => suggestion !== value).slice(0, field === "storageLocation" ? 8 : 10);
  }, [field, suggestions, value]);

  function closeSoon() {
    blurTimer.current = setTimeout(() => setOpen(false), 120);
  }

  function cancelClose() {
    if (blurTimer.current) clearTimeout(blurTimer.current);
  }

  return (
    <label className="relative block">
      <span className="label">{label}</span>
      <span className="relative mt-1.5 block">
        <input
          className="field pr-11"
          value={value}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={closeSoon}
        />
        <button
          type="button"
          aria-label={`Show ${label.toLowerCase()} options`}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center transition-colors hover:text-[#d4af37]"
          style={{ color: "#d4af37" }}
          onMouseDown={(event) => {
            event.preventDefault();
            cancelClose();
          }}
          onClick={() => setOpen((current) => !current)}
        >
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </span>
      {open ? (
        <div
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg shadow-xl"
          style={{
            background: "#1c1719",
            border: "1px solid rgba(212,175,55,0.22)"
          }}
          onMouseDown={cancelClose}
        >
          {loading ? (
            <div className="px-3 py-2 text-sm" style={{ color: "#8a7080" }}>Loading suggestions...</div>
          ) : filtered.length ? (
            filtered.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
                style={{ color: "#f5f0e8" }}
                onClick={() => {
                  onChange(suggestion);
                  setOpen(false);
                }}
              >
                {suggestion}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm" style={{ color: "#8a7080" }}>No saved options yet</div>
          )}
        </div>
      ) : null}
    </label>
  );
}
