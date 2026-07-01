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
  revenue: number; // Absolute dollar value
  gallons: number; // Volumetric performance
  returned: number; // Container return tracking
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

// export interface WaterDashboardData {
//   revenueToday: KpiMetric;
//   txToday: KpiMetric;
//   activeCustomers: KpiMetric;
//   containersOut: KpiMetric;
//   gallonsToday: KpiMetric;
//   revenueTrend: ChartDataPoint[];
//   walkInSplit: { walkIn: number; delivery: number };
//   recentTransactions: TransactionSummary[];
//   followUpList: CustomerContainerDebt[];
//   historicalTrends: ChartDataPoint[];
//   alerts: DashboardAlert[];
//   summary: DailySummary;
// }

// @/types/dashboard.ts

export interface WaterDashboardData {
  revenueToday: KpiMetric;
  txToday: KpiMetric;
  activeCustomers: KpiMetric;
  containersOut: KpiMetric;
  gallonsToday: KpiMetric;
  
  // 1. ADD THIS:
  historicalTrends: ChartDataPoint[]; 

  // 2. DELETE OR COMMENT OUT THIS LINE:
  // revenueTrend: { label: string; value: number }[]; 
  
  walkInSplit: { walkIn: number; delivery: number };
  alerts: DashboardAlert[];
  summary: any; 
  recentTransactions: any[];
  followUpList: any[];
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
