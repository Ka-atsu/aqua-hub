// types/analytics.ts

export type AnalyticsRange = "7days" | "30days" | "90days";

export interface DailyTrend {
  date: string;
  revenue: number;
  gallons: number;
  transactions: number;
  returned: number;
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
  lastSeen: string | null;
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
  totalContainersOut: number;
  dailyTrend: DailyTrend[];
  typeBreakdown: TypeBreakdown[];
  topCustomers: TopCustomer[];
  worstOffenders: Offender[];
}

export interface OrderRecord {
  transaction_id: string;
  item_id: string;
  transaction_date: string;
  customer_id: string | null;
  first_name: string | null;
  last_name: string | null;
  quantity: number;
  amount: number;
  is_walk_in: boolean;
  container_type_id: number;
}
