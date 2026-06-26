// app/transactions/page.tsx
"use client";
import React, { useState } from "react";
import {
  FilterBar,
  TransactionTable,
} from "@/components/transactions/TransactionUI";

// Simulated Data
const DUMMY_TRANSACTIONS = [
  {
    id: "TX-9012",
    date: "Today, 08:42 AM",
    customer: "Maria Santos",
    type: "Walk-in",
    gallons: 10,
    amount: 350.0,
    status: "Paid",
  },
  {
    id: "TX-9013",
    date: "Today, 09:15 AM",
    customer: "Cafe Rosa",
    type: "Delivery",
    gallons: 50,
    amount: 1750.0,
    status: "Pending",
  },
  {
    id: "TX-9014",
    date: "Today, 10:05 AM",
    customer: "John Doe",
    type: "Walk-in",
    gallons: 5,
    amount: 175.0,
    status: "Paid",
  },
  {
    id: "TX-9015",
    date: "Today, 11:30 AM",
    customer: "TechHub Offices",
    type: "Delivery",
    gallons: 100,
    amount: 3500.0,
    status: "Cancelled",
  },
];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Simple client-side search simulation
  const filteredData = DUMMY_TRANSACTIONS.filter(
    (tx) =>
      tx.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 relative">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track all water station orders.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col">
          <FilterBar onSearch={setSearchQuery} />

          {filteredData.length > 0 ? (
            <TransactionTable transactions={filteredData} />
          ) : (
            <div className="py-24 text-center bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col items-center justify-center">
              <p className="text-gray-500 font-medium">
                No transactions found for "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-sm font-bold text-gray-900 hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
