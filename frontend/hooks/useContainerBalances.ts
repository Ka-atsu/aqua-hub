import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { ContainerBalance } from "@/types/containers";

// Helper function moved here so the UI file stays clean
export function getAgingSignal(lastActive: string) {
  const daysOld = Math.floor(
    (new Date().getTime() - new Date(lastActive).getTime()) /
      (1000 * 3600 * 24),
  );

  if (daysOld >= 30)
    return {
      label: "Critical",
      class: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
      isCritical: true,
    };
  if (daysOld >= 7)
    return {
      label: "Warning",
      class: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
      isCritical: false,
    };
  return {
    label: "Normal",
    class: "bg-gray-50 text-gray-600 ring-1 ring-gray-500/10",
    isCritical: false,
  };
}

export function useContainerBalances(pageSize = 50) {
  const [balances, setBalances] = useState<ContainerBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [globalTotalContainers, setGlobalTotalContainers] = useState(0);

  // --- UI STATE MOVED FROM COMPONENT ---
  const [returnInputs, setReturnInputs] = useState<Record<string, string>>({});

  const refreshBalances = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const {
        data,
        error: dbError,
        count,
      } = await supabase
        .from("view_customer_container_balances")
        .select("*", { count: "exact" })
        .gt("outstanding_balance", 0)
        .order("outstanding_balance", { ascending: false })
        .range(from, to);

      if (dbError) throw dbError;
      if (count !== null) setTotalCount(count);

      const { data: allBalances, error: sumError } = await supabase
        .from("view_customer_container_balances")
        .select("outstanding_balance")
        .gt("outstanding_balance", 0);

      if (!sumError && allBalances) {
        const total = allBalances.reduce(
          (sum, row) => sum + (Number(row.outstanding_balance) || 0),
          0,
        );
        setGlobalTotalContainers(total);
      }

      const formattedBalances: ContainerBalance[] = (data || []).map((row) => ({
        id: row.customer_id,
        customerName: row.name || "Unknown Customer",
        phoneNumber: row.contact_number || null,
        outstandingBalance: row.outstanding_balance || 0,
        lastActivityDate: new Date().toISOString(), // In normalized schema, track via latest transaction timestamp
      }));

      setBalances(formattedBalances);
    } catch (err: any) {
      console.error("Error loading normalized balances:", err.message);
      setError("Failed to load container data.");
    } finally {
      setIsLoading(false);
    }
  };

  const logReturn = async (customerId: string, quantity: number) => {
    try {
      const { data: typeData, error: typeError } = await supabase
        .from("container_types")
        .select("container_type_id")
        .eq("type_name", "ROUND")
        .single();

      if (typeError || !typeData)
        throw new Error("Could not find ROUND container type.");

      const { data: txData, error: txError } = await supabase
        .from("container_transactions")
        .insert({
          customer_id: customerId,
          transaction_date: new Date().toISOString().split("T")[0],
        })
        .select("transaction_id")
        .single();

      if (txError || !txData) throw txError;

      const { error: itemError } = await supabase
        .from("container_transaction_items")
        .insert({
          transaction_id: txData.transaction_id,
          container_type_id: typeData.container_type_id,
          quantity: -Math.abs(quantity),
        });

      if (itemError) throw itemError;

      refreshBalances(currentPage);
    } catch (err: any) {
      console.error("Error logging return:", err.message);
      alert(`Failed to log the return: ${err.message}`);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else {
      refreshBalances(currentPage);
    }
  }, [currentPage, totalPages]);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // --- UI LOGIC MOVED FROM COMPONENT ---
  const insights = useMemo(() => {
    let atRiskContainers = 0;
    let criticalCustomers = 0;

    balances.forEach((row) => {
      const daysOld = Math.floor(
        (new Date().getTime() - new Date(row.lastActivityDate).getTime()) /
          (1000 * 3600 * 24),
      );
      if (daysOld >= 30) {
        atRiskContainers += row.outstandingBalance;
        criticalCustomers += 1;
      }
    });

    const REPLACEMENT_COST = 150;
    const assetValue = globalTotalContainers * REPLACEMENT_COST;

    const healthyCustomers = balances.length - criticalCustomers;
    const healthPercentage =
      balances.length > 0
        ? Math.round((healthyCustomers / balances.length) * 100)
        : 100;

    return {
      atRiskContainers,
      criticalCustomers,
      assetValue,
      healthPercentage,
    };
  }, [balances, globalTotalContainers]);

  const handleInputChange = (id: string, val: string, max: number) => {
    const num = parseInt(val, 10);
    if (val === "") {
      setReturnInputs((prev) => ({ ...prev, [id]: "" }));
    } else if (!isNaN(num) && num >= 1 && num <= max) {
      setReturnInputs((prev) => ({ ...prev, [id]: num.toString() }));
    }
  };

  const handleLogReturn = async (id: string, max: number) => {
    const qty = parseInt(returnInputs[id] || max.toString(), 10);
    await logReturn(id, qty);
    setReturnInputs((prev) => ({ ...prev, [id]: "" }));
  };

  return {
    balances,
    isLoading,
    error,
    refreshBalances: () => refreshBalances(currentPage),
    logReturn,
    currentPage,
    totalPages,
    totalCount,
    globalTotalContainers,
    goToNextPage,
    goToPrevPage,
    pageSize,
    returnInputs,
    insights,
    handleInputChange,
    handleLogReturn,
  };
}
