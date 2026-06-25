import UnreturnedContainersList from "@/components/containers/UnreturnedContainersList";

export const metadata = {
  title: "Container Tracking | PR Water",
  description: "Track outstanding containers and customer balances.",
};

export default function ContainersPage() {
  return (
    <main className="mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Container Tracking
          </h1>
          <p className="text-gray-500">
            Monitor unreturned containers to prevent asset loss.
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Export List
        </button>
      </div>

      {/* Passing the height prop directly from the page layout */}
      <UnreturnedContainersList className="max-h-180" />
    </main>
  );
}
