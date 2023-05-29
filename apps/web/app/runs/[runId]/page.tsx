import TestSummary from "./TestSummary";

export default async function RunPage({ params }: { params: { runId: string } }) {
  return (
    <main className="m">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">{params.runId}</h2>
        </div>
      </div>
      {/* @ts-expect-error Async Server Component */}
      <TestSummary runId={params.runId} />
    </main>
  );
}
