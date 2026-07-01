import React from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";
import {
  KpiMetric,
  TrendType,
  IconTileProps,
  ToolbarButtonProps,
} from "@/types/dashboard";

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

const TREND_TONE_CLASSES: Record<string, string> = {
  positive: "text-[#00D084]",
  negative: "text-red-400",
  warning: "text-orange-400",
  neutral: "text-gray-500",
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
  const panelId = `panel-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section
      aria-labelledby={panelId}
      className={`bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col min-h-0 ${className}`}
    >
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

      <div className="mt-4">
        <span className="text-3xl font-extrabold block tracking-tighter">
          {value}
        </span>
        <h3
          className={`text-sm font-semibold mt-1 ${variant === "dark" ? "text-gray-400" : "text-gray-500"}`}
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
  const barId = `split-${labelA.replace(/[^a-zA-Z]/g, "")}-${labelB.replace(/[^a-zA-Z]/g, "")}`;

  return (
    <div className="w-full">
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

export function TrendBadge({
  value,
  direction = "up",
  tone = "positive",
}: TrendType) {
  const Arrow = direction === "up" ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${TREND_TONE_CLASSES[tone || "positive"]}`}
    >
      {value} <Arrow className="w-3 h-3" strokeWidth={2.5} />
    </span>
  );
}

export function IconTile({
  icon: Icon,
  bgClassName = "bg-[#0A4C5A]",
}: IconTileProps) {
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${bgClassName}`}
    >
      <Icon className="w-5 h-5" strokeWidth={2} />
    </div>
  );
}

export function ToolbarButton({
  icon: Icon,
  iconAfter: IconAfter,
  children,
  size = "md",
  className = "",
  ...props
}: ToolbarButtonProps) {
  const sizeClasses =
    size === "sm" ? "px-3 py-1.5 text-xs gap-2" : "px-4 py-2 text-sm gap-2";
  return (
    <button
      type="button"
      className={`flex items-center border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors ${sizeClasses} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 text-gray-500" strokeWidth={2} />}
      {children && <span>{children}</span>}
      {IconAfter && (
        <IconAfter className="w-4 h-4 text-gray-500" strokeWidth={2} />
      )}
    </button>
  );
}

export interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  colorClass?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  colorClass = "text-ink-dark",
  className = "",
}: StatCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 text-center ${className}`}
    >
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colorClass}`} strokeWidth={2.5} />
        <span className="text-2xl font-extrabold text-gray-900 leading-none">
          {value}
        </span>
      </div>
      <span className="text-[10px] font-semibold text-gray-500 mt-1.5">
        {subtext}
      </span>
    </div>
  );
}

export interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  minHeight?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  minHeight = "min-h-[250px]",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center w-full text-center border-y border-gray-200 p-12 ${minHeight} ${className}`}
    >
      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-1 text-sm">{message}</p>
    </div>
  );
}

export interface LoadingStateProps {
  message?: string;
  minHeight?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading records...",
  minHeight = "min-h-[250px]",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex justify-center items-center w-full text-gray-500 ${minHeight} ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({
  message,
  onRetry,
  className = "",
}: ErrorBannerProps) {
  return (
    <div
      className={`p-5 bg-red-50 border-y border-red-100 flex justify-between items-center w-full ${className}`}
    >
      <div className="flex items-center gap-3 text-red-600">
        <AlertTriangle className="w-5 h-5" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-semibold bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 transition-colors shadow-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
