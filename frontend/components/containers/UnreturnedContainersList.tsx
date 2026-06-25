// components/containers/UnreturnedContainersList.tsx
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
    currentPage,
    totalPages,
    totalCount,
    goToNextPage,
    goToPrevPage,
    pageSize,
  } = useContainerBalances();

  if (isLoading && balances.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 border rounded-lg bg-gray-50">
        <p className="text-gray-500 animate-pulse">Loading container data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="p-8 text-center border rounded-lg bg-green-50">
        <h3 className="text-lg font-semibold text-green-700">All Clear!</h3>
        <p className="text-green-600">
          No customers currently owe you any containers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
        <h2 className="text-lg font-semibold text-gray-800">
          Unreturned Containers
        </h2>
        <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-sm font-medium">
          {totalCount} Total Debtors
        </span>
      </div>

      <div className={`overflow-y-auto ${className}`}>
        {isLoading && balances.length > 0 && (
          <div className="absolute inset-0 bg-white/50 z-20 flex justify-center items-center">
            <span className="bg-white px-4 py-2 rounded-lg shadow-md font-medium text-gray-600">
              Loading page...
            </span>
          </div>
        )}
        <table className="w-full text-left border-collapse relative">
          <thead className="sticky top-0 bg-gray-50 shadow-sm z-10 text-sm text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium border-b border-gray-200">
                Customer Name
              </th>
              <th className="px-6 py-3 font-medium border-b border-gray-200">
                Phone Number
              </th>
              <th className="px-6 py-3 font-medium border-b border-gray-200">
                Last Activity
              </th>
              <th className="px-6 py-3 font-medium border-b border-gray-200 text-right">
                Owed
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {balances.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {row.customerName}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {row.phoneNumber ? (
                    <a
                      href={`tel:${row.phoneNumber}`}
                      className="text-blue-600 hover:underline"
                    >
                      {row.phoneNumber}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">No number</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600 text-sm">
                  {new Date(row.lastActivityDate).toLocaleDateString()}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* NEW PAGINATION FOOTER */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
        <p className="text-sm text-gray-600">
          Showing{" "}
          <span className="font-medium">
            {(currentPage - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, totalCount)}
          </span>{" "}
          of <span className="font-medium">{totalCount}</span> results
        </p>
        <div className="flex space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={goToNextPage}
            disabled={
              currentPage === totalPages || totalPages === 0 || isLoading
            }
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
