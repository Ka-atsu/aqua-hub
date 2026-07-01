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
  date: string; // e.g., "Mon", "2026-06-01"
  revenue: number;
  gallons: number;
  returned: number;
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

export interface WaterDashboardData {
  revenueToday: any;
  txToday: any;
  activeCustomers: any;
  containersOut: any;
  gallonsToday: any;
  historicalTrends?: ChartDataPoint[];
  walkInSplit: { walkIn: number; delivery: number };
  alerts: any[];
  summary: any;
  recentTransactions: any[];
  followUpList: any[];
  recentTrend: ChartDataPoint[];
  worstOffenders?: { name: string; balance: number; lastSeen?: string }[];
}
export interface AnalyticsViewRecord {
  transaction_id: string;
  transaction_date: string;
  customer_id: string;
  customer_name: string | null;
  quantity: number | null;
  container_type_id: number | null;
  amount?: number | null;
  type_name: string | null;
}

export interface CustRecord {
  customer_id: string;
  name: string;
  outstanding_balance: number;
}
