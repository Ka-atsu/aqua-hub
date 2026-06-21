import React from "react";

export function SalesLineGraph({
  data,
  className = "",
}: {
  data: { labels: string[]; values: number[] };
  className?: string;
}) {
  const max = Math.max(...data.values);
  const min = Math.min(...data.values);
  const range = max - min;

  const points = data.values
    .map((val, i) => {
      const x = (i / (data.values.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 80 - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between ${className}`}
    >
      <h3 className="font-semibold mb-6 text-gray-900">Sales Trend</h3>
      <div className="grow flex flex-col justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full max-h-48 overflow-visible"
        >
          <polyline
            fill="none"
            stroke="#00D084"
            strokeWidth="2"
            points={points}
          />
          {data.values.map((val, i) => (
            <circle
              key={i}
              cx={(i / (data.values.length - 1)) * 100}
              cy={100 - ((val - min) / range) * 80 - 10}
              r="2"
              fill="#0A4C5A"
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        {data.labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
