"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWaterDashboard } from "@/hooks/useWaterDashboard";
import { KpiCard, DashboardPanel } from "@/components/dashboard/DashboardUI";
import { NewOrderModal } from "@/components/dashboard/NewOrderModal";
import {
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Plus,
  Check,
  Search,
  ChevronDown,
} from "lucide-react";

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
      <div className="min-h-screen bg-gray-50/50 p-8 text-gray-400 flex items-center justify-center font-medium">
        Loading workspace...
      </div>
    );
  }

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    // Changed min-h-screen to h-screen and overflow-hidden on lg viewports to lock the viewport
    <div className="h-screen bg-gray-50/50 text-gray-900 relative lg:overflow-hidden">
      <div className="p-6 md:p-8 space-y-6 h-full flex flex-col">
        {/* PHASE 1: HEADER ACTIONS & DATE FILTER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-sm text-gray-500 mt-1">
              What's happening with your station today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsNewOrderOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm active:scale-98"
            >
              <Plus className="w-4 h-4" /> New Order
            </button>

            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold px-4 py-2.5 pr-10 cursor-pointer hover:bg-gray-50 outline-none focus:ring-2 focus:ring-gray-900/10"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* PHASE 1: CLICKABLE KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0">
          <Link
            href={data.revenueToday.href || "#"}
            className="block group transition-transform hover:-translate-y-1"
          >
            <KpiCard metric={data.revenueToday} variant="dark" />
          </Link>
          <Link
            href={data.txToday.href || "#"}
            className="block group transition-transform hover:-translate-y-1"
          >
            <KpiCard metric={data.txToday} variant="white" />
          </Link>
          <Link
            href={data.gallonsToday.href || "#"}
            className="block group transition-transform hover:-translate-y-1"
          >
            <KpiCard metric={data.gallonsToday} variant="white" />
          </Link>
          <Link
            href={data.activeCustomers.href || "#"}
            className="block group transition-transform hover:-translate-y-1"
          >
            <KpiCard metric={data.activeCustomers} variant="white" />
          </Link>
          <Link
            href={data.containersOut.href || "#"}
            className="block group transition-transform hover:-translate-y-1"
          >
            <KpiCard metric={data.containersOut} variant="white" />
          </Link>
        </div>

        {/* MAIN SPLIT LAYOUT - Calculated height applied here */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 pb-4">
          {/* LEFT COLUMN: Recent Transactions */}
          <div className="lg:col-span-2 h-full min-h-0">
            <DashboardPanel
              title="Recent Transactions"
              className="h-full lg:h-[calc(100vh-350px)]"
            >
              <div className="flex flex-col h-full min-h-0">
                {/* Fixed Search Bar Area */}
                <div className="mb-6 relative shrink-0">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>

                {/* Fixed Table Header */}
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-xs font-semibold text-gray-400 shrink-0">
                  <div className="col-span-6">CUSTOMER</div>
                  <div className="col-span-3 text-center">GALLONS</div>
                  <div className="col-span-3 text-right">ACTION</div>
                </div>

                {/* Scrollable Data Body */}
                <div className="divide-y divide-gray-50 overflow-y-auto pr-2 flex-1 msg-scrollbar">
                  {data.recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      onClick={() => router.push(`/transactions/${tx.id}`)}
                      className="grid grid-cols-12 gap-4 py-3 items-center group hover:bg-gray-50/80 transition-colors px-2 cursor-pointer"
                    >
                      <div className="col-span-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {getInitials(tx.name)}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {tx.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium truncate">
                            {tx.isWalkIn ? "Walk-In" : "Delivery"} • {tx.type}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center justify-center">
                        <span className="px-3 py-1 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-bold text-gray-700">
                          {tx.gallons} Gal
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center justify-end">
                        <button
                          className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardPanel>
          </div>

          {/* RIGHT COLUMN: Container Recovery */}
          <div className="h-full min-h-0">
            <DashboardPanel
              title="Container Recovery"
              className="bg-white border-gray-200 h-full lg:h-[calc(100vh-350px)]"
            >
              <div className="flex flex-col h-full min-h-0">
                <p className="text-sm text-gray-500 mb-6 shrink-0">
                  Customers holding the most inventory.
                </p>

                {/* Scrollable Data Body */}
                <div className="space-y-4 overflow-y-auto pr-2 flex-1 msg-scrollbar">
                  {data.followUpList.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex flex-col p-4 rounded-2xl border border-gray-100 bg-gray-50/50 shrink-0"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="font-bold text-gray-900 text-base block">
                            {customer.name}
                          </span>
                          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md mt-1 inline-block border border-orange-100">
                            {customer.balance} Containers Out
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-auto">
                        <button
                          onClick={() => markReturned(customer.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Returned
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardPanel>
          </div>
        </div>
      </div>

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
      />
    </div>
  );
}
