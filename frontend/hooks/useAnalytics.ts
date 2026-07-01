"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type AnalyticsRange = "7days" | "30days" | "90days";

export interface DailyRevenue {
  date: string; // FIXED: Must be 'date' for the chart to read it
  revenue: number;
  gallons: number;
  transactions: number;
  returned: number; // FIXED: Added to prevent chart errors
}

export interface TopCustomer {
  id: string;
  name: string;
  totalSpend: number;
  totalGallons: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface ContainerStat {
  name: string;
  balance: number;
  lastSeen: string | null;
}

export interface TypeBreakdown {
  type: string;
  count: number;
  gallons: number;
  revenue: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalGallons: number;
  totalTransactions: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  avgDailyRevenue: number;
  dailyTrend: DailyRevenue[];
  typeBreakdown: TypeBreakdown[];
  topCustomers: TopCustomer[];
  newCustomers: number;
  returningCustomers: number;
  totalContainersOut: number;
  worstOffenders: ContainerStat[];
  containerReturnRate: number;
}

interface OrderRecord {
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

export function useAnalytics() {
  const [range, setRange] = useState<AnalyticsRange>("30days");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      const today = new Date();
      const todayStr = today.toLocaleDateString("en-CA");

      const startDate = new Date();
      const daysOffset = range === "7days" ? 7 : range === "30days" ? 30 : 90;
      startDate.setDate(today.getDate() - daysOffset);
      const startDateStr = startDate.toLocaleDateString("en-CA");

      // 1. Fetch from 'orders' table with Native Joins
      const { data: txData, error: txError } = await supabase
        .from("view_order_summary")
        .select("*")
        .gte("transaction_date", startDateStr)
        .lte("transaction_date", todayStr)
        .order("transaction_date", { ascending: true });

      if (txError) throw txError;

      // 2. Fetch Container Balances
      const { data: customersData } = await supabase
        .from("view_customer_container_balances")
        .select("customer_id, name, outstanding_balance")
        .order("outstanding_balance", { ascending: false });

      const transactions: OrderRecord[] =
        (txData as unknown as OrderRecord[]) || [];
      const customers = customersData || [];

      // ── HELPER: Bulletproof Data Extractor ────────────────────────────
      // Safely handles nulls, undefined, and missing amount data
      const getSafeMetrics = (tx: OrderRecord) => ({
        qty: tx.quantity,
        amt: tx.amount,
      });

      // ── Revenue & Gallons ─────────────────────────────────────────────
      let totalRevenue = 0;
      let totalGallons = 0;

      transactions.forEach((tx) => {
        const { qty, amt } = getSafeMetrics(tx);
        if (qty > 0) totalGallons += qty;
        totalRevenue += amt;
      });

      const totalTransactions = transactions.length;
      const avgOrderValue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      const avgDailyRevenue = totalRevenue / daysOffset;

      // ── Daily Trend (Pre-filled with 0s to prevent chart collapse) ────
      const trendMap: Record<
        string,
        {
          revenue: number;
          gallons: number;
          transactions: number;
          returned: number;
        }
      > = {};

      for (let i = daysOffset - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString("en-CA");
        trendMap[dateStr] = {
          revenue: 0,
          gallons: 0,
          transactions: 0,
          returned: 0,
        };
      }

      transactions.forEach((tx) => {
        const d = tx.transaction_date;
        const { qty, amt } = getSafeMetrics(tx);

        if (!trendMap[d]) {
          trendMap[d] = {
            revenue: 0,
            gallons: 0,
            transactions: 0,
            returned: 0,
          };
        }

        trendMap[d].revenue += amt;
        trendMap[d].transactions += 1;

        if (qty > 0) {
          trendMap[d].gallons += qty;
        } else if (qty < 0) {
          trendMap[d].returned += Math.abs(qty);
        }
      });

      const dailyTrend: DailyRevenue[] = Object.keys(trendMap)
        .sort()
        .map((date) => ({
          date: date.substring(5), // MM-DD mapped to 'date' for the chart
          revenue: trendMap[date].revenue,
          gallons: trendMap[date].gallons,
          transactions: trendMap[date].transactions,
          returned: trendMap[date].returned,
        }));

      // ── Type Breakdown ────────────────────────────────────────────────
      const typeMap: Record<
        string,
        { count: number; gallons: number; revenue: number }
      > = {};

      transactions.forEach((tx) => {
        const { qty, amt } = getSafeMetrics(tx);
        const normalized =
          tx.container_type_id === 2 ? "Round" : "Standard / Slim";

        if (!typeMap[normalized]) {
          typeMap[normalized] = { count: 0, gallons: 0, revenue: 0 };
        }

        typeMap[normalized].count += 1;
        if (qty > 0) typeMap[normalized].gallons += qty;
        typeMap[normalized].revenue += amt;
      });

      const typeBreakdown: TypeBreakdown[] = Object.entries(typeMap).map(
        ([type, stats]) => ({ type, ...stats }),
      );

      // ── Customer Analytics (exclude walk-ins) ─────────────────────────
      const nonWalkIn = transactions.filter(
        (tx) => !tx.is_walk_in && tx.customer_id,
      );

      const customerMap: Record<
        string,
        {
          name: string;
          totalSpend: number;
          totalGallons: number;
          orderCount: number;
        }
      > = {};

    nonWalkIn.forEach((tx) => {
      const id = tx.customer_id!;
      const { qty, amt } = getSafeMetrics(tx);

      if (!customerMap[id]) {
        customerMap[id] = {
          name:
            `${tx.first_name ?? ""} ${tx.last_name ?? ""}`.trim() || "Unknown",
          totalSpend: 0,
          totalGallons: 0,
          orderCount: 0,
        };
      }

      customerMap[id].totalSpend += amt;

      if (qty > 0) {
        customerMap[id].totalGallons += qty;
      }

      customerMap[id].orderCount += 1;
    });

      const topCustomers: TopCustomer[] = Object.entries(customerMap)
        .map(([id, stats]) => ({
          id,
          ...stats,
          avgOrderValue:
            stats.orderCount > 0 ? stats.totalSpend / stats.orderCount : 0,
        }))
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 10);

