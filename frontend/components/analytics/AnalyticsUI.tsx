// components/analytics/AnalyticsUI.tsx
import React from "react";

// --- STAT CARD ---
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

const statCardStyles = {
  base: "rounded-3xl p-6 flex flex-col justify-between h-40 transition-shadow hover:shadow-md",
  accent: "bg-gray-900 text-white shadow-md border border-gray-800",
  default: "bg-white text-ink-dark border border-ink-dark/10 shadow-sm",
  labelAccent: "text-gray-400",
  labelDefault: "text-ink-muted",
  valueAccent: "text-white",
  valueDefault: "text-ink-black",
};

export function StatCard({ label, value, sub, accent = false }: StatCardProps) {
  return (
    <article
      className={`${statCardStyles.base} ${accent ? statCardStyles.accent : statCardStyles.default}`}
    >
      <div>
        <span
          className={`text-xs font-bold uppercase tracking-widest ${accent ? statCardStyles.labelAccent : statCardStyles.labelDefault}`}
        >
          {label}
        </span>
      </div>
      <div className="mt-4">
        <span
          className={`text-3xl font-extrabold block tracking-tighter ${accent ? statCardStyles.valueAccent : statCardStyles.valueDefault}`}
        >
          {value}
        </span>
        {sub && (
          <h3
            className={`text-sm font-semibold mt-1 ${accent ? statCardStyles.labelAccent : statCardStyles.labelDefault}`}
          >
            {sub}
          </h3>
        )}
      </div>
    </article>
  );
}

// --- PANEL ---
interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Panel({ title, children, className = "" }: PanelProps) {
  return (
    <section
      className={`bg-white border border-ink-dark/10 rounded-3xl p-6 shadow-sm flex flex-col min-h-0 ${className}`}
    >
      <div className="flex items-center justify-between mb-5 shrink-0 border-b border-ink-dark/5 pb-4">
        <h2 className="text-ink-black font-bold text-lg tracking-tight">
          {title}
        </h2>
      </div>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </section>
  );
}

// --- CHARTS ---
interface BarChartProps<T> {
  data: T[];
  valueKey: keyof T;
  color?: string;
}

export function BarChart<T extends { label: string }>({
  data,
  valueKey,
  color = "#00D084",
}: BarChartProps<T>) {
  const values = data.map((d) => Number(d[valueKey]));
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {data.map((d, i) => {
        const pct = (Number(d[valueKey]) / max) * 100;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group relative"
          >
            <div
              className="w-full rounded-t-sm transition-all duration-300 opacity-85"
              style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: color }} // Kept dynamic height/color as inline style (best practice)
            />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-ink-black text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {d.label}: {Number(d[valueKey]).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AxisLabels({ data }: { data: { label: string }[] }) {
  const step = Math.ceil(data.length / 7);
  return (
    <div className="flex justify-between mt-1">
      {data
        .filter((_, i) => i % step === 0 || i === data.length - 1)
        .map((d, i) => (
          <span key={i} className="text-[9px] text-ink-muted font-semibold">
            {d.label}
          </span>
        ))}
    </div>
  );
}
