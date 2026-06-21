import Link from "next/link";
import {
  LayoutGrid,
  ShoppingCart,
  Users,
  Boxes,
  LineChart,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-col justify-between hidden md:flex h-screen sticky top-0">
      {/* TOP SECTION: Logo, Profile, and Navigation */}
      <div>
        {/* User Profile Card (Clickable Dropdown Trigger) */}
        <div className="p-4 mb-6">
          <button className="w-full p-3 border border-gray-100 rounded-xl flex items-center justify-between bg-white hover:bg-gray-50 shadow-sm cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#00D084] focus:border-transparent group">
            <div className="flex items-center gap-3">
              <img
                src="/api/placeholder/32/32"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover bg-gray-100"
              />
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 group-hover:text-[#0A4C5A] transition-colors">
                  Manager
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  aquahub@gmail.com
                </p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#0A4C5A] transition-colors" />
          </button>
        </div>

        {/* Navigation Links - Grouped by Relativity */}
        <nav className="px-4 space-y-6">
          {/* GROUP 1: MAIN VIEWS */}
          <div>
            <p className="px-4 text-[11px] font-bold text-gray-400 tracking-widest mb-3 uppercase">
              Main
            </p>
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition-colors text-sm"
              >
                <LayoutGrid className="w-4 h-4" strokeWidth={2.5} />
                Overview
              </Link>
              {/* ACTIVE LINK: Analytics */}
              <Link
                href="/analytics"
                className="flex items-center gap-3 px-4 py-2.5 bg-teal-50/50 text-[#0A4C5A] rounded-lg font-bold transition-colors text-sm relative"
              >
                {/* Active Green Indicator */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#00D084] rounded-r-full"></div>
                <LineChart
                  className="w-4 h-4 text-[#00D084]"
                  strokeWidth={2.5}
                />
                Analytics
              </Link>
            </div>
          </div>

          {/* GROUP 2: OPERATIONS */}
          <div>
            <p className="px-4 text-[11px] font-bold text-gray-400 tracking-widest mb-3 uppercase">
              Operations
            </p>
            <div className="space-y-1">
              <Link
                href="/orders"
                className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition-colors text-sm"
              >
                <ShoppingCart className="w-4 h-4" strokeWidth={2.5} />
                Orders
              </Link>
              <Link
                href="/inventory"
                className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition-colors text-sm"
              >
                <Boxes className="w-4 h-4" strokeWidth={2.5} />
                Inventory
              </Link>
              <Link
                href="/customers"
                className="flex items-center gap-3 px-4 py-2.5 text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition-colors text-sm"
              >
                <Users className="w-4 h-4" strokeWidth={2.5} />
                Customers
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* BOTTOM SECTION: Settings, Help */}
      <div className="p-4 space-y-1">
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition-colors text-sm">
          <Settings className="w-4 h-4" strokeWidth={2.5} />
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-gray-500 hover:bg-gray-50 rounded-lg font-semibold transition-colors text-sm mb-4">
          <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
          Help
        </button>
      </div>
    </aside>
  );
}
