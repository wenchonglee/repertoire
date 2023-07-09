import { getRun } from "@/app/api/runs/[runId]/getRun";
import { getTests } from "@/app/api/runs/[runId]/tests/getTests";
import { ProjectBadge } from "@/components/ProjectBadge";
import { formatDuration } from "@/lib/utils/formatDuration";
import { AlarmClock } from "lucide-react";
import RunSummary from "./RunSummary";

export default async function RunPage({ params }: { params: { runId: string } }) {
  const runData = await getRun(params.runId);
  const testsData = await getTests(params.runId);

  if (!runData || !testsData) {
    return null;
  }

  const duration = formatDuration(runData.startTime, runData.endTime);

  return (
    <main className="mx-auto max-w-screen-xl">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-baseline gap-5">
            <h2 className="text-3xl font-bold tracking-tight">{params.runId}</h2>

            {/* {!!data.endTime && <Spinner />} */}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex gap-1 items-center ">
            <AlarmClock className="w-4 h-4" /> {duration}
          </div>

          <div className="flex gap-2">
            {runData.projects.map((project) => (
              <ProjectBadge key={project}>{project}</ProjectBadge>
            ))}
          </div>

          <div>Number of shards: {runData.totalShards}</div>
        </div>

        <RunSummary runId={params.runId} testsData={testsData} runData={runData} />
      </div>
    </main>
  );
}
