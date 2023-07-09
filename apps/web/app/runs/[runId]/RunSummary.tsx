"use client";

import { type AggregatedTests } from "@/app/api/runs/[runId]/tests/getTests";
import { ProjectBadge } from "@/components/ProjectBadge";
import { Card } from "@/components/shadcn/Card";
import { Input } from "@/components/shadcn/Input";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/Tabs";
import { formatDuration } from "@/lib/utils/formatDuration";
import type { PlaywrightRuns, PlaywrightTests } from "@prisma/client";
import clsx from "clsx";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { debounce } from "lodash";
import { AlertCircle, CheckCircle2, Dices, FileCodeIcon, SkipForward, TimerOff, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

dayjs.extend(relativeTime);
dayjs.extend(duration);

type RunSummaryProps = {
  testsData: AggregatedTests[];
  runId: string;
  runData: PlaywrightRuns;
};

export default function RunSummary(props: RunSummaryProps) {
  const { testsData, runId, runData } = props;

  const [tests, setTests] = useState(testsData);

  useEffect(() => {
    const evtSource = new EventSource(`${window.location.origin}/api/events/runs/${runId}`);

    evtSource.onmessage = (ev) => {
      try {
        const updatedResults = JSON.parse(ev.data);

        switch (updatedResults.event) {
          case "RUN_UPDATED":
            setTests(updatedResults.results);
            break;
        }
      } catch (err) {
        console.warn(err);
      }
    };
    return () => evtSource.close();
  }, [runId]);

  const filterOutcome = (outcome: string) => {
    if (outcome === "all") {
      setTests(testsData);
      return;
    }

    setTests(
      testsData.map((aggTests) => ({ ...aggTests, tests: aggTests.tests.filter((test) => test.outcome === outcome) }))
    );
  };

  const filterTestName = debounce((value: string) => {
    if (value === "") {
      setTests(testsData);
      return;
    }

    setTests(
      testsData.map((aggTests) => ({
        ...aggTests,
        tests: aggTests.tests.filter((test) => new RegExp(value, "i").test(test.title)),
      }))
    );
  }, 500);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap justify-between">
        <Input
          placeholder="Filter test name"
          className="grow-0 w-96"
          onChange={(ev) => filterTestName(ev.target.value)}
        />

        <Tabs defaultValue="all" onValueChange={(value) => filterOutcome(value)}>
          <TabsList>
            <TabsTrigger value="all">All results</TabsTrigger>
            <TabsTrigger value="expected">
              <CheckCircle2 className="text-green-600 w-4 h-4" /> &nbsp; {runData.results?.expected} Expected
            </TabsTrigger>
            <TabsTrigger value="unexpected">
              <XCircle className="text-red-600 w-4 h-4" /> &nbsp; {runData.results?.unexpected} Unexpected
            </TabsTrigger>
            <TabsTrigger value="flaky">
              <Dices className="text-orange-600 w-4 h-4" /> &nbsp; {runData.results?.flaky} Flaky
            </TabsTrigger>
            <TabsTrigger value="skipped">
              <SkipForward className="text-stone-600 w-4 h-4" /> &nbsp; {runData.results?.skipped} Skipped
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tests.map((file) => {
        return (
          <Card key={file._id} className="shadow-sm">
            <Card.Header className="border-b p-4">
              <Card.Title className="flex items-center gap-2">
                <FileCodeIcon />
                {file._id}
              </Card.Title>
            </Card.Header>

            <Card.Content className="p-4">
              {file.tests.length === 0 && <div className="text-sm text-muted-foreground">No results </div>}
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

                      <Link href={`/runs/${runId}/tests/${row.testId}`}>
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
      return <TimerOff className="text-red-500 w-4 h-4" />;

    default:
      return null;
  }
};
