"use client";

import { AlertTriangle, TrendingUp, ShieldAlert } from "lucide-react";
import {
  useContainerBalances,
  getAgingSignal,
} from "@/hooks/useContainerBalances";
import { UnreturnedContainersListProps } from "@/types/containers";
import {
  StatCard,
  EmptyState,
  LoadingState,
  ErrorBanner,
} from "../ui/SharedUI";

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

  // --- 1. HANDLE STANDARD STATES ---

  if (isLoading && balances.length === 0) {
    return <LoadingState message="Loading records..." className="h-64" />;
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={refreshBalances} />;
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Zero Outstanding"
        message="All containers have been successfully returned."
        className="border-y border-ink-dark/10"
      />
    );
  }

  // --- 2. MAIN RENDER ---

  return (
    <div className="w-full">
      <div className="w-full flex flex-col bg-transparent">
        {/* HEADER */}
        <div className="py-4 border-b border-ink-dark/10 flex justify-between items-center">
          <h2 className="text-lg font-bold text-ink-black">Debtor Registry</h2>
          <div className="flex gap-2">
            <span className="bg-ink-dark/5 text-ink-muted ring-1 ring-ink-dark/10 py-1 px-3 rounded-full text-xs font-semibold">
              {globalTotalContainers} Out
            </span>
            <span className="bg-ink-accent/10 text-ink-accent ring-1 ring-ink-accent/20 py-1 px-3 rounded-full text-xs font-semibold">
              {totalCount} Debtors
            </span>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-3 divide-x divide-ink-dark/10 border-b border-ink-dark/10 py-6">
          <StatCard
            label="At-Risk Assets"
            icon={ShieldAlert}
            value={insights.atRiskContainers}
            subtext={`Held by ${insights.criticalCustomers} inactive`}
            colorClass="text-ink-accent"
          />
          <StatCard
            label="Total Value"
            icon={TrendingUp}
            value={`₱ ${insights.assetValue.toLocaleString()}`}
            subtext="Replacement cost"
            colorClass="text-ink-dark"
          />
          <StatCard
            label="Pool Health"
            icon={AlertTriangle}
            value={`${insights.healthPercentage}%`}
            subtext="Active returns"
            colorClass={
              insights.healthPercentage < 70
                ? "text-amber-600"
                : "text-emerald-600"
            }
          />
        </div>

        {/* DATA TABLE */}
        <div className={`overflow-x-auto ${className} relative`}>
          {isLoading && balances.length > 0 && (
            <div className="absolute inset-0 bg-ink-base/50 backdrop-blur-[2px] z-20 flex justify-center items-center">
              <span className="bg-white px-5 py-2.5 rounded-xl shadow-ink-sm border border-ink-dark/10 font-medium text-sm text-ink-dark flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-ink-accent border-t-transparent rounded-full animate-spin"></div>
                Syncing...
              </span>
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-ink-base z-10">
              <tr>
                <th className="w-[25%] py-4 pr-6 text-xs font-semibold text-ink-muted uppercase tracking-wider border-b border-ink-dark/10">
                  Customer
                </th>
                <th className="w-[20%] py-4 px-6 text-xs font-semibold text-ink-muted uppercase tracking-wider border-b border-ink-dark/10">
                  Contact
                </th>
                <th className="w-[25%] py-4 px-6 text-xs font-semibold text-ink-muted uppercase tracking-wider border-b border-ink-dark/10">
                  Last Active
                </th>
                <th className="w-[10%] py-4 px-6 text-xs font-semibold text-ink-muted uppercase tracking-wider border-b border-ink-dark/10 text-right">
                  Owed
                </th>
                <th className="w-[20%] py-4 pl-6 text-xs font-semibold text-ink-muted uppercase tracking-wider border-b border-ink-dark/10 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-dark/5 text-sm">
              {balances.map((row) => {
                const aging = getAgingSignal(row.lastActivityDate);
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-ink-dark/5 transition-colors group"
                  >
                    <td className="py-4 pr-6 font-medium text-ink-black truncate">
                      {row.customerName}
                    </td>
                    <td className="px-6 py-4 text-ink-muted whitespace-nowrap">
                      {row.phoneNumber ? (
                        <a
                          href={`tel:${row.phoneNumber}`}
                          className="hover:text-ink-accent transition-colors"
                        >
                          {row.phoneNumber}
                        </a>
                      ) : (
                        <span className="text-ink-dark/30 italic">
                          Unlisted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-ink-dark">
                          {new Date(row.lastActivityDate).toLocaleDateString()}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${aging.class.replace("bg-gray-100", "bg-ink-dark/5").replace("border-gray-200", "border-ink-dark/10")}`}
                        >
                          {aging.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-base">
                      <span
                        className={
                          row.outstandingBalance >= 5
                            ? "text-ink-accent"
                            : "text-ink-black"
                        }
                      >
                        {row.outstandingBalance}
                      </span>
                    </td>
                    <td className="py-4 pl-6 text-right">
                      <div className="flex justify-end">
                        <div className="flex items-center bg-white border border-ink-dark/10 rounded-lg shadow-ink-sm focus-within:ring-2 focus-within:ring-ink-accent/20 transition-all overflow-hidden">
                          <input
                            type="number"
                            min="1"
                            max={row.outstandingBalance}
                            value={
                              returnInputs[row.id] ?? row.outstandingBalance
                            }
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                e.target.value,
                                row.outstandingBalance,
                              )
                            }
                            className="w-14 px-3 py-1.5 text-sm text-center bg-transparent focus:outline-none text-ink-black font-medium"
                          />
                          <div className="w-px h-5 bg-ink-dark/10"></div>
                          <button
                            onClick={() =>
                              handleLogReturn(row.id, row.outstandingBalance)
                            }
                            className="text-sm font-semibold px-4 py-1.5 bg-ink-base text-ink-dark hover:bg-ink-accent hover:text-white transition-colors"
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

        {/* PAGINATION */}
        <div className="py-4 border-t border-ink-dark/10 flex items-center justify-between">
          <p className="text-sm text-ink-muted">
            {totalCount > pageSize ? (
              <>
                Showing{" "}
                <span className="font-medium text-ink-black">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-ink-black">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-ink-black">{totalCount}</span>
              </>
            ) : (
              <>
                Showing all{" "}
                <span className="font-medium text-ink-black">{totalCount}</span>{" "}
                debtors
              </>
            )}
          </p>
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1.5 text-sm font-medium text-ink-dark bg-white border border-ink-dark/10 rounded-lg hover:bg-ink-base disabled:opacity-50 shadow-sm transition-colors"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || isLoading}
                className="px-3 py-1.5 text-sm font-medium text-ink-dark bg-white border border-ink-dark/10 rounded-lg hover:bg-ink-base disabled:opacity-50 shadow-sm transition-colors"
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
