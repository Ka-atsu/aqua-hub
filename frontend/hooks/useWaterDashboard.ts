"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import {
  WaterDashboardData,
  AnalyticsViewRecord,
  CustRecord,
} from "@/types/dashboard";
import {
  Banknote,
  ShoppingCart,
  Users,
  Container,
  Droplets,
} from "lucide-react";

export interface UseWaterDashboardReturn {
  data: WaterDashboardData | null;
  loading: boolean;
  dateRange: string;
  setDateRange: Dispatch<SetStateAction<string>>;
  markReturned: (customerId: string) => Promise<void>;
  isNewOrderOpen: boolean;
  setIsNewOrderOpen: Dispatch<SetStateAction<boolean>>;
}

export function useWaterDashboard(): UseWaterDashboardReturn {
  const [dateRange, setDateRange] = useState("today");
  const [data, setData] = useState<WaterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  const markReturned = async (customerId: string) => {
    try {
      console.warn("To fully clear a balance, insert a negative transaction.");
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

      let filterStartDate = new Date();
      let labelSuffix = "Today";

      if (dateRange === "7days") {
        filterStartDate.setDate(today.getDate() - 7);
        labelSuffix = "Last 7 Days";
      } else if (dateRange === "30days") {
        filterStartDate.setDate(today.getDate() - 30);
        labelSuffix = "Last 30 Days";
      } else {
        filterStartDate = today;
        labelSuffix = "Today";
      }

      const startDateStr = filterStartDate.toLocaleDateString("en-CA");

      // 1. Fetch directly from your new view
      const { data: viewData, error: viewError } = await supabase
        .from("view_dashboard_analytics")
        .select(
          `
            transaction_id,
            transaction_date,
            customer_id,
            customer_name,
            quantity,
            container_type_id,
            type_name
          `,
        )
        .gte("transaction_date", startDateStr)
        .order("transaction_date", { ascending: false });

      if (viewError) throw viewError;

      // 2. Fetch Container Balances
      const { data: customersData, error: custError } = await supabase
        .from("view_customer_container_balances")
        .select("customer_id, name, outstanding_balance")
        .gt("outstanding_balance", 0)
        .order("outstanding_balance", { ascending: false });

      if (custError) throw custError;

      const transactions: AnalyticsViewRecord[] =
        (viewData as unknown as AnalyticsViewRecord[]) || [];
      const customers: CustRecord[] =
        (customersData as unknown as CustRecord[]) || [];

      // 3. Filter for top KPI cards based on dropdown (Today, 7days, 30days)
      const filteredTxs = transactions.filter((tx) => {
        if (dateRange === "today") return tx.transaction_date === todayStr;
        return (
          tx.transaction_date >= startDateStr && tx.transaction_date <= todayStr
        );
      });

      // Calculate KPI Aggregations safely
      let rangeGallons = 0;
      let rangeRevenue = 0;

      filteredTxs.forEach((tx) => {
        const safeQty = Number(tx.quantity) || 0;
        const safeAmt =
          tx.amount !== undefined && tx.amount !== null
            ? Number(tx.amount)
            : safeQty > 0
              ? safeQty * 45
              : 0; // Fallback math if amount is missing

        if (safeQty > 0) rangeGallons += safeQty;
        rangeRevenue += safeAmt;
      });

      const activeCustomerIds = new Set(
        filteredTxs.map((tx) => tx.customer_id).filter(Boolean),
      );
      const totalContainersOut = customers.reduce(
        (sum, c) => sum + (c.outstanding_balance || 0),
        0,
      );
      const avgSale =
        filteredTxs.length > 0 ? rangeRevenue / filteredTxs.length : 0;

      // 4. Final Output to Dashboard
      setData({
        revenueToday: {
          label: `Revenue (${labelSuffix})`,
          value: `₱ ${rangeRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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

        // Chart data is removed, returning empty arrays to satisfy TS interface
        historicalTrends: [],
        recentTrend: [],

        worstOffenders: customers.slice(0, 5).map((c) => ({
          name: c.name || "Unknown Customer",
          balance: c.outstanding_balance || 0,
        })),

        walkInSplit: { walkIn: 0, delivery: filteredTxs.length },
        alerts: [],
        summary: {
          revenue: rangeRevenue,
          transactions: filteredTxs.length,
          gallons: rangeGallons,
          walkIn: 0,
          delivery: filteredTxs.length,
          avgSale,
        },
        recentTransactions: [],
        followUpList: [],
      } as WaterDashboardData);
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
