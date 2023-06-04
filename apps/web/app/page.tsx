import LatestRuns from "./LatestRuns";

export default async function Home(request: { params: any; searchParams: Record<string, string> }) {
  return (
    <main className="mx-auto max-w-screen-xl">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Latest runs</h2>
        </div>
        {/* @ts-expect-error Async Server Component */}
        <LatestRuns page={request.searchParams.page} />
      </div>
    </main>
  );
}
