"use client";

import { Search, CalendarDays, ChevronDown, Upload } from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";
import { ToolbarButton } from "../../components/ui/SharedUI";
import {
  HeroSummaryCard,
  MetricCard,
  StatCard,
} from "@/components/dashboard/Cards";
import {
  RecentActivityCard,
  SalesFlowCard,
} from "@/components/dashboard/Panels";
import { SalesLineGraph } from "@/components/dashboard/Graphs";

export default function AnalyticsPage() {
  const { data, state, actions } = useDashboardData();

  return (
    <div className="w-full text-gray-900 font-sans p-4 space-y-6">
      {/* 1. TOP TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search
            className="w-4 h-4 absolute left-3 top-2.5 text-gray-400"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0A4C5A]"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <ToolbarButton icon={CalendarDays}>
            {data.dateRangeLabel}
          </ToolbarButton>
          <ToolbarButton iconAfter={ChevronDown}>
            {data.periodLabel}
          </ToolbarButton>
          <div onClick={actions.handleExport}>
            <ToolbarButton icon={Upload}>Export</ToolbarButton>
          </div>
        </div>
      </div>

      {/* 2. HERO SUMMARY */}
      <HeroSummaryCard
        label={data.totalSales.label}
        value={data.totalSales.value}
        trend={data.totalSales.trend}
        actions={data.heroActions}
      />

      {/* 3. SPLIT DASHBOARD LAYOUT (Main + Sidebar) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* MAIN CONTENT (Left side - takes up most of the space) */}
        <div className="flex-1 space-y-6 min-w-0">
          {/* Graph & Table Side-by-Side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SalesLineGraph data={data.salesGraphData} />
            <SalesFlowCard
              rows={data.salesRows}
              periodLabels={data.periodLabels}
              activePeriod={state.salesPeriod}
              onPeriodChange={actions.setSalesPeriod}
            />
          </div>

          {/* Recent Activity (Full Width of main column) */}
          <RecentActivityCard items={data.activity} />
        </div>

        {/* STATS SIDEBAR (Right side - compact and narrow) */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
          {/* Optional Title for the cluster */}
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pl-1">
            Quick Insights
          </h3>

          {/* Cards stacked vertically with a tighter gap to feel "small" */}
          <div className="flex flex-col gap-3">
            {data.deliveryStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
            {data.metricCards.map((card) => (
              <MetricCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
