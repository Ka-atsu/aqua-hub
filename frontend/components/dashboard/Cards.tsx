import { TrendBadge, IconTile } from "../ui/SharedUI";
import {
  HeroSummaryCardProps,
  MetricCardProps,
  StatCardProps,
} from "../../types/dashboard";

// Add className to the component type definitions if needed, or extend inline
interface SizeableProps {
  className?: string;
}

export function HeroSummaryCard({
  label,
  value,
  trend,
  actions,
  className = "",
}: HeroSummaryCardProps & SizeableProps) {
  return (
    <div
      className={`bg-[#0A4C5A] rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm ${className}`}
    >
      <div>
        <p className="text-teal-100 text-sm font-medium mb-1">{label}</p>
        <div className="flex items-baseline gap-3">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            {value}
          </h2>
          {trend && <TrendBadge {...trend} />}
        </div>
      </div>
      <div className="mt-6 md:mt-0 flex gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`flex items-center gap-2 font-semibold rounded-lg text-sm transition-colors ${action.variant === "primary" ? "bg-[#00D084] text-[#0A4C5A] px-5 py-2.5" : "bg-white/10 text-white px-5 py-2.5"}`}
          >
            {action.icon && <action.icon className="w-4 h-4" strokeWidth={2} />}
            {!action.iconOnly && action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MetricCard({
  icon: Icon,
  iconClassName,
  title,
  period,
  headline,
  badge,
  note,
  className = "",
}: MetricCardProps & SizeableProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-5 ${className}`}
    >
      <div className="flex justify-between items-center mb-4 text-sm font-semibold text-gray-500">
        <span className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconClassName}`} strokeWidth={2} />
          {title}
        </span>
        <span className="text-xs">{period}</span>
      </div>
      <h3 className="text-2xl font-semibold mb-1">{headline}</h3>
      <div className="text-xs text-gray-400 font-medium flex items-center gap-2">
        <TrendBadge {...badge} />
        <span>{note}</span>
      </div>
    </div>
  );
}

export function StatCard({
  icon,
  bgClassName,
  label,
  value,
  trend,
  className = "",
}: StatCardProps & SizeableProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-center ${className}`}
    >
      <IconTile icon={icon} bgClassName={bgClassName} />
      <p className="text-sm font-semibold text-gray-900 mt-4 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-semibold">{value}</h3>
        <TrendBadge {...trend} />
      </div>
    </div>
  );
}
