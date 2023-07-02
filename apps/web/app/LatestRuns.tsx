"use client";

import { RunStatus } from "@/components/RunStatus";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/shadcn/Button";
import { Table } from "@/components/shadcn/Table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/shadcn/Tooltip";
import { PAGE_SIZE } from "@/lib/db/constants";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MehIcon, TestTube2 } from "lucide-react";
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
          case "RUN_STARTED":
            setRuns((prev) => [
              {
                runId: updatedResults.runId,
                startTime: updatedResults.startTime,
              } as any,
              ...prev,
            ]);
            break;

          case "RUN_UPDATED":
            setRuns((prev) =>
              prev.map((run) => {
                if (run.runId === updatedResults.runId) return { ...run, results: updatedResults.results };

                return run;
              })
            );
            break;

          case "RUN_ENDED":
            setRuns((prev) =>
              prev.map((run) => {
                if (run.runId === updatedResults.runId) return { ...run, endTime: updatedResults.endTime };
                return run;
              })
            );
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
            const startTime = dayjs(row.startTime);
            const endTime = dayjs(row.endTime);
            const duration = !!row.endTime ? dayjs.duration(endTime.diff(startTime)).format("HH:mm:ss") : null;
            const isPossiblyUnexpectedError = !endTime.isValid() && dayjs(new Date()).diff(startTime, "hours") > 4;

            return (
              <Table.Row key={index}>
                <Table.Cell>{row.runId}</Table.Cell>

                <Table.Cell title={dayjs(row.startTime).format("DD MMM YYYY")}>
                  {dayjs(row.startTime).fromNow()}
                </Table.Cell>

                <Table.Cell>
                  {isPossiblyUnexpectedError ? (
                    <TooltipProvider>
                      <Tooltip delayDuration={150}>
                        <TooltipTrigger asChild>
                          <MehIcon />
                        </TooltipTrigger>
                        <TooltipContent>
                          Repertoire wasn&apos;t notified of the run end <br />
                          after 4 hours, something probably went wrong
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : duration === null ? (
                    <Spinner />
                  ) : (
                    duration
                  )}
                </Table.Cell>

                <Table.Cell>
                  {row.results && (
                    <div className="flex gap-5">
                      <RunStatus status="expected" count={row.results.expected} />
                      <RunStatus status="unexpected" count={row.results.unexpected} />
                      <RunStatus status="flaky" count={row.results.flaky} />
                      <RunStatus status="skipped" count={row.results.skipped} />
                    </div>
                  )}
                </Table.Cell>

                <Table.Cell>
                  <Link
                    prefetch={false} // TODO revisit this
                    href={`/runs/${row.runId}`}
                  >
                    <Button variant="outline">
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
