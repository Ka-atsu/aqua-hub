// types/dashboard.ts
import { LucideIcon } from "lucide-react";

export type TrendTone = "positive" | "negative" | "neutral" | "warning";
export type Direction = "up" | "down";

export interface TrendType {
  value: string;
  direction?: Direction;
  tone?: TrendTone;
}

export interface IconTileProps {
  icon: LucideIcon;
  bgClassName?: string;
}

export interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  iconAfter?: LucideIcon;
  size?: "sm" | "md";
}

export interface KpiMetric {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trendText?: string;
  trendTone?: TrendTone;
  href?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface TransactionSummary {
  id: string;
  name: string;
  type: string;
  gallons: number;
  isWalkIn: boolean;
  time: string;
}

export interface CustomerContainerDebt {
  id: string;
  name: string;
  balance: number;
}

export interface WaterDashboardData {
  revenueToday: KpiMetric;
  txToday: KpiMetric;
  activeCustomers: KpiMetric;
  containersOut: KpiMetric;
  gallonsToday: KpiMetric;
  revenueTrend: ChartDataPoint[];
  walkInSplit: { walkIn: number; delivery: number };
  recentTransactions: TransactionSummary[];
  followUpList: CustomerContainerDebt[];
  alerts: DashboardAlert[];
  summary: DailySummary;
}
export interface DashboardAlert {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  count?: number;
}

export interface DailySummary {
  revenue: number;
  transactions: number;
  gallons: number;
  walkIn: number;
  delivery: number;
  avgSale: number;
}
