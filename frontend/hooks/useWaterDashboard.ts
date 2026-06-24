// hooks/useWaterDashboard.ts
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { WaterDashboardData, DashboardAlert } from "@/types/dashboard";
import {
  Banknote,
  ShoppingCart,
  Users,
  Container,
  Droplets,
} from "lucide-react";

export function useWaterDashboard() {
  // Date Filter State
  const [dateRange, setDateRange] = useState("today");
  const [data, setData] = useState<WaterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mark Containers as Returned
  const markReturned = async (customerId: string) => {
    try {
      await supabase
        .from("customers")
        .update({ container_balance: 0 })
        .eq("id", customerId);
      // Refresh dashboard after update
      fetchDashboard();
    } catch (error) {
      console.error("Failed to update container balance:", error);
    }
  };

  async function fetchDashboard() {
    try {
      setLoading(true);
      const todayStr = new Date().toLocaleDateString("en-CA");

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .gte("transaction_date", sevenDaysAgo.toLocaleDateString("en-CA"))
        .order("created_at", { ascending: false });

      const { data: customersData } = await supabase
        .from("customers")
        .select("id, name, container_balance")
        .gt("container_balance", 0)
        .order("container_balance", { ascending: false });

      const transactions = txData || [];
      const customers = customersData || [];

      const todayTxs = transactions.filter(
        (tx) => tx.transaction_date === todayStr,
      );
      const todayGallons = todayTxs.reduce(
        (sum, tx) => sum + (tx.new_gallon || 0),
        0,
      );
      const todayRevenue = todayGallons * 45;

      const activeCustomerIds = new Set(
        todayTxs.filter((tx) => tx.customer_id).map((tx) => tx.customer_id),
      );
      const totalContainersOut = customers.reduce(
        (sum, c) => sum + (c.container_balance || 0),
        0,
      );

      let walkInCount = 0;
      let deliveryCount = 0;
      todayTxs.forEach((tx) =>
        tx.is_walk_in ? walkInCount++ : deliveryCount++,
      );

      // Today's Summary Calculations
      const avgSale = todayTxs.length > 0 ? todayRevenue / todayTxs.length : 0;

      // Action Center Logic
      const alerts: DashboardAlert[] = [];
      const overdueCustomers = customers.filter(
        (c) => c.container_balance >= 5,
      );

      if (overdueCustomers.length > 0) {
        alerts.push({
          id: "1",
          type: "warning",
          title: "Customers with High Debt (5+)",
          count: overdueCustomers.length,
        });
      }
      if (totalContainersOut > 50) {
        alerts.push({
          id: "2",
          type: "warning",
          title: "Total Containers Out is High",
          count: totalContainersOut,
        });
      }
      if (todayRevenue >= 5000) {
        alerts.push({
          id: "3",
          type: "success",
          title: "Daily Revenue Target Reached!",
        });
      }

      const trendMap: Record<string, number> = {};
      transactions.forEach((tx) => {
        const date = tx.transaction_date;
        if (!trendMap[date]) trendMap[date] = 0;
        trendMap[date] += (tx.new_gallon || 0) * 45;
      });
      const revenueTrend = Object.keys(trendMap)
        .sort()
        .map((date) => ({ label: date.substring(5), value: trendMap[date] }));

      setData({
        revenueToday: {
          label: "Revenue Today",
          value: `₱ ${todayRevenue.toLocaleString()}`,
          icon: Banknote,
          trendText: "Today's Gross",
          trendTone: "positive",
          href: "/transactions",
        },
        txToday: {
          label: "Transactions",
          value: todayTxs.length,
          icon: ShoppingCart,
          trendText: "New Orders",
          trendTone: "positive",
          href: "/transactions",
        },
        activeCustomers: {
          label: "Active Customers",
          value: activeCustomerIds.size,
          icon: Users,
          trendText: "Distinct",
          trendTone: "neutral",
          href: "/customers",
        },
        containersOut: {
          label: "Containers Out",
          value: totalContainersOut,
          icon: Container,
          trendText: "Needs recovery",
          trendTone: "warning",
          href: "/customers",
        },
        gallonsToday: {
          label: "Gallons Sold",
          value: todayGallons,
          icon: Droplets,
          trendText: "Volume",
          trendTone: "positive",
        },
        revenueTrend,
        walkInSplit: { walkIn: walkInCount, delivery: deliveryCount },
        alerts,
        summary: {
          revenue: todayRevenue,
          transactions: todayTxs.length,
          gallons: todayGallons,
          walkIn: walkInCount,
          delivery: deliveryCount,
          avgSale,
        },
        recentTransactions: transactions.slice(0, 6).map((tx) => ({
          id: tx.id || Math.random().toString(),
          name: tx.name || "Anonymous",
          type: tx.type || "Standard",
          gallons: tx.new_gallon || 0,
          isWalkIn: tx.is_walk_in || false,
          time: new Date(tx.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
        followUpList: customers.slice(0, 5).map((c) => ({
          id: c.id,
          name: c.name,
          balance: c.container_balance,
        })),
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, [dateRange]);

  return { data, loading, dateRange, setDateRange, markReturned };
}
