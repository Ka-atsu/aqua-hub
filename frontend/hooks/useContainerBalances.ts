import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ContainerBalance } from "@/types/containers";

export function useContainerBalances(pageSize = 50) {
  const [balances, setBalances] = useState<ContainerBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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
        .from("customers")
        .select("*", { count: "exact" })
        .gt("container_balance", 0)
        .order("container_balance", { ascending: false })
        .range(from, to);

      if (dbError) throw dbError;

      if (count !== null) setTotalCount(count);

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

  // Function to zero out a customer's debt
  const markReturned = async (customerId: string) => {
    try {
      // Opting for a localized loading feel, or just block UI slightly
      // Using Supabase update to set balance to 0
      const { error: updateError } = await supabase
        .from("customers")
        .update({ container_balance: 0 })
        .eq("id", customerId);

      if (updateError) throw updateError;

      // Refresh the page data immediately after success
      refreshBalances(currentPage);
    } catch (err: any) {
      console.error("Error updating balance:", err.message);
      alert("Failed to mark containers as returned. Please try again.");
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
    markReturned,
    currentPage,
    totalPages,
    totalCount,
    goToNextPage,
    goToPrevPage,
    pageSize,
  };
}
