import { getTest } from "@/app/api/runs/[runId]/tests/[testId]/getTest";
import { ProjectBadge } from "@/components/ProjectBadge";
import { formatDuration } from "@/lib/utils/formatDuration";
import { AlarmClock } from "lucide-react";
import { Errors } from "./Errors";

export default async function RunPage({ params }: { params: { runId: string; testId: string } }) {
  const data = await getTest(params.runId, params.testId);
  if (!data) return null;

  const duration = formatDuration(data.startTime, data.endTime);

  return (
    <main className="mx-auto max-w-screen-xl">
      <div className="flex-1 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-baseline gap-5">
            <h2 className="text-3xl font-bold tracking-tight">{params.runId}</h2>
          </div>
        </div>
        <div className="text-md text-muted-foreground">{data.fileName}</div>

        <div className="my-4">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{data.title}</h3>
          <div className="flex gap-2">
            <div className="flex gap-1 items-center ">
              <AlarmClock className="w-4 h-4" /> {duration}
            </div>
            <ProjectBadge>{data.projectName}</ProjectBadge>
          </div>
        </div>

        {data.errors?.map((error, index) => (
          <Errors key={index} error={error.message ?? ""} />
        ))}

        {data.attachments && (
          <div className="my-4">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Test artifacts</h3>
            <div>
              {data.attachments.map((attachment) => {
                if (attachment.contentType.includes("image")) {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={attachment.fileName} src={attachment.url} alt={attachment.fileName} className="h-96" />
                  );
                }

                return (
                  <video key={attachment.fileName} controls>
                    <source src={attachment.url} type={attachment.contentType} />
                  </video>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
