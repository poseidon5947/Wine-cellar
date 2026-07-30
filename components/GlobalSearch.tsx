"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = query.trim();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    router.push(params.size ? `/catalogue?${params.toString()}` : "/catalogue");
  }

  return (
    <form onSubmit={onSubmit} className="min-w-[180px] flex-1 sm:max-w-xs lg:max-w-sm">
      <label className="relative block">
        <span className="sr-only">Search catalogue</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: "#8a7080" }} />
        <input
          className="field h-10 w-full pl-9 pr-10 text-sm"
          value={query}
          placeholder="Search cellar"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          type="submit"
          aria-label="Search catalogue"
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center transition-colors hover:text-[#d4af37]"
          style={{ color: "#9a7c22" }}
        >
          <Search size={15} aria-hidden="true" />
        </button>
      </label>
    </form>
  );
}
