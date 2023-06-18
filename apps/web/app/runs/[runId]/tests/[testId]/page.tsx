import { ProjectBadge } from "@/components/ProjectBadge";
import { formatDuration } from "@/lib/utils/formatDuration";
import type { PlaywrightTests } from "@prisma/client";
import { Errors } from "./Errors";

const getData = async (runId: string, testId: string): Promise<PlaywrightTests> => {
  const res = await fetch(`http://localhost:3000/api/runs/${runId}/tests/${testId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return await res.json();
};

export default async function RunPage({ params }: { params: { runId: string; testId: string } }) {
  const data = await getData(params.runId, params.testId);
  console.log(data);
  const duration = formatDuration(data.startTime, data.endTime);

  return (
    <main className="mx-auto max-w-screen-xl">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-baseline gap-5">
            <h2 className="text-3xl font-bold tracking-tight">{params.runId}</h2>
          </div>
        </div>
        <div className="text-xl text-muted-foreground">{data.fileName}</div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{data.title}</h3>
        <ProjectBadge>{data.projectName}</ProjectBadge>
        {data.errors?.map((error, index) => (
          <Errors key={index} error={error.message ?? ""} />
        ))}
      </div>

      <div>
        {data.attachments?.map((attachment) => {
          if (attachment.contentType.includes("image")) {
            // eslint-disable-next-line @next/next/no-img-element
            return <img key={attachment.fileName} src={attachment.url} alt={attachment.fileName} className="h-96" />;
          }
          return <video key={attachment.fileName} src={attachment.fileName} />;
        })}
      </div>
    </main>
  );
}
