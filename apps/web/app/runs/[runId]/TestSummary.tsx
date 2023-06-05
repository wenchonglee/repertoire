import type { TestResponse } from "@/app/api/runs/[runId]/tests/route";
import { Card } from "@/components/Card";
import clsx from "clsx";
import dayjs from "dayjs";
import { AlertCircle, CheckCircle2, SkipForward, TimerOff, XCircle } from "lucide-react";

const getData = async (runId: string): Promise<{ _id: string; tests: TestResponse[] }[]> => {
  const res = await fetch(`http://localhost:3000/api/runs/${runId}/tests`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  //   await sleep(5000);

  return await res.json();
};

export default async function TestSummary(props: { runId: string }) {
  const data = await getData(props.runId);

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
                const duration = !!row.endTime
                  ? dayjs.duration(dayjs(row.endTime?.$date).diff(dayjs(row.startTime?.$date))).format("mm:ss")
                  : null;

                return (
                  <div
                    key={row.testId}
                    className={clsx({
                      "flex gap-2 items-center": true,
                      "text-muted-foreground": row.status === "skipped",
                    })}
                  >
                    <TestStatusIcon status={row.status} />

                    <div>{row.title}</div>
                    <div>{row.projectName}</div>
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

const TestStatusIcon = ({ status }: { status: TestResponse["status"] }) => {
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
