import { LucideIcon } from "lucide-react";

export type TrendTone = "positive" | "negative" | "warning";
export type Direction = "up" | "down";

export interface TrendType {
  value: string;
  direction?: Direction;
  tone?: TrendTone;
}

export interface TrendBadgeProps extends TrendType {}

export interface IconTileProps {
  icon: LucideIcon;
  bgClassName?: string;
}

export interface ToolbarButtonProps {
  icon?: LucideIcon;
  iconAfter?: LucideIcon;
  children: React.ReactNode;
  size?: "sm" | "md";
}

export interface InlineLinkProps {
  children: React.ReactNode;
  icon?: LucideIcon;
}

export interface HeroAction {
  label: string;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "icon";
  iconOnly?: boolean;
}

export interface HeroSummaryCardProps {
  label: string;
  value: string;
  trend?: TrendType;
  actions: HeroAction[];
}

export interface ToggleGroupProps {
  options: string[];
  active: string;
  onChange: (selected: string) => void;
}

export interface SalesRow {
  date: string;
  transactions: number;
  notables: string;
}

export interface SalesFlowCardProps {
  rows: SalesRow[];
  periodLabels: string[];
  activePeriod: string;
  onPeriodChange: (period: string) => void;
}

export interface StatCardProps {
  icon: LucideIcon;
  bgClassName?: string;
  label: string;
  value: string;
  trend: TrendType;
}

export interface MetricCardProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  period: string;
  headline: string;
  badge: TrendType;
  note: string;
}

export interface ActivityStatus {
  label: string;
  tone?: "positive" | "negative";
}

export interface ActivityItem {
  icon: LucideIcon;
  iconClassName?: string;
  name: string;
  meta: string;
  amount: string;
  subtext: string;
  status: ActivityStatus;
}

export interface RecentActivityCardProps {
  items: ActivityItem[];
}

export interface ProgressBarProps {
  value: number;
  max: number;
}

export interface InventoryHeroProps {
  label: string;
  maskedCode: string;
  units: string;
  statusLabel: string;
}

export interface StockItem {
  label: string;
  value: number;
  max: number;
}

export interface InventoryCardProps {
  hero: InventoryHeroProps;
  stockItem: StockItem;
}

export interface DashboardDataProps {
  dateRangeLabel: string;
  periodLabel: string;
  totalSales: {
    label: string;
    value: string;
    trend: TrendType;
  };
  heroActions: HeroAction[];
  deliveryStats: StatCardProps[];
  metricCards: MetricCardProps[];
  salesRows: SalesRow[];
  periodLabels: string[];
  activity: ActivityItem[];
  inventory: InventoryCardProps;
}
