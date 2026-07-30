import type { Metadata } from "next";
import Link from "next/link";
import { Wine, History, LayoutDashboard, Table2, Plus, Upload } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NavLink } from "@/components/NavLink";
import { WineBubbles } from "@/components/WineBubbles";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wine Cellar",
  description: "Single-user cellar management for a personal wine collection.",
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#140c0d" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body>
        {/* Ambient background orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Animated rising bubbles */}
        <WineBubbles />

        {/* Subtle noise / grain overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px"
          }}
        />

        <div className="relative z-10 min-h-screen" style={{ background: "transparent" }}>
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl" style={{ background: "rgba(13,10,11,0.85)" }}>
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
              <Link href="/" className="group flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #8b1a1a 0%, #b22222 100%)",
                    boxShadow: "0 4px 15px rgba(139,26,26,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"
                  }}
                >
                  <Wine size={22} className="text-white" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-lg font-bold text-ink leading-tight">Wine Cellar</span>
                  <span className="block text-[11px] font-medium tracking-widest uppercase" style={{ color: "#9a7c22" }}>
                    Personal collection
                  </span>
                </span>
              </Link>

              <GlobalSearch />

              <nav className="flex flex-wrap items-center gap-1.5">
                <NavLink href="/" icon={<LayoutDashboard size={15} />} label="Dashboard" />
                <NavLink href="/catalogue" icon={<Table2 size={15} />} label="Catalogue" />
                <NavLink href="/history" icon={<History size={15} />} label="History" />
                <NavLink href="/bottles/new" icon={<Plus size={15} />} label="Add" />
                <NavLink href="/import" icon={<Upload size={15} />} label="Import" />
                <div className="ml-1 h-6 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                <LogoutButton />
              </nav>
            </div>

            {/* Gold bottom line */}
            <div className="gold-divider" />
          </header>

          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
