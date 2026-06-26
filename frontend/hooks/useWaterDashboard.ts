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
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

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

      const today = new Date();
      const todayStr = today.toLocaleDateString("en-CA");

      // 1. Calculate dynamic dynamic date gap based on filter state
      let filterStartDate = new Date();
      let labelSuffix = "Today";

      if (dateRange === "7days") {
        filterStartDate.setDate(today.getDate() - 7);
        labelSuffix = "Last 7 Days";
      } else if (dateRange === "30days") {
        filterStartDate.setDate(today.getDate() - 30);
        labelSuffix = "Last 30 Days";
      } else {
        // "today" fallback option
        filterStartDate = today;
        labelSuffix = "Today";
      }

      const startDateStr = filterStartDate.toLocaleDateString("en-CA");

      // For charts, we always want at least 7 days of historical tracking data
      const chartStartDate = new Date();
      chartStartDate.setDate(today.getDate() - 7);
      const chartStartDateStr = chartStartDate.toLocaleDateString("en-CA");

      const finalFetchStartDate =
        startDateStr < chartStartDateStr ? startDateStr : chartStartDateStr;

      // 2. Fetch data from the minimum date required to cover metrics + charts
      const { data: txData } = await supabase
        .from("transactions")
        .select("*")
        .gte("transaction_date", finalFetchStartDate)
        .order("created_at", { ascending: false });

      const { data: customersData } = await supabase
        .from("customers")
        .select("id, name, container_balance")
        .gt("container_balance", 0)
        .order("container_balance", { ascending: false });

      const transactions = txData || [];
      const customers = customersData || [];

      // 3. Filter transactions to calculate metrics based on the selected window
      const filteredTxs = transactions.filter((tx) => {
        if (dateRange === "today") {
          return tx.transaction_date === todayStr;
        }
        // Matches anything within the selected past window down to today
        return (
          tx.transaction_date >= startDateStr && tx.transaction_date <= todayStr
        );
      });

      // Aggregate Calculations for Selected Window
      const rangeGallons = filteredTxs.reduce(
        (sum, tx) => sum + (tx.new_gallon || 0),
        0,
      );
      const rangeRevenue = rangeGallons * 45;

      const activeCustomerIds = new Set(
        filteredTxs.filter((tx) => tx.customer_id).map((tx) => tx.customer_id),
      );

      const totalContainersOut = customers.reduce(
        (sum, c) => sum + (c.container_balance || 0),
        0,
      );

      let walkInCount = 0;
      let deliveryCount = 0;
      filteredTxs.forEach((tx) =>
        tx.is_walk_in ? walkInCount++ : deliveryCount++,
      );

      const avgSale =
        filteredTxs.length > 0 ? rangeRevenue / filteredTxs.length : 0;

      // Action Center Warnings Logic
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
      if (rangeRevenue >= 5000) {
        alerts.push({
          id: "3",
          type: "success",
          title: "Revenue Target Milestone Reached!",
        });
      }

      // Generate Line Trends using the underlying database records
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
          label: `Revenue (${labelSuffix})`,
          value: `₱ ${rangeRevenue.toLocaleString()}`,
          icon: Banknote,
          trendText: `${labelSuffix} Gross`,
          trendTone: "positive",
          href: "/transactions",
        },
        txToday: {
          label: `Transactions (${labelSuffix})`,
          value: filteredTxs.length,
          icon: ShoppingCart,
          trendText: "Orders Count",
          trendTone: "positive",
          href: "/transactions",
        },
        activeCustomers: {
          label: "Active Customers",
          value: activeCustomerIds.size,
          icon: Users,
          trendText: "Distinct",
          trendTone: "neutral",
        },
        containersOut: {
          label: "Containers Out",
          value: totalContainersOut,
          icon: Container,
          trendText: "Needs recovery",
          trendTone: "warning",
          href: "/containers",
        },
        gallonsToday: {
          label: `Gallons Sold (${labelSuffix})`,
          value: rangeGallons,
          icon: Droplets,
          trendText: "Volume Poured",
          trendTone: "positive",
        },
        revenueTrend,
        walkInSplit: { walkIn: walkInCount, delivery: deliveryCount },
        alerts,
        summary: {
          revenue: rangeRevenue,
          transactions: filteredTxs.length,
          gallons: rangeGallons,
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

  return {
    data,
    loading,
    dateRange,
    setDateRange,
    markReturned,
    isNewOrderOpen,
    setIsNewOrderOpen,
  };
}
