// app/transactions/page.tsx
import Link from "next/link";
import { Wrench } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center relative">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full flex flex-col items-center space-y-6">
        {/* Icon Container */}
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-2">
          <Wrench className="w-10 h-10 text-[#00D084]" strokeWidth={2} />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Work in Progress
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            The Transactions page is currently under construction and isn't
            accessible just yet. We're working hard to get this feature ready
            for you!
          </p>
        </div>

        {/* Action Button */}
        <Link
          href="/"
          className="w-full bg-[#00D084] hover:bg-[#00b370] text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00D084]"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
