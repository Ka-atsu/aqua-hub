// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ShoppingCart,
  Users,
  Boxes,
  LineChart,
  Settings,
  HelpCircle,
  ChevronDown,
  UploadCloud,
} from "lucide-react";

interface SidebarProps {
  onOpenUpload: () => void;
}

export default function Sidebar({ onOpenUpload }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-ink-dark/10 flex flex-col justify-between md:flex h-screen sticky top-0 z-10 shadow-ink-sm">
      <div>
        {/* User Profile Card */}
        <div className="p-4 mb-6">
          <button className="w-full p-3 border border-ink-dark/10 rounded-xl flex items-center justify-between bg-ink-base hover:bg-ink-dark/5 shadow-ink-sm transition-all focus:outline-none focus:ring-2 focus:ring-ink-accent focus:border-transparent group">
            <div className="flex items-center gap-3">
              <img
                src="/api/placeholder/32/32"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover bg-white shadow-sm"
              />
              <div className="text-left">
                <p className="text-sm font-bold text-ink-black group-hover:text-ink-accent transition-colors">
                  Manager
                </p>
                <p className="text-[10px] text-ink-muted">aquahub@gmail.com</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-ink-muted" />
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="px-4 space-y-6">
          <div>
            <p className="px-4 text-[11px] font-bold text-ink-muted tracking-widest mb-3 uppercase">
              Main
            </p>
            <div className="space-y-1">
              <Link
                href="/"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === "/"
                    ? "bg-ink-accent/10 text-ink-black font-bold relative"
                    : "text-ink-muted font-semibold hover:bg-ink-base hover:text-ink-black"
                }`}
              >
                {pathname === "/" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-ink-accent rounded-r-full"></div>
                )}
                <LayoutGrid
                  className={`w-4 h-4 ${pathname === "/" ? "text-ink-accent" : "text-ink-dark/70"}`}
                  strokeWidth={2.5}
                />
                Overview
              </Link>
              <Link
                href="/analytics"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === "/analytics"
                    ? "bg-ink-accent/10 text-ink-black font-bold relative"
                    : "text-ink-muted font-semibold hover:bg-ink-base hover:text-ink-black"
                }`}
              >
                {pathname === "/analytics" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-ink-accent rounded-r-full"></div>
                )}
                <LineChart
                  className={`w-4 h-4 ${pathname === "/analytics" ? "text-ink-accent" : "text-ink-dark/70"}`}
                  strokeWidth={2.5}
                />
                Analytics
              </Link>
            </div>
          </div>

          <div>
            <p className="px-4 text-[11px] font-bold text-ink-muted tracking-widest mb-3 uppercase">
              Operations
            </p>
            <div className="space-y-1">
              <Link
                href="/transactions"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === "/transactions"
                    ? "bg-ink-accent/10 text-ink-black font-bold relative"
                    : "text-ink-muted font-semibold hover:bg-ink-base hover:text-ink-black"
                }`}
              >
                {pathname === "/transactions" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-ink-accent rounded-r-full"></div>
                )}
                <ShoppingCart
                  className={`w-4 h-4 ${pathname === "/transactions" ? "text-ink-accent" : "text-ink-dark/70"}`}
                  strokeWidth={2.5}
                />
                Transactions
              </Link>

              <Link
                href="/containers"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === "/containers"
                    ? "bg-ink-accent/10 text-ink-black font-bold relative"
                    : "text-ink-muted font-semibold hover:bg-ink-base hover:text-ink-black"
                }`}
              >
                {pathname === "/containers" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-ink-accent rounded-r-full"></div>
                )}
                <Boxes
                  className={`w-4 h-4 ${pathname === "/containers" ? "text-ink-accent" : "text-ink-dark/70"}`}
                  strokeWidth={2.5}
                />
                Containers
              </Link>

              <button
                onClick={onOpenUpload}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-ink-muted hover:bg-ink-base hover:text-ink-black rounded-lg font-semibold transition-colors text-sm text-left group"
              >
                <UploadCloud
                  className="w-4 h-4 text-ink-dark/70 group-hover:text-ink-accent transition-colors"
                  strokeWidth={2.5}
                />
                Logbook Uploader
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div className="p-4 space-y-1">
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-ink-muted hover:bg-ink-base hover:text-ink-black rounded-lg font-semibold text-sm transition-colors group">
          <Settings
            className="w-4 h-4 text-ink-dark/70 group-hover:text-ink-accent transition-colors"
            strokeWidth={2.5}
          />
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-ink-muted hover:bg-ink-base hover:text-ink-black rounded-lg font-semibold text-sm mb-4 transition-colors group">
          <HelpCircle
            className="w-4 h-4 text-ink-dark/70 group-hover:text-ink-accent transition-colors"
            strokeWidth={2.5}
          />
          Help
        </button>
      </div>
    </aside>
  );
}
