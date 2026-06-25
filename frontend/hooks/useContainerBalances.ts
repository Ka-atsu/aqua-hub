// hooks/useContainerBalances.ts
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

      // Calculate the Supabase range (0-indexed)
      // Page 1: 0 to 49. Page 2: 50 to 99.
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Notice { count: "exact" } - this tells Supabase to return the total matching rows!
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
          totalBorrowed: 0,
          totalReturned: 0,
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

  // Trigger fetch when currentPage changes
  useEffect(() => {
    refreshBalances(currentPage);
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / pageSize);

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
    currentPage,
    totalPages,
    totalCount,
    goToNextPage,
    goToPrevPage,
    pageSize,
  };
}
