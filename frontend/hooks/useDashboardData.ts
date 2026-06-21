import { useState } from "react";
import { DashboardDataProps } from "../types/dashboard";
import {
  defaultHeroActions,
  defaultDeliveryStats,
  defaultMetricCards,
  defaultSalesRows,
  defaultPeriodLabels,
  defaultActivity,
  defaultInventory,
} from "../data/mockData";

export function useDashboardData() {
  const [salesPeriod, setSalesPeriod] = useState<string>("Weekly");

  // Data aggregated from your TransactionRecord SQL table [cite: 977-981]
  const salesGraphData = {
    labels: ["Jun 27", "Jun 28", "Jun 29", "Jun 30", "Jul 01", "Jul 02"],
    values: [465, 540, 360, 435, 495, 270],
  };

  const dashboardData: DashboardDataProps = {
    dateRangeLabel: "Jun 27, 2024 - Jul 02, 2024",
    periodLabel: "Last 7 days",
    totalSales: {
      label: "Total Sales",
      value: "₱ 2,565.00",
      trend: { value: "12.5%", direction: "up", tone: "positive" },
    },
    heroActions: defaultHeroActions,
    deliveryStats: defaultDeliveryStats,
    metricCards: defaultMetricCards,
    salesRows: defaultSalesRows,
    periodLabels: defaultPeriodLabels,
    activity: defaultActivity,
    inventory: defaultInventory,
  };

  return {
    data: { ...dashboardData, salesGraphData },
    state: { salesPeriod },
    actions: {
      setSalesPeriod,
      handleExport: () => console.log("Exporting..."),
    },
  };
}
