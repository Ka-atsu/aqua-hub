// types/analytics.ts

export type AnalyticsRange = "7days" | "30days" | "90days";

export interface DailyTrend {
  label: string;
  revenue: number;
  gallons: number;
}

export interface TypeBreakdown {
  type: string;
  count: number;
  gallons: number;
  revenue: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  avgOrderValue: number;
  orderCount: number;
  totalGallons: number;
  totalSpend: number;
}

export interface Offender {
  name: string;
  lastSeen?: string;
  balance: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  avgDailyRevenue: number;
  totalGallons: number;
  totalTransactions: number;
  uniqueCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  avgOrderValue: number;
  containerReturnRate: number;
  dailyTrend: DailyTrend[];
  typeBreakdown: TypeBreakdown[];
  topCustomers: TopCustomer[];
  worstOffenders: Offender[];
}
