"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWaterDashboard } from "@/hooks/useWaterDashboard";
import { KpiCard } from "@/components/dashboard/DashboardUI";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { ChevronDown } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data, loading, dateRange, setDateRange } = useWaterDashboard();

  if (loading || !data) {
    return (
      <div className="h-screen bg-ink-base flex items-center justify-center text-ink-muted font-medium animate-pulse">
        Loading operational workspace...
      </div>
    );
  }

  return (
    <div className="h-screen bg-ink-base text-ink-dark overflow-hidden flex flex-col transition-colors duration-500">
      <main className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-ink-black">
              Overview
            </h1>
            <p className="text-sm text-ink-muted font-medium">
              Daily operational insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-ink-dark/10 text-ink-dark rounded-xl text-sm font-semibold px-4 py-2.5 pr-10 cursor-pointer focus:ring-2 focus:ring-ink-accent outline-none shadow-ink-sm transition-shadow"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
              <ChevronDown className="w-4 h-4 text-ink-muted absolute right-3 top-3.5 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* KPI GRID */}
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

        {/* MAIN LAYOUT: Analytics Chart */}
        <div className="w-full pb-8">
          <AnalyticsChart
            chartData={data.historicalTrends || []}
            chartHeight={500} // FIX: Now you can control the height of the chart dynamically!
          />
        </div>
      </main>
    </div>
  );
}
