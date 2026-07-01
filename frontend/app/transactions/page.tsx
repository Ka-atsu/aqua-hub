// app/transactions/page.tsx
"use client";

import { useOrders } from "@/hooks/useOrders";
import { Plus, Search, ChevronDown } from "lucide-react";
import { OrderModal, OrderRow } from "@/components/transactions/TransactionUI";

export default function TransactionsPage() {
  const {
    orders,
    totalCount,
    customers,
    loading,
    saving,
    error,
    filters,
    setFilters,
    isModalOpen,
    editingOrder,
    form,
    setForm,
    openAdd,
    openEdit,
    closeModal,
    saveOrder,
    deleteOrder,
  } = useOrders();

  return (
    <div className="h-screen bg-ink-base text-ink-dark overflow-hidden flex flex-col transition-colors duration-500">
      <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-ink-black">
              Transactions
            </h1>
            <p className="text-sm text-ink-muted font-medium">
              {loading
                ? "Loading workspace..."
                : `${orders.length} of ${totalCount} records`}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-ink-black text-white rounded-xl text-sm font-bold hover:bg-ink-dark transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-3" /> New Order
          </button>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full bg-white border border-ink-dark/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-ink-accent outline-none font-semibold text-ink-dark shadow-sm transition-shadow"
            />
          </div>

          <div className="relative">
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value as typeof filters.type,
                })
              }
              className="appearance-none bg-white border border-ink-dark/10 text-ink-dark rounded-xl text-sm font-semibold px-4 py-2.5 pr-10 cursor-pointer focus:ring-2 focus:ring-ink-accent outline-none shadow-sm transition-shadow"
            >
              <option value="all">All Types</option>
              <option value="1">Slim</option>
              <option value="2">Round</option>
            </select>
            <ChevronDown className="w-4 h-4 text-ink-muted absolute right-3 top-3.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="bg-white border border-ink-dark/10 text-ink-dark rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 focus:ring-ink-accent outline-none shadow-sm transition-shadow"
            />
            <span className="text-ink-muted text-sm font-bold">→</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="bg-white border border-ink-dark/10 text-ink-dark rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 focus:ring-ink-accent outline-none shadow-sm transition-shadow"
            />
          </div>
        </div>

        {/* Data Panel: Removed bg-white, border, and shadow to blend into the bg-ink-base background */}
        <div className="bg-transparent flex flex-col min-h-0 w-full relative">
          {/* Header changed to bg-ink-base to blend while remaining sticky */}
          <div className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-ink-dark/10 text-[10px] font-extrabold text-ink-muted uppercase tracking-widest bg-ink-base z-10 sticky top-0">
            <div className="col-span-4">Customer</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-center">Gallons</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2" />
          </div>

          <div className="divide-y divide-ink-dark/5 pb-2">
            {loading ? (
              <div className="py-16 text-center text-sm text-ink-muted font-bold animate-pulse tracking-wide">
                Loading records...
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center text-sm text-ink-muted font-bold tracking-wide">
                No orders found. Try adjusting your filters.
              </div>
            ) : (
              orders.map((order) => {
                // Optimized Name Lookup
                const matchedCustomer = customers.find(
                  (c) => c.customer_id === order.customer_id,
                );
                const customerName = order.is_walk_in
                  ? "Walk-In"
                  : matchedCustomer
                    ? `${matchedCustomer.first_name} ${matchedCustomer.last_name}`
                    : "Unknown";

                return (
                  <OrderRow
                    key={order.id}
                    order={{
                      ...order,
                      is_walk_in: order.is_walk_in ?? false, // Force it to be false if missing
                    }}
                    customers={customers}
                    onEdit={() => openEdit(order)}
                    onDelete={() => {
                      if (confirm(`Delete order for ${customerName}?`))
                        deleteOrder(order.id);
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      </main>

      <OrderModal
        isOpen={isModalOpen}
        isEditing={!!editingOrder}
        form={form}
        setForm={setForm}
        customers={customers}
        onClose={closeModal}
        onSave={saveOrder}
        saving={saving}
        error={error}
      />
    </div>
  );
}
