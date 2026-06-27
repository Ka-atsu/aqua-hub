"use client";
import { useAnalytics, AnalyticsRange } from "@/hooks/useAnalytics";
import { ChevronDown, TrendingUp, Droplets, ShoppingCart, Users, Package, RotateCcw } from "lucide-react";


function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-1 ${
        accent ? "bg-gray-900 text-white" : "bg-white border border-gray-100"
      }`}
    >
      <span
        className={`text-xs font-bold uppercase tracking-widest ${
          accent ? "text-gray-400" : "text-gray-400"
        }`}
      >
        {label}
      </span>
      <span
        className={`text-2xl font-extrabold tracking-tight ${
          accent ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </span>
      {sub && (
        <span
          className={`text-xs font-semibold ${
            accent ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-6 ${className}`}>
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-5">
        {title}
      </h2>
      {children}
    </div>
  );
}

function BarChart<T extends { label: string }>({
  data,
  valueKey,
  color = "#00D084",
}: {
  data: T[];
  valueKey: keyof T;
  color?: string;
}) {
  const values = data.map((d) => Number(d[valueKey]));
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {data.map((d, i) => {
        const pct = (Number(d[valueKey]) / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full rounded-t-sm transition-all duration-300"
              style={{
                height: `${Math.max(pct, 2)}%`,
                backgroundColor: color,
                opacity: 0.85,
              }}
            />
            {/* Tooltip on hover */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {d.label}: {Number(d[valueKey]).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}


function AxisLabels({ data }: { data: { label: string }[] }) {
  const step = Math.ceil(data.length / 7);
  return (
    <div className="flex justify-between mt-1">
      {data
        .filter((_, i) => i % step === 0 || i === data.length - 1)
        .map((d, i) => (
          <span key={i} className="text-[9px] text-gray-400 font-semibold">
            {d.label}
          </span>
        ))}
    </div>
  );
}



export default function AnalyticsPage() {
  const { data, loading, range, setRange } = useAnalytics();

  if (loading || !data) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center text-gray-500 font-medium animate-pulse">
        Loading analytics...
      </div>
    );
  }

  const rangeLabel =
    range === "7days" ? "Last 7 Days" : range === "30days" ? "Last 30 Days" : "Last 90 Days";

  return (
    <div className="h-screen bg-gray-50 text-gray-900 overflow-hidden flex flex-col">
      <main className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900">
              Analytics
            </h1>
            <p className="text-sm text-gray-500 font-medium">{rangeLabel}</p>
          </div>

          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as AnalyticsRange)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold px-4 py-2.5 pr-10 cursor-pointer focus:ring-2 focus:ring-gray-900 outline-none"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
        </header>

        {/* KPI ROW */}
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
            sub={rangeLabel}
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
            sub="Containers returned"
          />
        </section>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue Trend */}
          <Panel title="Revenue Trend" className="lg:col-span-2">
            {data.dailyTrend.length === 0 ? (
              <p className="text-sm text-gray-400">No data for this period.</p>
            ) : (
              <>
                <BarChart data={data.dailyTrend} valueKey="revenue" color="#00D084" />
                <AxisLabels data={data.dailyTrend} />
              </>
            )}
          </Panel>

          {/* Type Breakdown */}
          <Panel title="Container Type">
            <div className="space-y-4">
              {data.typeBreakdown.map((t) => {
                const totalTx = data.totalTransactions || 1;
                const pct = Math.round((t.count / totalTx) * 100);
                return (
                  <div key={t.type}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-gray-800">{t.type}</span>
                      <span className="text-sm font-bold text-gray-500">{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[#00D084] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">
                      {t.count} orders · {t.gallons} gal · ₱{t.revenue.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* GALLONS TREND */}
        <Panel title="Gallons Delivered per Day">
          {data.dailyTrend.length === 0 ? (
            <p className="text-sm text-gray-400">No data for this period.</p>
          ) : (
            <>
              <BarChart data={data.dailyTrend} valueKey="gallons" color="#0A4C5A" />
              <AxisLabels data={data.dailyTrend} />
            </>
          )}
        </Panel>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">

          {/* Top Customers */}
          <Panel title="Top Customers by Revenue">
            {data.topCustomers.length === 0 ? (
              <p className="text-sm text-gray-400">No customer data found.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-12 text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100">
                  <div className="col-span-1">#</div>
                  <div className="col-span-5">Customer</div>
                  <div className="col-span-2 text-center">Orders</div>
                  <div className="col-span-2 text-center">Gal</div>
                  <div className="col-span-2 text-right">Revenue</div>
                </div>
                {data.topCustomers.map((c, i) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-12 items-center py-2 hover:bg-gray-50 rounded-lg px-1 transition-colors"
                  >
                    <div className="col-span-1 text-xs font-bold text-gray-300">
                      {i + 1}
                    </div>
                    <div className="col-span-5">
                      <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        ₱{Math.round(c.avgOrderValue).toLocaleString()} avg
                      </p>
                    </div>
                    <div className="col-span-2 text-center text-sm font-bold text-gray-600">
                      {c.orderCount}
                    </div>
                    <div className="col-span-2 text-center text-sm font-bold text-gray-600">
                      {c.totalGallons}
                    </div>
                    <div className="col-span-2 text-right text-sm font-bold text-gray-900">
                      ₱{c.totalSpend.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Container Offenders */}
          <Panel title="Unreturned Containers — Top Offenders">
            {data.worstOffenders.length === 0 ? (
              <p className="text-sm text-gray-400">All containers accounted for.</p>
            ) : (
              <div className="space-y-3">
                {data.worstOffenders.map((c, i) => {
                  const maxBalance = data.worstOffenders[0].balance || 1;
                  const pct = Math.round((c.balance / maxBalance) * 100);
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-28 shrink-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                        {c.lastSeen && (
                          <p className="text-[10px] text-gray-400 font-semibold">
                            Updated {c.lastSeen}
                          </p>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-orange-400 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-orange-600 w-8 text-right shrink-0">
                        {c.balance}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

        </div>
      </main>
    </div>
  );
}
