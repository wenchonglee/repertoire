import { prisma } from "@/lib/db";
import { z } from "zod";
import type { TestPutRequest } from "./[testId]/models";
import type { TestPostRequest } from "./models";

// TODO: double check if there is a way to avoid the $date cast by aggregateRaw
export type TestResponse = z.infer<typeof TestPostRequest> & {
  startTime: { $date: string };
  endTime: { $date: string };
  projectName: string;
  fileName: string;
  attachments: {
    fileName: string;
    url: string;
    contentType: string;
  }[];
} & z.infer<typeof TestPutRequest>;

export async function GET(request: Request, { params }: { params: { runId: string } }) {
  const tests = await prisma.playwrightTests.aggregateRaw({
    pipeline: [
      { $match: { runId: params.runId } },
      { $sort: { title: 1 } },
      { $group: { _id: "$fileName", tests: { $push: "$$ROOT" } } },
    ],
    options: {},
  });

  return new Response(JSON.stringify(tests), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache, no-transform",
    },
  });
}
