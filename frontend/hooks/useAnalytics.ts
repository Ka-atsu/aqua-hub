"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type AnalyticsRange = "7days" | "30days" | "90days";

export interface DailyRevenue {
  label: string;
  revenue: number;
  gallons: number;
  transactions: number;
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
  // Summary KPIs
  totalRevenue: number;
  totalGallons: number;
  totalTransactions: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  avgDailyRevenue: number;

  // Charts
  dailyTrend: DailyRevenue[];
  typeBreakdown: TypeBreakdown[];

  // Customer Analytics
  topCustomers: TopCustomer[];
  newCustomers: number;
  returningCustomers: number;

  // Container Analytics
  totalContainersOut: number;
  worstOffenders: ContainerStat[];
  containerReturnRate: number;
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
      if (range === "7days") startDate.setDate(today.getDate() - 7);
      else if (range === "30days") startDate.setDate(today.getDate() - 30);
      else startDate.setDate(today.getDate() - 90);
      const startDateStr = startDate.toLocaleDateString("en-CA");

      // Fetch transactions in range (exclude walk-ins for customer analytics)
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .gte("transaction_date", startDateStr)
        .lte("transaction_date", todayStr)
        .order("transaction_date", { ascending: true });

      // Fetch all customers with container balance
      const { data: customersData } = await supabase
        .from("customers")
        .select("id, name, container_balance, updated_at")
        .order("container_balance", { ascending: false });

      // Fetch container transactions in range
      const { data: containerTxData } = await supabase
        .from("container_transactions")
        .select("*")
        .gte("created_at", startDate.toISOString());

      const transactions = txData || [];
      const customers = customersData || [];
      const containerTxs = containerTxData || [];

      // ── Revenue & Gallons ─────────────────────────────────────────────
      const totalRevenue = transactions.reduce(
        (sum, tx) => sum + (tx.amount || 0),
        0
      );
      const totalGallons = transactions.reduce(
        (sum, tx) => sum + (tx.new_gallon || 0) + (tx.old_gallon || 0),
        0
      );
      const totalTransactions = transactions.length;
      const avgOrderValue =
        totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      const days =
        range === "7days" ? 7 : range === "30days" ? 30 : 90;
      const avgDailyRevenue = totalRevenue / days;

      // ── Daily Trend ───────────────────────────────────────────────────
      const trendMap: Record<
        string,
        { revenue: number; gallons: number; transactions: number }
      > = {};

      transactions.forEach((tx) => {
        const d = tx.transaction_date;
        if (!trendMap[d]) trendMap[d] = { revenue: 0, gallons: 0, transactions: 0 };
        trendMap[d].revenue += tx.amount || 0;
        trendMap[d].gallons += (tx.new_gallon || 0) + (tx.old_gallon || 0);
        trendMap[d].transactions += 1;
      });

      const dailyTrend: DailyRevenue[] = Object.keys(trendMap)
        .sort()
        .map((date) => ({
          label: date.substring(5), // MM-DD
          revenue: trendMap[date].revenue,
          gallons: trendMap[date].gallons,
          transactions: trendMap[date].transactions,
        }));

      // ── Type Breakdown ────────────────────────────────────────────────
      const typeMap: Record<
        string,
        { count: number; gallons: number; revenue: number }
      > = {};

      transactions.forEach((tx) => {
        // Normalize: Standard + Slim = "Standard/Slim", Round = "Round"
        const raw = tx.type || "Standard";
        const normalized =
          raw.toLowerCase() === "round" ? "Round" : "Standard / Slim";
        if (!typeMap[normalized])
          typeMap[normalized] = { count: 0, gallons: 0, revenue: 0 };
        typeMap[normalized].count += 1;
        typeMap[normalized].gallons +=
          (tx.new_gallon || 0) + (tx.old_gallon || 0);
        typeMap[normalized].revenue += tx.amount || 0;
      });

      const typeBreakdown: TypeBreakdown[] = Object.entries(typeMap).map(
        ([type, stats]) => ({ type, ...stats })
      );

      // ── Customer Analytics (exclude walk-ins) ─────────────────────────
      const nonWalkIn = transactions.filter((tx) => !tx.is_walk_in && tx.customer_id);

      const customerMap: Record<
        string,
        { name: string; totalSpend: number; totalGallons: number; orderCount: number }
      > = {};

      nonWalkIn.forEach((tx) => {
        const id = tx.customer_id;
        if (!customerMap[id])
          customerMap[id] = {
            name: tx.name || "Unknown",
            totalSpend: 0,
            totalGallons: 0,
            orderCount: 0,
          };
        customerMap[id].totalSpend += tx.amount || 0;
        customerMap[id].totalGallons +=
          (tx.new_gallon || 0) + (tx.old_gallon || 0);
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

      // New vs Returning: customers who appear in container_transactions before this range
      const customerIdsInRange = new Set(Object.keys(customerMap));
      const { data: prevTxData } = await supabase
        .from("transactions")
        .select("customer_id")
        .lt("transaction_date", startDateStr)
        .eq("is_walk_in", false);

      const prevCustomerIds = new Set(
        (prevTxData || []).map((tx) => tx.customer_id).filter(Boolean)
      );

      let newCustomers = 0;
      let returningCustomers = 0;
      customerIdsInRange.forEach((id) => {
        if (prevCustomerIds.has(id)) returningCustomers++;
        else newCustomers++;
      });

      // ── Container Analytics ───────────────────────────────────────────
      const totalContainersOut = customers.reduce(
        (sum, c) => sum + (c.container_balance || 0),
        0
      );

      const worstOffenders: ContainerStat[] = customers
        .filter((c) => c.container_balance > 0)
        .slice(0, 8)
        .map((c) => ({
          name: c.name,
          balance: c.container_balance,
          lastSeen: c.updated_at
            ? new Date(c.updated_at).toLocaleDateString("en-CA")
            : null,
        }));

      // Return rate: containers returned / (returned + still out) in range
      const returned = containerTxs
        .filter((ct) => (ct.quantity_changed || 0) < 0)
        .reduce((sum, ct) => sum + Math.abs(ct.quantity_changed || 0), 0);
      const issued = containerTxs
        .filter((ct) => (ct.quantity_changed || 0) > 0)
        .reduce((sum, ct) => sum + (ct.quantity_changed || 0), 0);
      const containerReturnRate =
        issued > 0 ? Math.round((returned / issued) * 100) : 0;

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
