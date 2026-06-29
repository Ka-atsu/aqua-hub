"use client";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { WaterDashboardData, DashboardAlert } from "@/types/dashboard";
import {
  Banknote,
  ShoppingCart,
  Users,
  Container,
  Droplets,
} from "lucide-react";

// 1. Strictly define what this hook returns so page.tsx knows what to expect
export interface UseWaterDashboardReturn {
  data: WaterDashboardData | null;
  loading: boolean;
  dateRange: string;
  setDateRange: Dispatch<SetStateAction<string>>;
  markReturned: (customerId: string) => Promise<void>;
  isNewOrderOpen: boolean;
  setIsNewOrderOpen: Dispatch<SetStateAction<boolean>>;
}

// 2. Define the exact shape of the data coming from Supabase
interface TxItem {
  quantity: number;
  container_types: { type_name: string } | null;
}

interface TxRecord {
  transaction_id: string;
  transaction_date: string;
  created_at: string;
  customer_id: string;
  customers: { first_name: string; last_name: string } | null;
  container_transaction_items: TxItem[];
}

interface CustRecord {
  customer_id: string;
  name: string;
  outstanding_balance: number;
}

export function useWaterDashboard(): UseWaterDashboardReturn {
  // Date Filter State
  const [dateRange, setDateRange] = useState("today");
  const [data, setData] = useState<WaterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);

  // Mark Containers as Returned
  const markReturned = async (customerId: string) => {
    try {
      console.warn(
        "To fully clear a balance, insert a negative transaction via RPC or direct insert.",
      );
      // await supabase.rpc("clear_customer_balance", { p_customer_id: customerId });
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

      // Calculate dynamic date gap based on filter state
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

      // For charts, we always want at least 7 days of historical tracking data
      const chartStartDate = new Date();
      chartStartDate.setDate(today.getDate() - 7);
      const chartStartDateStr = chartStartDate.toLocaleDateString("en-CA");

      const finalFetchStartDate =
        startDateStr < chartStartDateStr ? startDateStr : chartStartDateStr;

      // Fetch Relational Data (Header + Items + Customer)
      const { data: txData, error: txError } = await supabase
        .from("container_transactions")
        .select(
          `
          transaction_id,
          transaction_date,
          created_at,
          customer_id,
          customers ( first_name, last_name ),
          container_transaction_items ( quantity, container_types ( type_name ) )
        `,
        )
        .gte("transaction_date", finalFetchStartDate)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      // Fetch Balances from your Normalized View
      const { data: customersData, error: custError } = await supabase
        .from("view_customer_container_balances")
        .select("customer_id, name, outstanding_balance")
        .gt("outstanding_balance", 0)
        .order("outstanding_balance", { ascending: false });

      if (custError) throw custError;

      // Cast the raw data to our strict TypeScript interfaces
      const transactions: TxRecord[] = (txData as unknown as TxRecord[]) || [];
      const customers: CustRecord[] =
        (customersData as unknown as CustRecord[]) || [];

      // Filter transactions to calculate metrics based on the selected window
      const filteredTxs = transactions.filter((tx) => {
        if (dateRange === "today") {
          return tx.transaction_date === todayStr;
        }
        return (
          tx.transaction_date >= startDateStr && tx.transaction_date <= todayStr
        );
      });

      // Aggregate Calculations
      let rangeGallons = 0;

      filteredTxs.forEach((tx) => {
        const txGallons = tx.container_transaction_items.reduce(
          (sum: number, item: TxItem) => {
            return item.quantity > 0 ? sum + item.quantity : sum;
          },
          0,
        );
        rangeGallons += txGallons;
      });

      const rangeRevenue = rangeGallons * 45; // Assuming 45 is your price per gallon

      const activeCustomerIds = new Set(
        filteredTxs.map((tx) => tx.customer_id),
      );

      const totalContainersOut = customers.reduce(
        (sum, c) => sum + (c.outstanding_balance || 0),
        0,
      );

      const walkInCount = 0;
      const deliveryCount = 0;

      const avgSale =
        filteredTxs.length > 0 ? rangeRevenue / filteredTxs.length : 0;

      // Action Center Warnings Logic
      const alerts: DashboardAlert[] = [];
      const overdueCustomers = customers.filter(
        (c) => c.outstanding_balance >= 5,
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

      // Generate Line Trends
      const trendMap: Record<string, number> = {};
      transactions.forEach((tx) => {
        const date = tx.transaction_date;
        if (!trendMap[date]) trendMap[date] = 0;

        const txGallons = tx.container_transaction_items.reduce(
          (sum: number, item: TxItem) => {
            return item.quantity > 0 ? sum + item.quantity : sum;
          },
          0,
        );

        trendMap[date] += txGallons * 45;
      });

      const revenueTrend = Object.keys(trendMap)
        .sort()
        .map((date) => ({ label: date.substring(5), value: trendMap[date] }));

      // Format Data for UI
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
        recentTransactions: transactions.slice(0, 6).map((tx: TxRecord) => {
          const totalGal = tx.container_transaction_items.reduce(
            (sum: number, item: TxItem) => sum + item.quantity,
            0,
          );

          return {
            id: tx.transaction_id,
            name: tx.customers?.first_name || "Unknown",
            type:
              tx.container_transaction_items[0]?.container_types?.type_name ||
              "N/A",
            gallons: totalGal > 0 ? totalGal : 0,
            isWalkIn: false,
            time: new Date(tx.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }),
        followUpList: customers.slice(0, 5).map((c) => ({
          id: c.customer_id,
          name: c.name,
          balance: c.outstanding_balance,
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
