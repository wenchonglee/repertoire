import { RunStatus } from "@/app/LatestRuns";
import type { RunResponse } from "@/app/api/runs/route";
import { formatDuration } from "@/lib/utils/formatDuration";
import { AlarmClock } from "lucide-react";
import TestSummary from "./TestSummary";

const getData = async (runId: string): Promise<RunResponse> => {
  const res = await fetch("http://localhost:3000/api/runs/" + runId);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return await res.json();
};

export default async function RunPage({ params }: { params: { runId: string } }) {
  const data = await getData(params.runId);
  const duration = formatDuration(data.startTime, data.endTime);

  return (
    <main className="mx-auto max-w-screen-xl">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-baseline gap-5">
            <h2 className="text-3xl font-bold tracking-tight">{params.runId}</h2>

            {/* {!!data.endTime && <Spinner />} */}
          </div>
          <div> Placeholder for filters</div>
        </div>

        <div className="flex gap-4">
          <div className="flex gap-5">
            <RunStatus status="expected" count={data.results?.expected} />
            <RunStatus status="unexpected" count={data.results?.unexpected} />
            <RunStatus status="skipped" count={data.results?.skipped} />
            <RunStatus status="flaky" count={data.results?.flaky} />
          </div>

          <div className="flex gap-1 items-center ">
            <AlarmClock className="w-4 h-4" /> {duration}
          </div>

          <div>{data.projects.join(", ")}</div>

          <div>Number of shards: {data.totalShards}</div>
        </div>
        {/* @ts-expect-error Async Server Component */}
        <TestSummary runId={params.runId} />
      </div>
    </main>
  );
}
