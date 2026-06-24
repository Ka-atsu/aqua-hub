// app/dashboard/page.tsx
"use client";
import { useState } from "react";
import { useWaterDashboard } from "@/hooks/useWaterDashboard";
import {
  KpiCard,
  DashboardPanel,
  SplitBar,
} from "@/components/dashboard/DashboardUI";
import { AlertCircle, Droplets, Calendar } from "lucide-react";

// Helper to format dates to YYYY-MM-DD for standard inputs
const formatDate = (date: Date) => date.toLocaleDateString("en-CA");

export default function DashboardPage() {
  // Initialize state with the last 7 days by default
  const [endDate, setEndDate] = useState(formatDate(new Date()));
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatDate(d);
  });



  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
    </div>
  );
}
