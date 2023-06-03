import { Badge } from "@/components/Badge";
import { Table } from "@/components/Table";
import dayjs from "dayjs";
import Link from "next/link";
import type { RunResponse } from "./api/runs/route";

const getData = async (): Promise<RunResponse[]> => {
  const res = await fetch("http://localhost:3000/api/runs");
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  //   await sleep(5000);

  return await res.json();
};

export default async function LatestRuns() {
  const data = await getData();

  return (
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
        {data.map((row, index) => {
          const duration = !!row.endTime
            ? dayjs.duration(dayjs(row.endTime).diff(dayjs(row.startTime))).format("HH:mm:ss")
            : null;

          return (
            <Table.Row key={index}>
              <Table.Cell>
                <RunStatus status={row.status} />
              </Table.Cell>
              <Table.Cell>
                <Link href={`/runs/${row.runId}`}>{row.runId} </Link>
              </Table.Cell>
              <Table.Cell title={dayjs(row.startTime).format("DD MMM YYYY")}>
                {dayjs(row.startTime).fromNow()}
              </Table.Cell>
              <Table.Cell>{duration}</Table.Cell>
              <Table.Cell>{row.totalShards}</Table.Cell>
              {/* <Table.Cell>{row.allTests.length}</Table.Cell> */}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

const RunStatus = (props: { status: RunResponse["status"] }) => {
  switch (props.status) {
    case "passed":
      return <Badge className="bg-teal-500">Passed</Badge>;

    case "failed":
      return <Badge className="bg-red-500">Failed</Badge>;

    case "interrupted":
      return <Badge className="bg-amber-500">Interrupted</Badge>;

    case "timedout":
      return <Badge className="bg-stone-500">Timed out</Badge>;

    default:
      return <Badge className="bg-slate-500">Unknown</Badge>;
  }
};
