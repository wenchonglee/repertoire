import { getRuns } from "./api/runs/getRuns";
import LatestRuns from "./LatestRuns";

export default async function Home(request: { searchParams: Record<string, string> }) {
  const pageNumber = request.searchParams.page ? Number(request.searchParams.page) : 1;
  const data = await getRuns(pageNumber);

  return (
    <main className="mx-auto max-w-screen-xl">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Latest runs</h2>
        </div>
        <LatestRuns data={data} pageNumber={pageNumber} />
      </div>
    </main>
  );
}
