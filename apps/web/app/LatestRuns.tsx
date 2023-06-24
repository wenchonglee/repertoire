"use client";

import { Button } from "@/components/Button";
import { Spinner } from "@/components/Spinner";
import { Table } from "@/components/Table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/Tooltip";
import { PAGE_SIZE } from "@/lib/db/constants";
import type { PlaywrightOutcome } from "@prisma/client";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Dices,
  SkipForward,
  TestTube2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { type RunResponse } from "./api/runs/route";

dayjs.extend(relativeTime);
dayjs.extend(duration);

type LatestRunsProps = {
  data: { totalCount: number; runs: RunResponse[] };
  pageNumber: number;
};

export default function LatestRuns(props: LatestRunsProps) {
  const { data, pageNumber } = props;
  const totalPages = Math.ceil(data.totalCount / PAGE_SIZE);
  const [runs, setRuns] = useState(data.runs);

  useEffect(() => {
    setRuns(data.runs);
  }, [data]);

  useEffect(() => {
    const evtSource = new EventSource(`${window.location.origin}/api/events/runs`);

    evtSource.onmessage = (ev) => {
      try {
        const updatedResults = JSON.parse(ev.data);

        switch (updatedResults.event) {
          case "RUN_UPDATED":
            setRuns((prev) =>
              prev.map((run) => {
                if (run.runId === updatedResults.runId) return { ...run, results: updatedResults.results };

                return run;
              })
            );
            break;

          case "RUN_STARTED":
            setRuns((prev) => [
              {
                runId: updatedResults.runId,
                startTime: updatedResults.startTime,
              } as any,
              ...prev,
            ]);
            break;
        }
      } catch (err) {
        console.warn(err);
      }
    };
    return () => evtSource.close();
  }, []);

  return (
    <>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Run ID</Table.Head>
            <Table.Head>Start Date</Table.Head>
            <Table.Head>Duration</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Actions</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {runs.map((row, index) => {
            const duration = !!row.endTime
              ? dayjs.duration(dayjs(row.endTime).diff(dayjs(row.startTime))).format("HH:mm:ss")
              : null;

            return (
              <Table.Row key={index}>
                <Table.Cell>{row.runId}</Table.Cell>
                <Table.Cell title={dayjs(row.startTime).format("DD MMM YYYY")}>
                  {dayjs(row.startTime).fromNow()}
                </Table.Cell>
                <Table.Cell>{duration ?? <Spinner />}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-5">
                    {/* ! Not sure why prisma is typing this incorrectly */}
                    <RunStatus status="expected" count={(row.results as any)?.expected} />
                    <RunStatus status="unexpected" count={(row.results as any)?.unexpected} />
                    <RunStatus status="skipped" count={(row.results as any)?.skipped} />
                    <RunStatus status="flaky" count={(row.results as any)?.flaky} />
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Link
                    prefetch={false} // TODO revisit this
                    href={`/runs/${row.runId}`}
                  >
                    <Button>
                      <TestTube2 className="mr-2 h-4 w-4" />
                      View results
                    </Button>
                  </Link>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <div className="flex justify-end">
        <div className="flex gap-4 items-center">
          <div className="text-sm font-medium">
            Page {pageNumber} of {totalPages}
          </div>

          <div className="flex items-center space-x-2">
            <PaginateButton isDisabled={pageNumber === 1} link={`/?page=1`}>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </PaginateButton>

            <PaginateButton isDisabled={pageNumber === 1} link={`/?page=${pageNumber - 1}`}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </PaginateButton>

            <PaginateButton isDisabled={pageNumber === totalPages} link={`/?page=${pageNumber + 1}`}>
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </PaginateButton>

            <PaginateButton isDisabled={pageNumber === totalPages} link={`/?page=${totalPages}`}>
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </PaginateButton>
          </div>
        </div>
      </div>
      {/* <EventListener /> */}
    </>
  );
}

const PaginateButton = ({ isDisabled, link, children }: { isDisabled: boolean; link: string; children: ReactNode }) => {
  const button = (
    <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" disabled={isDisabled}>
      {children}
    </Button>
  );

  if (isDisabled) {
    return button;
  }

  return (
    <Link prefetch={false} href={link}>
      {button}
    </Link>
  );
};
const renderIcon = (status: PlaywrightOutcome) => {
  switch (status) {
    case "expected":
      return <CheckCircle2 className="text-green-500 w-4 h-4" />;

    case "unexpected":
      return <XCircle className="text-red-500 w-4 h-4" />;

    case "flaky":
      return <Dices className="text-yellow-500 w-4 h-4" />;

    case "skipped":
      return <SkipForward className="text-stone-500 w-4 h-4" />;
  }
};

const renderTooltipContent = (status: PlaywrightOutcome) => {
  switch (status) {
    case "expected":
      return "Expected";

    case "unexpected":
      return "Unexpected";

    case "flaky":
      return "Flaky";

    case "skipped":
      return "Skipped";
  }
};

export const RunStatus = (props: { status: PlaywrightOutcome; count?: number }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <div className="flex gap-1 items-center font-medium">
            {renderIcon(props.status)}
            {props.count}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{renderTooltipContent(props.status)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
