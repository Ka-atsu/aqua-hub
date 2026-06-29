"use client";

import { useState, useMemo } from "react";
import { useContainerBalances } from "@/hooks/useContainerBalances";
import { AlertTriangle, TrendingUp, ShieldAlert } from "lucide-react";

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
      isCritical: true,
    };
  if (daysOld >= 7)
    return {
      label: "Warning",
      class: "bg-orange-100 text-orange-800 border-orange-200",
      isCritical: false,
    };
  return {
    label: "Normal",
    class: "bg-gray-100 text-gray-600 border-gray-200",
    isCritical: false,
  };
}

// Sub-component for the Insight Cards
function InsightCard({ title, value, subtext, icon: Icon, colorClass }: any) {
  return (
    <div
      className={`p-4 rounded-xl border ${colorClass} flex items-start gap-4`}
    >
      <div className="p-3 bg-white/60 rounded-lg shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <h4 className="text-2xl font-bold mt-1">{value}</h4>
        <p className="text-xs mt-1 opacity-75">{subtext}</p>
      </div>
    </div>
  );
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

  // Calculate Insights on the fly based on the current page's data
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

  const handleLogReturn = (id: string, max: number) => {
    const qty = parseInt(returnInputs[id] || max.toString(), 10); // Defaults to full return
    logReturn(id, qty);
    setReturnInputs((prev) => ({ ...prev, [id]: "" }));
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
          <span className="bg-gray-50 text-gray-700 border border-gray-200 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide">
            {totalCount} Debtors
          </span>
        </div>
      </div>

      {/* DASHBOARD INSIGHTS */}
      <div className="p-6 bg-gray-50/50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <InsightCard
          title="At-Risk Assets"
          value={insights.atRiskContainers}
          subtext={`Held by ${insights.criticalCustomers} inactive customers`}
          icon={ShieldAlert}
          colorClass="bg-red-50 text-red-900 border-red-100"
        />
        <InsightCard
          title="Total Asset Value"
          value={`₱ ${insights.assetValue.toLocaleString()}`}
          subtext="Replacement cost (₱150/ea)"
          icon={TrendingUp}
          colorClass="bg-blue-50 text-blue-900 border-blue-100"
        />
        <InsightCard
          title="Active Pool Health"
          value={`${insights.healthPercentage}%`}
          subtext="Of listed customers returned recently"
          icon={AlertTriangle}
          colorClass={
            insights.healthPercentage < 70
              ? "bg-orange-50 text-orange-900 border-orange-100"
              : "bg-green-50 text-green-900 border-green-100"
          }
        />
      </div>

      {/* TABLE SECTION */}
      <div className={`overflow-y-auto ${className} relative`}>
        {isLoading && balances.length > 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex justify-center items-center">
            <span className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 font-medium text-gray-700">
              Updating...
            </span>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-100 shadow-sm z-10 text-xs uppercase tracking-wider font-semibold text-gray-700">
            <tr>
              <th className="px-6 py-4 border-b border-r border-gray-200">
                Customer
              </th>
              <th className="px-6 py-4 border-b border-r border-gray-200">
                Contact
              </th>
              <th className="px-6 py-4 border-b border-r border-gray-200">
                Last Active
              </th>
              <th className="px-6 py-4 border-b border-r border-gray-200 text-right">
                Owed
              </th>
              <th className="px-6 py-4 border-b border-gray-200 text-center w-52">
                Log Return
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {balances.map((row) => {
              const aging = getAgingSignal(row.lastActivityDate);

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50/80 transition-colors group ${aging.isCritical ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-6 py-4 font-semibold text-gray-900 border-r border-gray-200">
                    {row.customerName}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 border-r border-gray-200">
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

                  <td className="px-6 py-4 text-sm text-gray-500 border-r border-gray-200">
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

                  {/* RIGHT ALIGNED NUMBERS */}
                  <td className="px-6 py-4 text-right border-r border-gray-200">
                    <span
                      className={`inline-flex items-center justify-center font-bold text-lg ${row.outstandingBalance >= 5 ? "text-red-600" : "text-gray-700"}`}
                    >
                      {row.outstandingBalance}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      {/* CRITICAL WARNING ICON */}
                      {aging.isCritical && (
                        <div title="Recovery Target" className="shrink-0">
                          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                        </div>
                      )}

                      {/* JOINED ACTION GROUP */}
                      <div
                        className={`flex items-center border rounded-md overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all ${
                          aging.isCritical
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      >
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
                          className="w-12 px-2 py-1.5 text-sm text-center bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900"
                          title="Qty to return"
                        />

                        {/* VERTICAL DIVIDER */}
                        <div
                          className={`w-px h-5 ${aging.isCritical ? "bg-red-200" : "bg-gray-200"}`}
                        ></div>

                        <button
                          onClick={() =>
                            handleLogReturn(row.id, row.outstandingBalance)
                          }
                          className={`text-sm font-semibold px-4 py-1.5 transition-colors focus:outline-none ${
                            aging.isCritical
                              ? "bg-red-50 text-red-700 hover:bg-red-600 hover:text-white"
                              : "bg-gray-50 text-gray-700 hover:bg-blue-600 hover:text-white"
                          }`}
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
      <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
        <p className="text-sm text-gray-500">
          {totalCount > pageSize ? (
            <>
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">{totalCount}</span>
            </>
          ) : (
            <>
              Showing all{" "}
              <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
              debtors
            </>
          )}
        </p>
        {totalPages > 1 && (
          <div className="flex space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1 || isLoading}
              className="..."
            >
              Prev
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || isLoading}
              className="..."
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
