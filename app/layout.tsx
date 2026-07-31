import type { Metadata } from "next";
import Link from "next/link";
import { Wine, LayoutDashboard, Table2, Plus, Upload } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { NavLink } from "@/components/NavLink";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wine Cellar",
  description: "Single-user cellar management for a personal wine collection."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          {/* Header */}
          <header
            className="sticky top-0 z-50"
            style={{
              background: "rgba(232, 244, 240, 0.88)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(80, 160, 130, 0.18)",
            }}
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
              <Link href="/" className="group flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #8b1a1a 0%, #b22222 100%)",
                    boxShadow: "0 2px 8px rgba(139,26,26,0.30)"
                  }}
                >
                  <Wine size={20} className="text-white" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-base font-bold leading-tight" style={{ color: "#1a2e28" }}>
                    Wine Cellar
                  </span>
                  <span className="block text-[10px] font-medium tracking-widest uppercase" style={{ color: "#4a8070" }}>
                    Personal collection
                  </span>
                </span>
              </Link>

              <nav className="flex flex-wrap items-center gap-1">
                <NavLink href="/"            icon={<LayoutDashboard size={15} />} label="Dashboard" />
                <NavLink href="/catalogue"   icon={<Table2 size={15} />}          label="Catalogue" />
                <NavLink href="/bottles/new" icon={<Plus size={15} />}            label="Add" />
                <NavLink href="/import"      icon={<Upload size={15} />}          label="Import" />
                <div className="ml-1 h-5 w-px" style={{ background: "rgba(80,160,130,0.25)" }} />
                <LogoutButton />
              </nav>
            </div>

            {/* Thin teal divider */}
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
