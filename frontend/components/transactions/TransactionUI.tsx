// components/transactions/TransactionUI.tsx
import React from "react";
import { Order, OrderFormData, Customer } from "@/hooks/useTransaction";
import { X, Pencil, Trash2, AlertCircle, UserPlus } from "lucide-react";

// --- REUSABLE FIELD ---
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-ink-muted block mb-1.5 uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  );
}

// Standardized Ink Theme inputs
export const inputCls =
  "w-full border border-ink-dark/10 bg-white shadow-sm rounded-xl px-4 py-2.5 text-sm text-ink-dark focus:outline-none focus:ring-2 focus:ring-ink-accent transition-shadow";

// --- ORDER MODAL ---
export function OrderModal({
  isOpen,
  isEditing,
  form,
  setForm,
  customers,
  onClose,
  onSave,
  saving,
  error,
}: {
  isOpen: boolean;
  isEditing: boolean;
  form: OrderFormData;
  setForm: (f: OrderFormData) => void;
  customers: Customer[];
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
}) {
  if (!isOpen) return null;

  function patch(p: Partial<OrderFormData>) {
    setForm({ ...form, ...p });
  }

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
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-ink-black/40 backdrop-blur-sm cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-ink-dark/10 rounded-l-3xl"
      >
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-ink-dark/5 shrink-0">
            <div>
              <h3 className="text-xl font-bold text-ink-black tracking-tight">
                {isEditing ? "Edit Order" : "New Order"}
              </h3>
              <p className="text-xs text-ink-muted font-medium mt-0.5">
                {isEditing
                  ? "Update order details."
                  : "Log a new water delivery order."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-ink-base border border-ink-dark/10 hover:bg-ink-dark/5 text-ink-muted hover:text-ink-black rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-4 py-3 rounded-xl shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Order Type Toggle */}
            <Field label="Order Type">
              <div className="flex gap-3">
                {[
                  { label: "Delivery", value: false },
                  { label: "Walk-In", value: true },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() =>
                      patch({
                        is_walk_in: opt.value,
                        customer_id: null,
                        isNewCustomer: false,
                      })
                    }
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      form.is_walk_in === opt.value
                        ? "bg-ink-black text-white border-ink-black shadow-md"
                        : "bg-white text-ink-muted border-ink-dark/10 hover:bg-ink-dark/5 hover:text-ink-dark"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Customer Selection */}
            {!form.is_walk_in && (
              <>
                <Field label="Customer">
                  <select
                    value={
                      form.isNewCustomer ? "__new__" : form.customer_id || ""
                    }
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className={inputCls}
                    required
                  >
                    <option value="" disabled>
                      Select a customer...
                    </option>
                    {customers.map((c) => (
                      <option key={c.customer_id} value={c.customer_id}>
                        {c.first_name} {c.last_name}
                      </option>
                    ))}
                    <option value="__new__">+ New Customer</option>
                  </select>
                </Field>

                {form.isNewCustomer && (
                  <div className="bg-ink-base border border-ink-dark/10 rounded-2xl p-5 space-y-4 shadow-inner">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-ink-muted" />
                      <span className="text-xs font-extrabold text-ink-muted uppercase tracking-widest">
                        New Customer Details
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="First Name">
                        <input
                          required
                          type="text"
                          value={form.newFirstName}
                          onChange={(e) =>
                            patch({ newFirstName: e.target.value })
                          }
                          placeholder="Juan"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Last Name">
                        <input
                          required
                          type="text"
                          value={form.newLastName}
                          onChange={(e) =>
                            patch({ newLastName: e.target.value })
                          }
                          placeholder="Cruz"
                          className={inputCls}
                        />
                      </Field>
                    </div>
                    <Field label="Contact Number">
                      <input
                        type="text"
                        value={form.newContact}
                        onChange={(e) => patch({ newContact: e.target.value })}
                        placeholder="09xx xxx xxxx"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                )}
              </>
            )}

            {/* Date */}
            <Field label="Transaction Date">
              <input
                required
                type="date"
                value={form.transaction_date}
                onChange={(e) => patch({ transaction_date: e.target.value })}
                className={inputCls}
              />
            </Field>

            {/* Container Type Toggle */}
            <Field label="Container Type">
              <div className="flex gap-3">
                {[
                  { label: "Slim", value: 1 },
                  { label: "Round", value: 2 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => patch({ container_type_id: opt.value })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      form.container_type_id === opt.value
                        ? "bg-ink-black text-white border-ink-black shadow-md"
                        : "bg-white text-ink-muted border-ink-dark/10 hover:bg-ink-dark/5 hover:text-ink-dark"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Field>

            {/* Quantity */}
            <Field label="Quantity (gallons)">
              <input
                required
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => patch({ quantity: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>

            {/* Total Calculation Panel */}
            <div className="bg-ink-black text-white rounded-2xl px-6 py-5 flex items-center justify-between shadow-md">
              <span className="text-sm font-bold text-white/70 uppercase tracking-widest">
                Total Amount
              </span>
              <span className="text-3xl font-extrabold tracking-tighter">
                ₱{computedAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-5 border-t border-ink-dark/5 flex gap-3 shrink-0 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-ink-dark/10 hover:bg-ink-base text-ink-dark text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-ink-black border border-ink-black hover:bg-ink-dark text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Add Order"}
          </button>
        </div>
      </form>
    </div>
  );
}

// --- TABLE ROW ---
export function OrderRow({
  order,
  customers,
  onEdit,
  onDelete,
}: {
  order: Order;
  customers: Customer[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const matchedCustomer = customers.find(
    (c) => c.customer_id === order.customer_id,
  );

  const customerName = order.is_walk_in
    ? "Walk-In"
    : matchedCustomer
      ? `${matchedCustomer.first_name} ${matchedCustomer.last_name}`
      : "Unknown";

  const typeName = order.type === 1 ? "Slim" : "Round";
  const initials = customerName.substring(0, 2).toUpperCase();

  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-ink-dark/5 transition-colors group text-sm">
      {/* 1. Customer: Matches col-span-4 */}
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-ink-dark/10 flex items-center justify-center text-ink-black font-bold text-xs shrink-0">
          {initials}
        </div>
        <div className="overflow-hidden">
          <p className="font-semibold text-ink-black truncate">
            {customerName}
          </p>
          <p className="text-xs text-ink-muted mt-0.5 truncate">
            {order.is_walk_in ? "Walk-In" : "Delivery"} · {typeName}
          </p>
        </div>
      </div>

      {/* 2. Date: Matches col-span-2 */}
      <div className="col-span-2 text-ink-muted font-medium">
        {new Date(order.transaction_date).toLocaleDateString()}
      </div>

      {/* 3. Gallons: Matches col-span-2 text-center */}
      <div className="col-span-2 text-center font-bold text-ink-black">
        {order.quantity}{" "}
        <span className="text-xs text-ink-muted font-medium">gal</span>
      </div>

      {/* 4. Amount: Matches col-span-2 text-right */}
      <div className="col-span-2 text-right font-bold text-ink-black">
        ₱{(order.amount || 0).toLocaleString()}
      </div>

      {/* 5. Actions: Matches the final col-span-2 */}
      <div className="col-span-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 text-ink-muted hover:text-ink-accent hover:bg-ink-accent/10 rounded-lg transition-colors"
          title="Edit Order"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-ink-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Order"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
