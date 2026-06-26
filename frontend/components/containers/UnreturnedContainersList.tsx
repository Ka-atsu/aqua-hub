"use client";

import { useState } from "react";
import { useContainerBalances } from "@/hooks/useContainerBalances";

interface UnreturnedContainersListProps {
  className?: string;
}

// Helper for aging signal
function getAgingSignal(lastActive: string) {
  const daysOld = Math.floor(
    (new Date().getTime() - new Date(lastActive).getTime()) /
      (1000 * 3600 * 24),
  );

  if (daysOld >= 30)
    return {
      label: "Critical",
      class: "bg-red-100 text-red-800 border-red-200",
    };
  if (daysOld >= 7)
    return {
      label: "Warning",
      class: "bg-orange-100 text-orange-800 border-orange-200",
    };
  return {
    label: "Normal",
    class: "bg-gray-100 text-gray-600 border-gray-200",
  };
}

export default function UnreturnedContainersList({
  className = "",
}: UnreturnedContainersListProps) {
  const {
    balances,
    isLoading,
    error,
    refreshBalances,
    logReturn,
    currentPage,
    totalPages,
    totalCount,
    globalTotalContainers,
    goToNextPage,
    goToPrevPage,
    pageSize,
  } = useContainerBalances();

  // Track partial return inputs per row
  const [returnInputs, setReturnInputs] = useState<Record<string, string>>({});

  const handleInputChange = (id: string, val: string, max: number) => {
    const num = parseInt(val, 10);
    if (val === "") {
      setReturnInputs((prev) => ({ ...prev, [id]: "" }));
    } else if (!isNaN(num) && num >= 1 && num <= max) {
      setReturnInputs((prev) => ({ ...prev, [id]: num.toString() }));
    }
  };

  const handleLogReturn = (id: string, max: number) => {
    const qty = parseInt(returnInputs[id] || max.toString(), 10); // Defaults to full return if left blank
    logReturn(id, qty);
    setReturnInputs((prev) => ({ ...prev, [id]: "" })); // clear input after
  };

  if (isLoading && balances.length === 0) {
    return (
      <div
        className="flex justify-center items-center h-48 border border-gray-200 rounded-lg bg-gray-50"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-gray-600 font-medium animate-pulse">
          Loading container data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center"
        role="alert"
      >
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={() => refreshBalances()}
          className="text-sm font-semibold text-red-700 hover:text-red-900 rounded px-2 py-1"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="p-8 text-center border border-gray-200 rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold text-green-800">All Clear!</h3>
        <p className="text-green-700 mt-1">
          No customers currently owe you any containers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* HEADER SECTION */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
        <h2 className="text-lg font-bold text-gray-900">
          Unreturned Containers
        </h2>
        <div className="flex gap-3">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide">
            {globalTotalContainers} Containers Out
          </span>
          <span className="bg-red-50 text-red-700 border border-red-100 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide">
            {totalCount} Debtors
          </span>
        </div>
      </div>

      <div className={`overflow-y-auto ${className} relative`}>
        {isLoading && balances.length > 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex justify-center items-center">
            <span className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 font-medium text-gray-700">
              Updating...
            </span>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 shadow-sm z-10 text-xs uppercase tracking-wider font-semibold text-gray-600">
            <tr>
              <th className="px-6 py-4 border-b border-gray-200">Customer</th>
              <th className="px-6 py-4 border-b border-gray-200">Contact</th>
              <th className="px-6 py-4 border-b border-gray-200">
                Last Active
              </th>
              <th className="px-6 py-4 border-b border-gray-200 text-right">
                Owed
              </th>
              <th className="px-6 py-4 border-b border-gray-200 text-center w-48">
                Log Return
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {balances.map((row) => {
              const aging = getAgingSignal(row.lastActivityDate);

              return (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {row.customerName}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {row.phoneNumber ? (
                      <a
                        href={`tel:${row.phoneNumber}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {row.phoneNumber}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Unlisted</span>
                    )}
                  </td>

                  {/* AGING SIGNAL ADDED HERE */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <span>
                        {new Date(row.lastActivityDate).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${aging.class}`}
                      >
                        {aging.label}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex items-center justify-center font-bold text-lg ${row.outstandingBalance >= 5 ? "text-red-600" : "text-orange-600"}`}
                    >
                      {row.outstandingBalance}
                    </span>
                  </td>

                  {/* PARTIAL RETURN LOGIC ADDED HERE */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        min="1"
                        max={row.outstandingBalance}
                        value={
                          returnInputs[row.id] !== undefined
                            ? returnInputs[row.id]
                            : row.outstandingBalance
                        }
                        onChange={(e) =>
                          handleInputChange(
                            row.id,
                            e.target.value,
                            row.outstandingBalance,
                          )
                        }
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        title="Qty to return"
                      />
                      <button
                        onClick={() =>
                          handleLogReturn(row.id, row.outstandingBalance)
                        }
                        className="text-sm font-medium bg-white text-gray-700 hover:bg-green-600 hover:text-white border border-gray-300 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                      >
                        Log
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {(currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-gray-900">
            {Math.min(currentPage * pageSize, totalCount)}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{totalCount}</span>
        </p>
        <div className="flex space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 shadow-sm"
          >
            Prev
          </button>
          <button
            onClick={goToNextPage}
            disabled={
              currentPage === totalPages || totalPages === 0 || isLoading
            }
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
