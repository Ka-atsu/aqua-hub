import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ContainerBalance } from "@/types/containers";

export function useContainerBalances(pageSize = 50) {
  const [balances, setBalances] = useState<ContainerBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Aggregation state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // Total Debtors
  const [globalTotalContainers, setGlobalTotalContainers] = useState(0); // Total Containers Out

  const refreshBalances = async (page = currentPage) => {
    try {
      setIsLoading(true);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // 1. Fetch paginated customers
      const {
        data,
        error: dbError,
        count,
      } = await supabase
        .from("customers")
        .select("*", { count: "exact" })
        .gt("container_balance", 0)
        .order("container_balance", { ascending: false })
        .range(from, to);

      if (dbError) throw dbError;

      // 2. Fetch global container sum via RPC
      const { data: sumData, error: sumError } = await supabase.rpc(
        "get_total_outstanding_containers",
      );

      if (sumError) console.error("Error fetching global sum:", sumError);

      if (count !== null) setTotalCount(count);
      if (sumData !== null) setGlobalTotalContainers(sumData as number);

      const formattedBalances: ContainerBalance[] = (data || []).map(
        (customer) => ({
          id: customer.id,
          customerName: customer.name || "Unknown Customer",
          phoneNumber: customer.phone || customer.phone_number || null,
          outstandingBalance: customer.container_balance || 0,
          lastActivityDate:
            customer.updated_at ||
            customer.created_at ||
            new Date().toISOString(),
        }),
      );

      setBalances(formattedBalances);
    } catch (err: any) {
      console.error("Error fetching container balances:", err.message);
      setError("Failed to load container data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log a partial or full return
  const logReturn = async (customerId: string, quantity: number) => {
    try {
      const { error: rpcError } = await supabase.rpc("log_container_return", {
        p_customer_id: customerId,
        p_return_quantity: quantity,
      });

      if (rpcError) throw rpcError;

      // Refresh the page data immediately after success
      refreshBalances(currentPage);
    } catch (err: any) {
      console.error("Error logging return:", err.message);
      alert("Failed to log the return. Please try again.");
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
