import type { RunResponse } from "./api/runs/route";
import LatestRuns from "./LatestRuns";

const getData = async (page: number): Promise<{ totalCount: number; runs: RunResponse[] }> => {
  const searchParams = new URLSearchParams({ page: `${page}` }).toString();
  const res = await fetch("http://localhost:3000/api/runs?" + searchParams);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return await res.json();
};

export default async function Home(request: { searchParams: Record<string, string> }) {
  const pageNumber = request.searchParams.page ? Number(request.searchParams.page) : 1;
  const data = await getData(pageNumber);

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
