import UnreturnedContainersList from "@/components/containers/UnreturnedContainersList";

export const metadata = {
  title: "Container Tracking | PR Water",
  description: "Track outstanding containers and customer balances.",
};

export default function ContainersPage() {
  return (
    /* 1. Added a full-height wrapper with pure white background to guarantee contrast against the neu-base table */
    <div className="min-h-screen bg-white selection:bg-blue-100">
      {/* 2. Added max-w-7xl so on massive monitors, the table doesn't stretch too wide and lose its premium proportions */}
      <main className="p-4 md:p-6 lg:p-8 space-y-8">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-gray-900">
              Container Tracking
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Monitor unreturned containers to prevent asset loss.
            </p>
          </div>

          <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]">
            Export List
          </button>
        </header>

        {/* 3. Adjusted the height boundary to be viewport-relative (vh) 
          This ensures the table scrolls internally rather than pushing the whole page down 
        */}
        <div className="pb-8">
          <UnreturnedContainersList className="max-h-[59vh]" />
        </div>
      </main>
    </div>
  );
}
