import {
  LineChart,
  Settings,
  Activity,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { ToolbarButton } from "../ui/SharedUI";
import {
  SalesFlowCardProps,
  RecentActivityCardProps,
  ToggleGroupProps,
  ActivityStatus,
  ActivityItem,
} from "../../types/dashboard";

// 1. Explicitly define or export the helper type locally so TypeScript can resolve it
interface SizeableProps {
  className?: string;
}

function ToggleGroup({ options, active, onChange }: ToggleGroupProps) {
  return (
    <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            opt === active
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-500"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function SalesFlowCard({
  rows,
  periodLabels,
  activePeriod,
  onPeriodChange,
  className = "",
}: SalesFlowCardProps & SizeableProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <LineChart className="w-4 h-4 text-[#00D084]" strokeWidth={2} />
            Sales Flow
          </h3>
          <div className="flex items-center gap-3">
            <ToggleGroup
              options={["Weekly", "Daily"]}
              active={activePeriod}
              onChange={onPeriodChange}
            />
            <ToolbarButton icon={Settings} size="sm">
              Manage
            </ToolbarButton>
          </div>
        </div>

        <div className="w-full overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
              <tr>
                <th className="py-2">Date</th>
                <th>Transactions</th>
                <th>Notables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* FIXED: typed 'row' derived explicitly from SalesFlowCardProps['rows'] */}
              {rows.map((row) => (
                <tr key={row.date}>
                  <td className="py-3 font-medium">{row.date}</td>
                  <td>{row.transactions} trans.</td>
                  <td className="text-gray-500">{row.notables}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-400 font-medium mt-4 px-4">
        {/* FIXED: typed 'label' string explicitly */}
        {periodLabels.map((label: string) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

const STATUS_TONE_CLASSES = {
  positive: "bg-[#F0FDF4] text-[#00D084]",
  negative: "bg-red-50 text-red-500",
};

function StatusPill({ label, tone = "positive" }: ActivityStatus) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${STATUS_TONE_CLASSES[tone || "positive"]}`}
    >
      {label}
    </span>
  );
}

function ActivityRow({
  icon: Icon,
  iconClassName = "text-[#00D084]",
  name,
  meta,
  amount,
  subtext,
  status,
}: ActivityItem) {
  return (
    <div className="grid grid-cols-4 items-center py-4">
      <div className="col-span-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
          <Icon className={`w-4 h-4 ${iconClassName}`} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-gray-400">{meta}</p>
        </div>
      </div>
      <div>
        <p className="font-semibold text-sm">{amount}</p>
        <p className="text-xs text-gray-400">{subtext}</p>
      </div>
      <div>
        <StatusPill {...status} />
      </div>
    </div>
  );
}

export function RecentActivityCard({
  items,
  className = "",
}: RecentActivityCardProps & SizeableProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-sm ${className}`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00D084]" strokeWidth={2} />
          Recent Customer Activity
        </h3>
        <div className="flex gap-2">
          <ToolbarButton icon={Filter} size="sm">
            Filter
          </ToolbarButton>
          <ToolbarButton icon={ArrowUpDown} size="sm">
            Sort
          </ToolbarButton>
          <ToolbarButton size="sm">...</ToolbarButton>
        </div>
      </div>

      <div className="grid grid-cols-4 text-xs font-semibold text-gray-400 pb-3 border-b border-gray-100 uppercase tracking-wide">
        <div className="col-span-2">Type</div>
        <div>Amount</div>
        <div>Status</div>
      </div>

      <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {/* FIXED: typed 'item' cleanly using ActivityItem */}
        {items.map((item: ActivityItem) => (
          <ActivityRow key={`${item.name}-${item.meta}`} {...item} />
        ))}
      </div>
    </div>
  );
}
