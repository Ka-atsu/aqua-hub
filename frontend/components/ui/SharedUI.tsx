import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  TrendType,
  IconTileProps,
  ToolbarButtonProps,
} from "../../types/dashboard";

const TREND_TONE_CLASSES = {
  positive: "text-[#00D084]",
  negative: "text-red-400",
  warning: "text-orange-400",
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
}: ToolbarButtonProps) {
  const sizeClasses =
    size === "sm" ? "px-3 py-1.5 text-xs gap-2" : "px-4 py-2 text-sm gap-2";
  return (
    <button
      type="button"
      className={`flex items-center border border-gray-200 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors ${sizeClasses}`}
    >
      {Icon && <Icon className="w-4 h-4 text-gray-500" strokeWidth={2} />}
      <span>{children}</span>
      {IconAfter && (
        <IconAfter className="w-4 h-4 text-gray-500" strokeWidth={2} />
      )}
    </button>
  );
}
