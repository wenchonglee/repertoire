import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/Tooltip";
import type { PlaywrightOutcome } from "@prisma/client";
import dayjs from "dayjs";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Dices,
  SkipForward,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { RunResponse } from "./api/runs/route";

const getData = async (page: number): Promise<{ totalCount: number; runs: RunResponse[] }> => {
  const searchParams = new URLSearchParams({ page: `${page}` }).toString();
  const res = await fetch("http://localhost:3000/api/runs?" + searchParams);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return await res.json();
};

export default async function LatestRuns({ page }: { page?: string }) {
  const pageNumber = page ? Number(page) : 1;
  const data = await getData(pageNumber);

  const totalPages = Math.ceil(data.totalCount / 2);

  return (
    <>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Status</Table.Head>
            <Table.Head>Run ID</Table.Head>
            <Table.Head>Start Time</Table.Head>
            <Table.Head>Duration</Table.Head>
            <Table.Head>Test of tests</Table.Head>
            <Table.Head>Shards</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {data.runs.map((row, index) => {
            const duration = !!row.endTime
              ? dayjs.duration(dayjs(row.endTime).diff(dayjs(row.startTime))).format("HH:mm:ss")
              : null;

            return (
              <Table.Row key={index}>
                <Table.Cell>
                  <div className="flex gap-5">
                    <RunStatus status="expected" count={row.results?.expected} />
                    <RunStatus status="unexpected" count={row.results?.unexpected} />
                    <RunStatus status="skipped" count={row.results?.skipped} />
                    <RunStatus status="flaky" count={row.results?.flaky} />
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Link href={`/runs/${row.runId}`}>{row.runId} </Link>
                </Table.Cell>
                <Table.Cell title={dayjs(row.startTime).format("DD MMM YYYY")}>
                  {dayjs(row.startTime).fromNow()}
                </Table.Cell>
                <Table.Cell>{duration}</Table.Cell>
                <Table.Cell>{row.totalShards}</Table.Cell>
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

  return <Link href={link}>{button}</Link>;
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
        <TooltipTrigger>
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