      const uniqueCustomers = Object.keys(customerMap).length;

      // ── New vs Returning logic using 'orders' table ───────────────────
      const customerIdsInRange = new Set(Object.keys(customerMap));
      const { data: prevTxData } = await supabase
        .from("view_order_summary")
        .select("customer_id")
        .lt("transaction_date", startDateStr)
        .eq("is_walk_in", false);

      const prevCustomerIds = new Set(
        (prevTxData || []).map((tx) => tx.customer_id).filter(Boolean),
      );

      let newCustomers = 0;
      let returningCustomers = 0;
      customerIdsInRange.forEach((id) => {
        if (prevCustomerIds.has(id)) returningCustomers++;
        else newCustomers++;
      });

      // ── Container Analytics ───────────────────────────────────────────
      const totalContainersOut = customers.reduce(
        (sum, c) => sum + (c.outstanding_balance || 0),
        0,
      );

      const worstOffenders: ContainerStat[] = customers
        .filter((c) => c.outstanding_balance > 0)
        .slice(0, 8)
        .map((c) => ({
          name: c.name,
          balance: c.outstanding_balance,
          lastSeen: null,
        }));

      // Safely set to 0 until return tracking logic in 'orders' is finalized
      const containerReturnRate = 0;

      setData({
        totalRevenue,
        totalGallons,
        totalTransactions,
        uniqueCustomers,
        avgOrderValue,
        avgDailyRevenue,
        dailyTrend,
        typeBreakdown,
        topCustomers,
        newCustomers,
        returningCustomers,
        totalContainersOut,
        worstOffenders,
        containerReturnRate,
      });
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  return { data, loading, range, setRange };
}
