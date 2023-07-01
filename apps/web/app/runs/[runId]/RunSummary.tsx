import { getTests } from "@/app/api/runs/[runId]/tests/getTests";
import { ProjectBadge } from "@/components/ProjectBadge";
import { Card } from "@/components/shadcn/Card";
import { formatDuration } from "@/lib/utils/formatDuration";
import type { PlaywrightTests } from "@prisma/client";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, FileCodeIcon, SkipForward, TimerOff, XCircle } from "lucide-react";
import Link from "next/link";

export default async function RunSummary(props: { runId: string }) {
  const data = await getTests(props.runId);

  return (
    <div className="flex flex-col gap-4">
      {data.map((file) => {
        return (
          <Card key={file._id} className="shadow-sm">
            <Card.Header className="border-b p-4">
              <Card.Title className="flex items-center gap-2">
                <FileCodeIcon />
                {file._id}
              </Card.Title>
            </Card.Header>

            <Card.Content className="p-4">
              {file.tests.map((row) => {
                const duration = formatDuration(row.startTime?.$date, row.endTime?.$date);

                return (
                  <div
                    key={row.testId}
                    className={clsx({
                      "flex gap-2 items-center": true,
                      "text-muted-foreground": row.status === "skipped",
                    })}
                  >
                    <div className="flex gap-2 items-center grow">
                      <TestStatusIcon status={row.status} />

                      <Link href={`/runs/${props.runId}/tests/${row.testId}`}>
                        <div>{row.title}</div>
                      </Link>
                    </div>

                    <div>
                      <ProjectBadge>{row.projectName}</ProjectBadge>
                    </div>
                    <div className="w-24 text-right">{duration}</div>
                  </div>
                );
              })}
            </Card.Content>
          </Card>
        );
      })}
    </div>
  );
}

const TestStatusIcon = ({ status }: { status: PlaywrightTests["status"] }) => {
  switch (status) {
    case "failed":
      return <XCircle className="text-red-500 w-4 h-4" />;

    case "interrupted":
      return <AlertCircle className="text-yellow-500 w-4 h-4" />;

    case "passed":
      return <CheckCircle2 className="text-green-500 w-4 h-4" />;

    case "skipped":
      return <SkipForward className="text-stone-500 w-4 h-4" />;

    case "timedOut":
      return <TimerOff className="text-stone-500 w-4 h-4" />;

    default:
      return null;
  }
};
