// components/dashboard/DashboardUI.tsx
import React from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { KpiMetric } from "@/types/dashboard";

// 1. CONSISTENCY & CONTRAST: Enhanced dictionaries with subtle borders and accessible color ratios
const TREND_STYLES: Record<string, Record<string, string>> = {
  dark: {
    positive: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    negative: "bg-red-500/20 text-red-300 border border-red-500/30",
    warning: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    neutral: "bg-gray-800 text-gray-300 border border-gray-700",
  },
  light: {
    positive: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    negative: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-orange-50 text-orange-700 border border-orange-200",
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
  },
  white: {
    positive: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    negative: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-orange-50 text-orange-700 border border-orange-200",
    neutral: "bg-gray-100 text-gray-700 border border-gray-200",
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
  // Generate a URL-safe ID for accessibility linking
  const panelId = `panel-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    // 2. ACCESSIBILITY: Used semantic <section> and aria-labelledby
    <section
      aria-labelledby={panelId}
      className={`bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col min-h-0 ${className}`}
    >
      {/* 3. HIERARCHY: Added a subtle bottom border to cleanly divide the header from the data */}
      <div className="flex items-center justify-between mb-5 shrink-0 border-b border-gray-100 pb-4">
        <h2
          id={panelId}
          className="text-gray-900 font-bold text-lg tracking-tight"
        >
          {title}
        </h2>
      </div>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </section>
  );
}

export function KpiCard({
  metric,
  variant = "white",
}: {
  metric: KpiMetric;
  variant?: "dark" | "light" | "white";
}) {
  const { label, value, icon: Icon, trendText, trendTone } = metric;

  const styles = {
    dark: "bg-gray-900 text-white shadow-md border border-gray-800",
    light: "bg-gray-50 text-gray-900 border border-gray-200",
    white: "bg-white text-gray-900 border border-gray-200 shadow-sm",
  };

  const iconStyles = {
    dark: "bg-gray-800 text-gray-300 border border-gray-700",
    light: "bg-white text-gray-700 shadow-sm border border-gray-200",
    white: "bg-gray-50 text-gray-700 border border-gray-200",
  };

  const currentTone = trendTone || "neutral";
  const pillClass =
    TREND_STYLES[variant]?.[currentTone] || TREND_STYLES.white.neutral;

  return (
    // 4. ALIGNMENT & ACCESSIBILITY: Semantic <article> wrapper with hover micro-interactions
    <article
      className={`rounded-3xl p-6 flex flex-col justify-between h-40 transition-shadow hover:shadow-md ${styles[variant]}`}
    >
      <div className="flex justify-between items-start">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconStyles[variant]}`}
          aria-hidden="true"
        >
          <Icon className="w-6 h-6" strokeWidth={1.75} />
        </div>

        {trendText && (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${pillClass}`}
          >
            {trendTone === "positive" && (
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {trendTone === "negative" && (
              <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {trendText}
          </span>
        )}
      </div>

      {/* 5. PROGRESSIVE DISCLOSURE: Numbers are tracked tighter for a numeric read, labels are softer */}
      <div className="mt-4">
        <span className="text-3xl font-extrabold block tracking-tighter">
          {value}
        </span>
        <h3
          className={`text-sm font-semibold mt-1 ${
            variant === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {label}
        </h3>
      </div>
    </article>
  );
}

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

  // Generate a deterministic class prefix to scope our CSS sizes without inline styles
  const barId = `split-${labelA.replace(/[^a-zA-Z]/g, "")}-${labelB.replace(/[^a-zA-Z]/g, "")}`;

  return (
    <div className="w-full">
      {/* 6. STRICT NO-INLINE-STYLING: Using a scoped style block instead of style={{ width: '%' }} */}
      <style>{`
        .${barId}-a { width: ${percentA}%; }
        .${barId}-b { width: ${percentB}%; }
      `}</style>

      <div className="flex justify-between text-sm font-bold text-gray-900 mb-3">
        <span>
          {labelA}{" "}
          <span className="text-gray-500 font-medium ml-1">{percentA}%</span>
        </span>
        <span>
          {labelB}{" "}
          <span className="text-gray-500 font-medium ml-1">{percentB}%</span>
        </span>
      </div>

      {/* Added an inner ring to give the bar a sleek, indented look */}
      <div className="flex h-4 w-full rounded-full overflow-hidden bg-gray-100 gap-1 ring-1 ring-inset ring-black/5">
        <div
          className={`${barId}-a bg-gray-900 transition-all duration-500 ease-out`}
          role="progressbar"
          aria-valuenow={percentA}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={labelA}
        />
        <div
          className={`${barId}-b bg-emerald-500 transition-all duration-500 ease-out`}
          role="progressbar"
          aria-valuenow={percentB}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={labelB}
        />
      </div>
    </div>
  );
}
