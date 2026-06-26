"use client";

import { useContainerBalances } from "@/hooks/useContainerBalances";

interface UnreturnedContainersListProps {
  className?: string;
}

export default function UnreturnedContainersList({
  className = "",
}: UnreturnedContainersListProps) {
  const {
    balances,
    isLoading,
    error,
    refreshBalances,
    markReturned,
    currentPage,
    totalPages,
    totalCount,
    goToNextPage,
    goToPrevPage,
    pageSize,
  } = useContainerBalances();

  // 1. ACCESSIBILITY & CONTRAST: Better loading visual and screen-reader support
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

  // 2. HIERARCHY & CONTRAST: High contrast error state with clear actionable retry
  if (error) {
    return (
      <div
        className="p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center"
        role="alert"
      >
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={() => refreshBalances()}
          className="text-sm font-semibold text-red-700 hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-2 py-1 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 3. ALIGNMENT & CONSISTENCY: Clean, centered empty state
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
        <span className="bg-red-50 text-red-700 border border-red-100 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide">
          {totalCount} Debtors
        </span>
      </div>

      <div className={`overflow-y-auto ${className} relative`}>
        {/* Loading Overlay */}
        {isLoading && balances.length > 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex justify-center items-center">
            <span className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 font-medium text-gray-700">
              Updating...
            </span>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          {/* 4. CONSISTENCY & HIERARCHY: Uppercase, smaller headers for SaaS feel */}
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
              <th className="px-6 py-4 border-b border-gray-200 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {balances.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50/80 transition-colors group"
              >
                {/* Primary Info (High Hierarchy) */}
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {row.customerName}
                </td>

                {/* Actionable Link (Accessibility/Contrast) */}
                <td className="px-6 py-4 text-sm text-gray-600">
                  {row.phoneNumber ? (
                    <a
                      href={`tel:${row.phoneNumber}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 -ml-1 transition-colors"
                    >
                      {row.phoneNumber}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Unlisted</span>
                  )}
                </td>

                {/* Secondary Info (Low Hierarchy) */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(row.lastActivityDate).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </td>

                {/* 5. ALIGNMENT & CONTRAST: Strict right alignment, clear coloring */}
                <td className="px-6 py-4 text-right">
                  <span
                    className={`inline-flex items-center justify-center font-bold text-lg ${
                      row.outstandingBalance >= 5
                        ? "text-red-600"
                        : "text-orange-600"
                    }`}
                  >
                    {row.outstandingBalance}
                  </span>
                </td>

                {/* 6. PROGRESSIVE DISCLOSURE: Button is visually quiet until hovered */}
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => markReturned(row.id)}
                    aria-label={`Mark all ${row.outstandingBalance} containers returned for ${row.customerName}`}
                    className="text-sm font-medium bg-white text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 border border-gray-300 px-4 py-1.5 rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 shadow-sm"
                  >
                    Returned
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 7. PROXIMITY: Grouped pagination controls clearly at the bottom */}
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
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors shadow-sm"
          >
            Prev
          </button>
          <button
            onClick={goToNextPage}
            disabled={
              currentPage === totalPages || totalPages === 0 || isLoading
            }
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
