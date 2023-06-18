import { prisma } from "@/lib/db";
import type { PlaywrightTests } from "@prisma/client";

// TODO: double check if there is a way to avoid the $date cast by aggregateRaw
type TestResponse = {
  startTime: { $date: string };
  endTime: { $date: string };
} & PlaywrightTests;

type AggregatedTests = {
  _id: string;
  tests: TestResponse[];
};

export const getTests = async (runId: string): Promise<AggregatedTests[]> => {
  const tests = await prisma.playwrightTests.aggregateRaw({
    pipeline: [
      { $match: { runId } },
      { $sort: { title: 1 } },
      { $group: { _id: "$fileName", tests: { $push: "$$ROOT" } } },
    ],
    options: {},
  });

  return tests as unknown as AggregatedTests[];
};
