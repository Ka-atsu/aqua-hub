"use client";
import { useOrders, Order, OrderFormData, Customer } from "@/hooks/useOrders";
import {
  Plus, Search, ChevronDown, X, Pencil, Trash2, AlertCircle, UserPlus,
} from "lucide-react";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 block mb-1 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

function OrderModal({
  isOpen, isEditing, form, setForm, customers, onClose, onSave, saving, error,
}: {
  isOpen: boolean; isEditing: boolean; form: OrderFormData;
  setForm: (f: OrderFormData) => void; customers: Customer[];
  onClose: () => void; onSave: () => void; saving: boolean; error: string | null;
}) {
  if (!isOpen) return null;

  function patch(p: Partial<OrderFormData>) { setForm({ ...form, ...p }); }

  const computedAmount = form.quantity * 20;

  const handleCustomerChange = (value: string) => {
    if (value === "__new__") {
      patch({ isNewCustomer: true, customer_id: null });
    } else {
      patch({ isNewCustomer: false, customer_id: value });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs cursor-pointer" onClick={onClose} />
      <form
        onSubmit={(e) => { e.preventDefault(); onSave(); }}
        className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-gray-100 rounded-l-3xl"
      >
        <div className="flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Order" : "New Order"}</h3>
              <p className="text-xs text-gray-400">{isEditing ? "Update order details." : "Log a new water delivery order."}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <div className="space-y-4">
            <Field label="Order Type">
              <div className="flex gap-3 mt-1">
                {[{ label: "Delivery", value: false }, { label: "Walk-In", value: true }].map((opt) => (
                  <button key={opt.label} type="button"
                    onClick={() => patch({ is_walk_in: opt.value, customer_id: null, isNewCustomer: false })}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.is_walk_in === opt.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            {!form.is_walk_in && (
              <>
                <Field label="Customer">
                  <select value={form.isNewCustomer ? "__new__" : (form.customer_id || "")}
                    onChange={(e) => handleCustomerChange(e.target.value)} className={inputCls} required>
                    <option value="" disabled>Select a customer...</option>
                    {customers.map((c) => (
                      <option key={c.customer_id} value={c.customer_id}>{c.first_name} {c.last_name}</option>
                    ))}
                    <option value="__new__">+ New Customer</option>
                  </select>
                </Field>

                {form.isNewCustomer && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <UserPlus className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Customer</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First Name">
                        <input required type="text" value={form.newFirstName}
                          onChange={(e) => patch({ newFirstName: e.target.value })} placeholder="Juan" className={inputCls} />
                      </Field>
                      <Field label="Last Name">
                        <input required type="text" value={form.newLastName}
                          onChange={(e) => patch({ newLastName: e.target.value })} placeholder="Cruz" className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Contact Number">
                      <input type="text" value={form.newContact}
                        onChange={(e) => patch({ newContact: e.target.value })} placeholder="09xx xxx xxxx" className={inputCls} />
                    </Field>
                  </div>
                )}
              </>
            )}

            <Field label="Transaction Date">
              <input required type="date" value={form.transaction_date}
                onChange={(e) => patch({ transaction_date: e.target.value })} className={inputCls} />
            </Field>

            <Field label="Container Type">
              <div className="flex gap-3 mt-1">
                {[{ label: "Slim", value: 1 }, { label: "Round", value: 2 }].map((opt) => (
                  <button key={opt.label} type="button" onClick={() => patch({ container_type_id: opt.value })}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.container_type_id === opt.value ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Quantity (gallons)">
              <input required type="number" min={1} value={form.quantity}
                onChange={(e) => patch({ quantity: Number(e.target.value) })} className={inputCls} />
            </Field>

            <div className="bg-gray-900 text-white rounded-2xl px-5 py-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400">Total Amount</span>
              <span className="text-2xl font-extrabold tracking-tight">₱{computedAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

function OrderRow({ order, customers, onEdit, onDelete }: { order: Order; customers: Customer[]; onEdit: () => void; onDelete: () => void }) {
  const typeName = order.container_type_id === 2 ? "Round" : "Slim";
  const customerName = order.is_walk_in ? "Walk-In" : (order.customer_id ? customers.find(c => c.customer_id === order.customer_id)?.first_name + " " + customers.find(c => c.customer_id === order.customer_id)?.last_name : "Unknown");
  const initials = customerName.substring(0, 2).toUpperCase();
  return (
    <article className="grid grid-cols-12 gap-4 py-3 px-2 items-center hover:bg-gray-50 rounded-xl transition-colors group">
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-600 shrink-0">
          {initials}
        </div>
        <div className="truncate">
          <p className="font-bold text-gray-900 text-sm truncate">{customerName}</p>
          <p className="text-xs text-gray-400 font-semibold">{order.is_walk_in ? "Walk-In" : "Delivery"} · {typeName}</p>
        </div>
      </div>
      <div className="col-span-2 text-sm text-gray-600 font-semibold">{order.transaction_date}</div>
      <div className="col-span-2 text-center text-sm font-bold text-gray-700">
        {order.quantity} <span className="text-xs font-semibold text-gray-400">gal</span>
      </div>
      <div className="col-span-2 text-right text-sm font-bold text-gray-900">₱{(order.amount || 0).toLocaleString()}</div>
      <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

export default function TransactionsPage() {
  const { orders, totalCount, customers, loading, saving, error, filters, setFilters,
    isModalOpen, editingOrder, form, setForm, openAdd, openEdit, closeModal, saveOrder, deleteOrder } = useOrders();

  return (
    <div className="h-screen bg-gray-50 text-gray-900 overflow-hidden flex flex-col">
      <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900">Transactions</h1>
            <p className="text-sm text-gray-500 font-medium">
              {loading ? "Loading..." : `${orders.length} of ${totalCount} records`}
            </p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm active:scale-[0.98]">
            <Plus className="w-4 h-4" /> New Order
          </button>
        </header>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input type="text" placeholder="Search by name..." value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 outline-none font-medium" />
          </div>

          <div className="relative">
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value as typeof filters.type })}
              className="appearance-none bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold px-4 py-2.5 pr-10 cursor-pointer focus:ring-2 focus:ring-gray-900 outline-none">
              <option value="all">All Types</option>
              <option value="1">Slim</option>
              <option value="2">Round</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 focus:ring-gray-900 outline-none" />
            <span className="text-gray-400 text-sm font-bold">→</span>
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 focus:ring-gray-900 outline-none" />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="col-span-4">Customer</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-center">Gallons</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2" />
          </div>
          <div className="divide-y divide-gray-50 px-2">
            {loading ? (
              <div className="py-16 text-center text-sm text-gray-400 font-medium animate-pulse">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400 font-medium">No orders found. Try adjusting your filters.</div>
            ) : (
              orders.map((order) => {
                const customerName = order.is_walk_in ? "Walk-In" : (order.customer_id ? customers.find(c => c.customer_id === order.customer_id)?.first_name + " " + customers.find(c => c.customer_id === order.customer_id)?.last_name : "Unknown");
                return (
                  <OrderRow key={order.id} order={order} customers={customers} onEdit={() => openEdit(order)}
                    onDelete={() => { if (confirm(`Delete order for ${customerName}?`)) deleteOrder(order.id); }} />
                );
              })
            )}
          </div>
        </div>
      </main>

      <OrderModal isOpen={isModalOpen} isEditing={!!editingOrder} form={form} setForm={setForm}
        customers={customers} onClose={closeModal} onSave={saveOrder} saving={saving} error={error} />
    </div>
  );
}