"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  AnalyticsRange,
  AnalyticsData,
  DailyTrend,
  TypeBreakdown,
  TopCustomer,
  Offender,
  OrderRecord,
} from "@/types/analytics";

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

      // HELPER: Bulletproof Data Extractor
      const getSafeMetrics = (tx: OrderRecord) => ({
        qty: tx.quantity,
        amt: tx.amount,
      });

      // Revenue & Gallons
      let totalRevenue = 0;
      let totalGallons = 0;

      transactions.forEach((tx) => {
        const { qty, amt } = getSafeMetrics(tx);
        // Only count deliveries towards gallons and revenue, ignore returns
        if (qty > 0) {
          totalGallons += qty;
          totalRevenue += amt;
        }
      });

      const totalTransactions = transactions.length;
      const avgOrderValue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
      const avgDailyRevenue = totalRevenue / daysOffset;

      // Daily Trend (Pre-filled with 0s to keep chart lines continuous)
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

        trendMap[d].transactions += 1;

        if (qty > 0) {
          trendMap[d].gallons += qty;
          trendMap[d].revenue += amt; // Add revenue only on deliveries
        } else if (qty < 0) {
          trendMap[d].returned += Math.abs(qty);
        }
      });

      const dailyTrend: DailyTrend[] = Object.keys(trendMap)
        .sort()
        .map((date) => ({
          date: date.substring(5), // MM-DD mapped to 'date' for the chart
          revenue: trendMap[date].revenue,
          gallons: trendMap[date].gallons,
          transactions: trendMap[date].transactions,
          returned: trendMap[date].returned,
        }));

      // Type Breakdown
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
        if (qty > 0) {
          typeMap[normalized].gallons += qty;
          typeMap[normalized].revenue += amt;
        }
      });

      const typeBreakdown: TypeBreakdown[] = Object.entries(typeMap).map(
        ([type, stats]) => ({ type, ...stats }),
      );

      const { data: topCustomersData } = await supabase
        .from("view_analytics_top_customers")
        .select("*")
        .limit(10);

      const topCustomers: TopCustomer[] = (topCustomersData || []).map(
        (c: any) => ({
          id: c.id,
          name: c.name || "Unknown",
          totalSpend: Number(c.total_spend) || 0,
          totalGallons: Number(c.total_gallons) || 0,
          orderCount: Number(c.order_count) || 0,
          avgOrderValue: Number(c.avg_order_value) || 0,
        }),
      );

      // Keep this for your New vs Returning logic just below
      const nonWalkInIds = transactions
        .filter((tx) => !tx.is_walk_in && tx.customer_id)
        .map((tx) => tx.customer_id!);

      const customerIdsInRange = new Set(nonWalkInIds);
      const uniqueCustomers = customerIdsInRange.size;

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

      // Container Analytics
      const totalContainersOut = customers.reduce(
        (sum, c) => sum + (c.outstanding_balance || 0),
        0,
      );

      const worstOffenders: Offender[] = customers
        .filter((c) => c.outstanding_balance > 0)
        .slice(0, 8)
        .map((c) => ({
          name: c.name,
          balance: c.outstanding_balance,
          lastSeen: null,
        }));

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
