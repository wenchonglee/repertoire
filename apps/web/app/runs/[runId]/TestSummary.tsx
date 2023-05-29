import type { TestResponse } from "@/app/api/runs/[runId]/tests/route";
import { Table } from "@/components/Table";
import dayjs from "dayjs";

const getData = async (runId: string): Promise<TestResponse[]> => {
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
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head>Test ID</Table.Head>
          <Table.Head>Title</Table.Head>
          <Table.Head>Duration</Table.Head>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {data.map((row, index) => {
          const duration = !!row.endTime ? dayjs(row.endTime).from(dayjs(row.startTime), true) : null;

          return (
            <Table.Row key={index}>
              <Table.Cell>{row.testId}</Table.Cell>
              <Table.Cell>{row.title}</Table.Cell>
              <Table.Cell>{duration}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}
