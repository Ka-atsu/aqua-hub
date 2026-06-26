"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWaterDashboard } from "@/hooks/useWaterDashboard";
import { KpiCard, DashboardPanel } from "@/components/dashboard/DashboardUI";
import { NewOrderModal } from "@/components/dashboard/NewOrderModal";
import { Plus, Search, ChevronDown, MoreHorizontal, Check } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const {
    data,
    loading,
    dateRange,
    setDateRange,
    markReturned,
    isNewOrderOpen,
    setIsNewOrderOpen,
  } = useWaterDashboard();

  if (loading || !data) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-medium animate-pulse">
        Loading operational workspace...
      </div>
    );
  }

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="h-screen bg-gray-50 text-gray-900 overflow-hidden flex flex-col">
      <main className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
        {/* HEADER: Uses Hierarchy and Alignment */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900">
              Overview
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Daily operational insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewOrderOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> New Order
            </button>

            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold px-4 py-2.5 pr-10 cursor-pointer focus:ring-2 focus:ring-gray-900 outline-none"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* KPI GRID: Principles of Consistency */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { data: data.revenueToday, variant: "dark" },
            { data: data.txToday, variant: "white" },
            { data: data.gallonsToday, variant: "white" },
            { data: data.activeCustomers, variant: "white" },
            { data: data.containersOut, variant: "white" },
          ].map((item, index) => (
            <Link
              key={index}
              href={item.data.href || "#"}
              className="block group transition-transform hover:-translate-y-1"
            >
              <KpiCard
                metric={item.data}
                variant={item.variant as "dark" | "white"}
              />
            </Link>
          ))}
        </section>

        {/* MAIN LAYOUT: Principles of Proximity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-166">
          {/* Recent Transactions Panel */}
          <DashboardPanel title="Recent Transactions" className="h-full">
            <div className="flex flex-col h-full">
              <div className="mb-4 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-gray-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-12 gap-4 pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <div className="col-span-6">Customer</div>
                <div className="col-span-3 text-center">Gallons</div>
                <div className="col-span-3 text-right">Action</div>
              </div>

              <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                {data.recentTransactions.map((tx) => (
                  <article
                    key={tx.id}
                    onClick={() => router.push(`/transactions/${tx.id}`)}
                    className="grid grid-cols-12 gap-4 py-3 items-center hover:bg-gray-50 cursor-pointer transition-colors px-2 rounded-lg"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600">
                        {getInitials(tx.name)}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-gray-900 text-sm">
                          {tx.name}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {tx.isWalkIn ? "Walk-In" : "Delivery"}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-3 text-center font-bold text-sm text-gray-700">
                      {tx.gallons}
                    </div>
                    <div className="col-span-3 flex justify-end">
                      <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </DashboardPanel>

          {/* Container Recovery Panel */}
          <DashboardPanel title="Container Recovery" className="h-full">
            <div className="space-y-3 overflow-y-auto h-full pr-1">
              {data.followUpList.map((customer) => (
                <div
                  key={customer.id}
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-sm text-gray-900 block">
                      {customer.name}
                    </span>
                    <span className="text-xs font-bold text-orange-600">
                      {customer.balance} containers outstanding
                    </span>
                  </div>
                  <button
                    onClick={() => markReturned(customer.id)}
                    aria-label={`Mark returned for ${customer.name}`}
                    className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>
      </main>

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />
    </div>
  );
}
