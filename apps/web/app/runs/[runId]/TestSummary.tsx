import { getTests } from "@/app/api/runs/[runId]/tests/getTests";
import { Card } from "@/components/Card";
import { ProjectBadge } from "@/components/ProjectBadge";
import { formatDuration } from "@/lib/utils/formatDuration";
import type { PlaywrightTests } from "@prisma/client";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, SkipForward, TimerOff, XCircle } from "lucide-react";
import Link from "next/link";

export default async function TestSummary(props: { runId: string }) {
  const data = await getTests(props.runId);

  return (
    <div className="flex flex-col gap-4">
      {data.map((file) => {
        return (
          <Card key={file._id}>
            <Card.Header>
              <Card.Title>{file._id}</Card.Title>
            </Card.Header>
            <Card.Content>
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
                    <TestStatusIcon status={row.status} />

                    <Link href={`/runs/${props.runId}/tests/${row.testId}`}>
                      <div>{row.title}</div>
                    </Link>
                    <ProjectBadge>{row.projectName}</ProjectBadge>
                    <div>{duration}</div>
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
