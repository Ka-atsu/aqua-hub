// components/dashboard/DashboardUI.tsx
import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { KpiMetric } from "@/types/dashboard";

// 1. Put this dictionary OUTSIDE your component so Tailwind's scanner sees it immediately
const TREND_STYLES: Record<string, Record<string, string>> = {
  dark: {
    positive: "bg-emerald-500/20 text-emerald-400",
    negative: "bg-red-500/20 text-red-400",
    warning: "bg-orange-500/20 text-orange-400",
    neutral: "bg-gray-800 text-gray-300",
  },
  light: {
    positive: "bg-emerald-50 text-emerald-600",
    negative: "bg-red-50 text-red-600",
    warning: "bg-orange-50 text-orange-600",
    neutral: "bg-gray-100 text-gray-600",
  },
  white: {
    positive: "bg-emerald-50 text-emerald-600",
    negative: "bg-red-50 text-red-600",
    warning: "bg-orange-50 text-orange-600",
    neutral: "bg-gray-100 text-gray-600",
  },
};

export function DashboardPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900 font-bold text-lg">{title}</h3>
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

// 2. Updated KpiCard component
export function KpiCard({
  metric,
  variant = "white",
}: {
  metric: KpiMetric;
  variant?: "dark" | "light" | "white";
}) {
  const { label, value, icon: Icon, trendText, trendTone } = metric;

  const styles = {
    dark: "bg-gray-900 text-white shadow-md",
    light: "bg-gray-50 text-gray-900 border border-transparent",
    white: "bg-white text-gray-900 border border-gray-100 shadow-sm",
  };

  const iconStyles = {
    dark: "bg-gray-800 text-white border border-gray-700",
    light: "bg-white text-gray-700 shadow-sm border border-gray-100",
    white: "bg-gray-50 text-gray-700 border border-gray-100",
  };

  // 3. We use the static dictionary here instead of a function
  const currentTone = trendTone || "neutral";
  const pillClass =
    TREND_STYLES[variant]?.[currentTone] || TREND_STYLES.white.neutral;

  return (
    <div
      className={`rounded-3xl p-6 flex flex-col justify-between h-40 ${styles[variant]}`}
    >
      <div className="flex justify-between items-start">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconStyles[variant]}`}
        >
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>

        {trendText && (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${pillClass}`}
          >
            {trendTone === "positive" && (
              <ArrowUpRight className="w-3.5 h-3.5" />
            )}
            {trendTone === "negative" && (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trendText}
          </span>
        )}
      </div>
      <div className="mt-4">
        <span className="text-3xl font-bold block tracking-tight">{value}</span>
        <h4
          className={`text-sm font-medium mt-1 ${variant === "dark" ? "text-gray-400" : "text-gray-500"}`}
        >
          {label}
        </h4>
      </div>
    </div>
  );
}

// Minimalist Split Bar
export function SplitBar({
  labelA,
  valueA,
  labelB,
  valueB,
}: {
  labelA: string;
  valueA: number;
  labelB: string;
  valueB: number;
}) {
  const total = valueA + valueB || 1;
  const percentA = Math.round((valueA / total) * 100);
  const percentB = 100 - percentA;

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm font-semibold text-gray-900 mb-3">
        <span>
          {labelA}{" "}
          <span className="text-gray-400 font-normal ml-1">{percentA}%</span>
        </span>
        <span>
          {labelB}{" "}
          <span className="text-gray-400 font-normal ml-1">{percentB}%</span>
        </span>
      </div>
      <div className="flex h-4 w-full rounded-full overflow-hidden bg-gray-100 gap-1">
        <div
          style={{ width: `${percentA}%` }}
          className="bg-gray-900 rounded-full"
        />
        <div
          style={{ width: `${percentB}%` }}
          className="bg-emerald-400 rounded-full"
        />
      </div>
    </div>
  );
}
