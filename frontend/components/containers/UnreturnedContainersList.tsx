"use client";

import { AlertTriangle, TrendingUp, ShieldAlert } from "lucide-react";
import {
  useContainerBalances,
  getAgingSignal,
} from "@/hooks/useContainerBalances";
import { UnreturnedContainersListProps } from "@/types/containers";

export default function UnreturnedContainersList({
  className = "",
}: UnreturnedContainersListProps) {
  const {
    balances,
    isLoading,
    error,
    refreshBalances,
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
  } = useContainerBalances();

  if (isLoading && balances.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">
            Loading records...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-red-50/50 border-y border-red-100 flex justify-between items-center w-full">
        <div className="flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-sm font-medium">{error}</p>
        </div>
        <button
          onClick={() => refreshBalances()}
          className="text-sm font-semibold bg-white text-red-700 hover:bg-red-50 border border-red-200 rounded-lg px-4 py-2 transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="p-12 text-center w-full border-y border-gray-100">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6 text-emerald-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Zero Outstanding</h3>
        <p className="text-gray-500 mt-1 text-sm">
          All containers have been successfully returned.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full flex flex-col bg-transparent">
        <div className="py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Debtor Registry</h2>
          <div className="flex gap-2">
            <span className="bg-gray-50 text-gray-600 ring-1 ring-gray-200 py-1 px-3 rounded-full text-xs font-semibold">
              {globalTotalContainers} Out
            </span>
            <span className="bg-blue-50 text-blue-700 ring-1 ring-blue-100 py-1 px-3 rounded-full text-xs font-semibold">
              {totalCount} Debtors
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 py-6">
          <div className="flex flex-col items-center justify-center px-4 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              At-Risk Assets
            </span>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" strokeWidth={2.5} />
              <span className="text-2xl font-extrabold text-gray-900 leading-none">
                {insights.atRiskContainers}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-gray-400 mt-1.5">
              Held by {insights.criticalCustomers} inactive
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-4 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Total Value
            </span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" strokeWidth={2.5} />
              <span className="text-2xl font-extrabold text-gray-900 leading-none">
                ₱ {insights.assetValue.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-gray-400 mt-1.5">
              Replacement cost
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-4 text-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Pool Health
            </span>
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`w-4 h-4 ${insights.healthPercentage < 70 ? "text-amber-500" : "text-emerald-500"}`}
                strokeWidth={2.5}
              />
              <span className="text-2xl font-extrabold text-gray-900 leading-none">
                {insights.healthPercentage}%
              </span>
            </div>
            <span className="text-[10px] font-semibold text-gray-400 mt-1.5">
              Active returns
            </span>
          </div>
        </div>

        <div className={`overflow-x-auto ${className} relative`}>
          {isLoading && balances.length > 0 && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex justify-center items-center">
              <span className="bg-white px-5 py-2.5 rounded-xl shadow-lg border border-gray-100 font-medium text-sm text-gray-600 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Syncing...
              </span>
            </div>
          )}

          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className="py-4 pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  Customer
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  Last Active
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">
                  Owed
                </th>
                <th className="pl-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {balances.map((row) => {
                const aging = getAgingSignal(row.lastActivityDate);

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="py-4 pr-6 font-medium text-gray-900">
                      {row.customerName}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {row.phoneNumber ? (
                        <a
                          href={`tel:${row.phoneNumber}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {row.phoneNumber}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Unlisted</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">
                          {new Date(row.lastActivityDate).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${aging.class}`}
                        >
                          {aging.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-semibold text-base ${row.outstandingBalance >= 5 ? "text-red-600" : "text-gray-900"}`}
                      >
                        {row.outstandingBalance}
                      </span>
                    </td>
                    <td className="py-4 pl-6">
                      <div className="flex items-center justify-end gap-3">
                        {aging.isCritical && (
                          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all overflow-hidden">
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
                            className="w-14 px-3 py-1.5 text-sm text-center bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 font-medium placeholder:text-gray-300"
                            placeholder="Qty"
                          />
                          <div className="w-px h-5 bg-gray-200"></div>
                          <button
                            onClick={() =>
                              handleLogReturn(row.id, row.outstandingBalance)
                            }
                            className="text-sm font-semibold px-4 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
                          >
                            Log
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {totalCount > pageSize ? (
              <>
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-900">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">{totalCount}</span>
              </>
            ) : (
              <>
                Showing all{" "}
                <span className="font-medium text-gray-900">{totalCount}</span>{" "}
                debtors
              </>
            )}
          </p>

          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-colors"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || isLoading}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white shadow-sm transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
