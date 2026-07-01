"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface ChartDataPoint {
  date: string;
  revenue: number;
  gallons: number;
  returned: number;
}

interface AnalyticsChartProps {
  chartData: ChartDataPoint[];
}

export function AnalyticsChart({ chartData }: AnalyticsChartProps) {
  const [metricMode, setMetricMode] = useState<"volume" | "revenue">("volume");

  return (
    <section
      aria-label="Operational Trends Chart"
      className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col h-full min-h-[460px]"
    >
      {/* Chart Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-6">
        <div>
          <h2 className="text-gray-900 font-bold text-lg tracking-tight">
            Operational Performance
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Volumetric loops and financial trend tracking
          </p>
        </div>

        {/* Segmented Switcher Control */}
        <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-200 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setMetricMode("volume")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metricMode === "volume"
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Water & Containers
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("revenue")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              metricMode === "revenue"
                ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Revenue Stream
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      {/* FIXED: Added style={{ minHeight: 320, height: "100%" }} to force Recharts to render */}
      <div
        className="flex-1 w-full h-full text-xs font-semibold"
        style={{ minHeight: 320, height: "100%" }}
      >
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            No historical data available for this range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorGallons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A4C5A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0A4C5A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D084" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D084" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#F3F4F6"
              />

              <XAxis dataKey="date" stroke="#9CA3AF" tickLine={false} dy={10} />

              <YAxis
                stroke="#9CA3AF"
                tickLine={false}
                dx={-5}
                tickFormatter={(val) =>
                  metricMode === "revenue" ? `$${val}` : val
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  borderColor: "#E5E7EB",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                }}
              />

              <Legend verticalAlign="top" height={36} iconType="circle" />

              {metricMode === "volume" ? (
                <>
                  <Area
                    name="Gallons Dispatched"
                    type="monotone"
                    dataKey="gallons"
                    stroke="#0A4C5A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorGallons)"
                  />
                  <Area
                    name="Containers Returned"
                    type="monotone"
                    dataKey="returned"
                    stroke="#00D084"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorReturned)"
                  />
                </>
              ) : (
                <Area
                  name="Gross Revenue ($)"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111827"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
