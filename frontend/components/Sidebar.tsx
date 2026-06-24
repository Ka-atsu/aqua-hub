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

// Idagdag ang prop na ito para makontrol ang floating modal mula sa labas
interface SidebarProps {
  onOpenUpload: () => void;
}

export default function Sidebar({ onOpenUpload }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between md:flex h-screen sticky top-0">
      <div>
        {/* User Profile Card */}
        <div className="p-4 mb-6">
          <button className="w-full p-3 border border-gray-100 rounded-xl flex items-center justify-between bg-white hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#00D084] focus:border-transparent group">
            <div className="flex items-center gap-3">
              <img
                src="/api/placeholder/32/32"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover bg-gray-100"
              />
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 group-hover:text-[#0A4C5A]">
                  Manager
                </p>
                <p className="text-[10px] text-gray-400">aquahub@gmail.com</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="px-4 space-y-6">
          <div>
            <p className="px-4 text-[11px] font-bold text-gray-400 tracking-widest mb-3 uppercase">
              Main
            </p>
            <div className="space-y-1">
              <Link
                href="/"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${pathname === "/" ? "bg-teal-50/50 text-[#0A4C5A] font-bold relative" : "text-gray-500 font-semibold hover:bg-gray-50"}`}
              >
                {pathname === "/" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#00D084] rounded-r-full"></div>
                )}
                <LayoutGrid
                  className="w-4 h-4 text-[#00D084]"
                  strokeWidth={2.5}
                />
                Overview
              </Link>
              <Link
                href="/analytics"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${pathname === "/analytics" ? "bg-teal-50/50 text-[#0A4C5A] font-bold relative" : "text-gray-500 font-semibold hover:bg-gray-50"}`}
              >
                {pathname === "/analytics" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#00D084] rounded-r-full"></div>
                )}
                <LineChart
                  className="w-4 h-4 text-[#00D084]"
                  strokeWidth={2.5}
                />
                Analytics
              </Link>
            </div>
          </div>

          <div>
            <p className="px-4 text-[11px] font-bold text-gray-400 tracking-widest mb-3 uppercase">
              Operations
            </p>
            <div className="space-y-1">
              <button
                onClick={onOpenUpload}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-[#0A4C5A] rounded-lg font-semibold transition-colors text-sm text-left"
              >
                <UploadCloud
                  className="w-4 h-4 text-emerald-500"
                  strokeWidth={2.5}
                />
                Logbook Uploader
              </button>
            </div>
          </div>
        </nav>
      </div>

      <div className="p-4 space-y-1">
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-500 hover:bg-gray-50 rounded-lg font-semibold text-sm">
          <Settings className="w-4 h-4" strokeWidth={2.5} />
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-500 hover:bg-gray-50 rounded-lg font-semibold text-sm mb-4">
          <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
          Help
        </button>
      </div>
    </aside>
  );
}
