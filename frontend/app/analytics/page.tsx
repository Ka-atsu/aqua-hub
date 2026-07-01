"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { AnalyticsRange } from "@/types/analytics";
import { ChevronDown } from "lucide-react";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import {
  StatCard,
  Panel,
  BarChart,
  AxisLabels,
} from "@/components/dashboard/AnalyticsUI";

export default function AnalyticsPage() {
  const { data, loading, range, setRange } = useAnalytics();

  if (loading || !data) {
    return (
      <div className="h-screen bg-ink-base flex items-center justify-center text-ink-muted font-medium animate-pulse">
        Loading analytics workspace...
      </div>
    );
  }

  const rangeLabels: Record<AnalyticsRange, string> = {
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    "90days": "Last 90 Days",
  };

  const currentRangeLabel = rangeLabels[range] || "Unknown Period";

  const chartData = data.dailyTrend.map((d) => ({
    ...d,
    label: (d as any).date || "",
  }));

  return (
    <div className="h-screen bg-ink-base text-ink-dark overflow-hidden flex flex-col transition-colors duration-500">
      <main className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-ink-black">
              Analytics
            </h1>
            <p className="text-sm text-ink-muted font-medium">
              Business intelligence & performance
            </p>
          </div>

          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as AnalyticsRange)}
              className="appearance-none bg-white border border-ink-dark/10 text-ink-dark rounded-xl text-sm font-semibold px-4 py-2.5 pr-10 cursor-pointer focus:ring-2 focus:ring-ink-accent outline-none shadow-ink-sm transition-shadow"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <ChevronDown className="w-4 h-4 text-ink-muted absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </header>

        {/* KPI ROW (Strategic focus) */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            accent
            label="Revenue"
            value={`₱${data.totalRevenue.toLocaleString()}`}
            sub={`₱${Math.round(data.avgDailyRevenue).toLocaleString()} / day`}
          />
          <StatCard
            label="Gallons Sold"
            value={data.totalGallons.toLocaleString()}
            sub="Combined volume"
          />
          <StatCard
            label="Transactions"
            value={data.totalTransactions.toLocaleString()}
            sub={currentRangeLabel}
          />
          <StatCard
            label="Customers"
            value={data.uniqueCustomers.toLocaleString()}
            sub={`${data.newCustomers} new · ${data.returningCustomers} returning`}
          />
          <StatCard
            label="Avg Order"
            value={`₱${Math.round(data.avgOrderValue).toLocaleString()}`}
            sub="Per transaction"
          />
          <StatCard
            label="Return Rate"
            value={`${data.containerReturnRate}%`}
            sub="Containers returned overall"
          />
        </section>

        {/* INTEGRATED DETAILED ANALYTICS CHART */}
        <div className="w-full">
          <AnalyticsChart chartData={chartData || []} chartHeight={400} />
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend */}
          <Panel title="Revenue Trend" className="lg:col-span-2">
            {chartData.length === 0 ? (
              <p className="text-sm text-ink-muted">No data for this period.</p>
            ) : (
              <>
                <BarChart data={chartData} valueKey="revenue" color="#00D084" />
                <AxisLabels data={chartData} />
              </>
            )}
          </Panel>

          {/* Type Breakdown */}
          <Panel title="Container Type Distribution">
            <div className="space-y-4">
              {data.typeBreakdown.map((t) => {
                const totalTx = data.totalTransactions || 1;
                const pct = Math.round((t.count / totalTx) * 100);
                return (
                  <div key={t.type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-ink-black">
                        {t.type}
                      </span>
                      <span className="text-sm font-bold text-ink-muted">
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-ink-dark/5 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[#00D084] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-ink-muted mt-1 font-semibold">
                      {t.count} orders · {t.gallons} gal · ₱
                      {t.revenue.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* BOTTOM ROW: VOLUME & LOYALTY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {/* GALLONS TREND */}
          <Panel title="Gallons Delivered Trend">
            {chartData.length === 0 ? (
              <p className="text-sm text-ink-muted">No data for this period.</p>
            ) : (
              <>
                <BarChart data={chartData} valueKey="gallons" color="#0A4C5A" />
                <AxisLabels data={chartData} />
              </>
            )}
          </Panel>

          {/* Top Customers */}
          <Panel title="Top Customers by Revenue (CLV)">
            {data.topCustomers.length === 0 ? (
              <p className="text-sm text-ink-muted">No customer data found.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 text-[10px] font-bold text-ink-muted uppercase tracking-widest pb-2 border-b border-ink-dark/5">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Customer</div>
                  <div className="col-span-2 text-center">Orders</div>
                  <div className="col-span-2 text-center">Gal</div>
                  <div className="col-span-2 text-right">Revenue</div>
                </div>
                {data.topCustomers.map((c, i) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-12 items-center py-2 hover:bg-ink-dark/5 rounded-lg px-1 transition-colors"
                  >
                    <div className="col-span-1 text-xs font-bold text-ink-muted">
                      {i + 1}
                    </div>
                    <div className="col-span-5">
                      <p className="text-sm font-bold text-ink-black truncate">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-ink-muted font-semibold">
                        ₱{Math.round(c.avgOrderValue).toLocaleString()} avg
                      </p>
                    </div>
                    <div className="col-span-2 text-center text-sm font-bold text-ink-dark">
                      {c.orderCount}
                    </div>
                    <div className="col-span-2 text-center text-sm font-bold text-ink-dark">
                      {c.totalGallons}
                    </div>
                    <div className="col-span-2 text-right text-sm font-bold text-ink-black">
                      ₱{c.totalSpend.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </main>
    </div>
  );
}
