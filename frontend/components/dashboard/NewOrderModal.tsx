// components/dashboard/NewOrderModal.tsx
"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export function NewOrderModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: NewOrderModalProps) {
  // Local form state tracking
  const [customerName, setCustomerName] = useState("");
  const [gallons, setGallons] = useState("");
  const [waterType, setWaterType] = useState("Standard");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    /* Future integration point: 
       Insert your Supabase mutation queries here using values:
       { name: customerName, new_gallon: Number(gallons), type: waterType }
    */
    if (onSubmitSuccess) onSubmitSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop Blur Layer */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Floating Interactive Panel */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between transform transition-transform duration-300 ease-out border-l border-gray-100 rounded-l-3xl"
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Create New Order
              </h3>
              <p className="text-xs text-gray-400">
                Log an incoming water delivery transaction.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Workspace */}
          <div className="space-y-4 mt-6">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1 uppercase tracking-wider">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Juan Cruz"
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1 uppercase tracking-wider">
                Volume (Gallons)
              </label>
              <input
                type="number"
                required
                value={gallons}
                onChange={(e) => setGallons(e.target.value)}
                placeholder="5"
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1 uppercase tracking-wider">
                Type
              </label>
              <select
                value={waterType}
                onChange={(e) => setWaterType(e.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="Standard">Round</option>
                <option value="Purified">Slim</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Confirmation Blocks */}
        <div className="pt-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Submit Order
          </button>
        </div>
      </form>
    </div>
  );
}
