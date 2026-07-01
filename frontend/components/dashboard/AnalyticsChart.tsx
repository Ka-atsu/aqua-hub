"use client";

import React from "react";
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
  // ADDED: Props to control sizing from the parent
  chartHeight?: number | string;
  className?: string;
}

export function AnalyticsChart({
  chartData,
  chartHeight = 320, // Defaults to 320px if no prop is provided
  className = "",
}: AnalyticsChartProps) {
  return (
    <section
      aria-label="Operational Trends Charts"
      className={`grid grid-cols-1 lg:grid-cols-2 gap-6 w-full ${className}`}
    >
      {/* ---------------------------------------------------- */}
      {/* CHART 1: WATER & CONTAINERS (VOLUME)                 */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-gray-900 font-bold text-lg tracking-tight">
            Water & Containers
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Volumetric loops and container tracking
          </p>
        </div>

        <div
          className="flex-1 w-full h-full text-xs font-semibold"
          style={{ minHeight: chartHeight }} // FIX: Height is now dynamic via prop
        >
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              No historical data available.
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
                  <linearGradient
                    id="colorReturned"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#00D084" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00D084" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F3F4F6"
                />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tickLine={false}
                  dy={10}
                />
                <YAxis stroke="#9CA3AF" tickLine={false} dx={-5} />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    borderColor: "#E5E7EB",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />

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
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* CHART 2: REVENUE STREAM                              */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
        <div className="border-b border-gray-100 pb-4 mb-6">
          <h2 className="text-gray-900 font-bold text-lg tracking-tight">
            Revenue Stream
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Financial gross trend tracking
          </p>
        </div>

        <div
          className="flex-1 w-full h-full text-xs font-semibold"
          style={{ minHeight: chartHeight }} // FIX: Height is now dynamic via prop
        >
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              No historical data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
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
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tickLine={false}
                  dx={-5}
                  tickFormatter={(val) => `₱${val}`}
                />

                <Tooltip
                  formatter={(value: any) => [
                    `₱${Number(value).toLocaleString()}`,
                    "Gross Revenue",
                  ]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    borderColor: "#E5E7EB",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />

                <Area
                  name="Gross Revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#111827"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
