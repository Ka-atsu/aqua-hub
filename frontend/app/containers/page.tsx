import UnreturnedContainersList from "@/components/containers/UnreturnedContainersList";

export const metadata = {
  title: "Container Tracking | PR Water",
  description: "Track outstanding containers and customer balances.",
};

export default function ContainersPage() {
  return (
    <div className="min-h-screen bg-ink-base selection:bg-ink-accent/20 transition-colors duration-500">
      <main className="lg:p-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-ink-black">
              Container Tracking
            </h1>
            <p className="text-sm font-medium text-ink-muted mt-1">
              Monitor unreturned containers to prevent asset loss.
            </p>
          </div>

          <button className="bg-white border border-ink-dark/10 text-ink-dark hover:bg-ink-base hover:text-ink-black shadow-ink-sm px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]">
            Export List
          </button>
        </header>

        <UnreturnedContainersList className="max-h-[62.1vh]" />
      </main>
    </div>
  );
}
