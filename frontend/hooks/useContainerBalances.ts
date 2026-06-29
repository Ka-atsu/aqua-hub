import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ContainerBalance } from "@/types/containers";

export function useContainerBalances(pageSize = 50) {
  const [balances, setBalances] = useState<ContainerBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 1. Re-added global total state
  const [globalTotalContainers, setGlobalTotalContainers] = useState(0);

  const refreshBalances = async (page = currentPage) => {
    try {
      setIsLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Query the normalized view for paginated table data
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

      // 2. Fetch all outstanding balances to calculate the true global total
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

  // Log a return as a negative quantity transaction (2-Table Schema)
  const logReturn = async (customerId: string, quantity: number) => {
    try {
      // Step 1: Find the container_type_id for "ROUND"
      const { data: typeData, error: typeError } = await supabase
        .from("container_types")
        .select("container_type_id")
        .eq("type_name", "ROUND")
        .single();

      if (typeError || !typeData)
        throw new Error("Could not find ROUND container type.");

      // Step 2: Insert the Transaction Header
      const { data: txData, error: txError } = await supabase
        .from("container_transactions")
        .insert({
          customer_id: customerId,
          transaction_date: new Date().toISOString().split("T")[0],
        })
        .select("transaction_id")
        .single();

      if (txError || !txData) throw txError;

      // Step 3: Insert the Transaction Item with the negative quantity
      const { error: itemError } = await supabase
        .from("container_transaction_items")
        .insert({
          transaction_id: txData.transaction_id,
          container_type_id: typeData.container_type_id,
          quantity: -Math.abs(quantity), // Negative signifies a return
        });

      if (itemError) throw itemError;

      // Success! Refresh the UI
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
  };
}
