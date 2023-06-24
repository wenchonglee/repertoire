import { RunStatus } from "@/app/LatestRuns";
import { getRun } from "@/app/api/runs/[runId]/getRun";
import { formatDuration } from "@/lib/utils/formatDuration";
import { AlarmClock } from "lucide-react";
import TestSummary from "./TestSummary";

export default async function RunPage({ params }: { params: { runId: string } }) {
  const data = await getRun(params.runId);

  if (!data) {
    return null;
  }

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
            {/* ! Not sure why prisma is typing this incorrectly */}
            <RunStatus status="expected" count={(data.results as any)?.expected} />
            <RunStatus status="unexpected" count={(data.results as any)?.unexpected} />
            <RunStatus status="skipped" count={(data.results as any)?.skipped} />
            <RunStatus status="flaky" count={(data.results as any)?.flaky} />
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
