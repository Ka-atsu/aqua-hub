import React from "react";
import { ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";
import {
  TrendType,
  IconTileProps,
  ToolbarButtonProps,
} from "../../types/dashboard";

const TREND_TONE_CLASSES: Record<string, string> = {
  positive: "text-[#00D084]",
  negative: "text-red-400",
  warning: "text-orange-400",
  neutral: "text-gray-500",
};

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
      <span className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-1">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${colorClass}`} strokeWidth={2.5} />
        <span className="text-2xl font-extrabold text-ink-black leading-none">
          {value}
        </span>
      </div>
      <span className="text-[10px] font-semibold text-ink-muted mt-1.5">
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
      className={`flex flex-col items-center justify-center w-full text-center border-y border-ink-dark/10 p-12 ${minHeight} ${className}`}
    >
      <div className="w-12 h-12 bg-ink-dark/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-ink-dark" />
      </div>
      <h3 className="text-lg font-bold text-ink-black">{title}</h3>
      <p className="text-ink-muted mt-1 text-sm">{message}</p>
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
      className={`flex justify-center items-center w-full text-ink-muted ${minHeight} ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-ink-accent border-t-transparent rounded-full animate-spin"></div>
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
      className={`p-5 bg-ink-accent/5 border-y border-ink-accent/20 flex justify-between items-center w-full ${className}`}
    >
      <div className="flex items-center gap-3 text-ink-accent">
        <AlertTriangle className="w-5 h-5" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-semibold bg-white text-ink-dark hover:bg-ink-base border border-ink-dark/10 rounded-lg px-4 py-2 transition-colors shadow-ink-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
