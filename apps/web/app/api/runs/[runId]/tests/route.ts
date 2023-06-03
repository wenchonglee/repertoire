import { prisma } from "@/lib/db";
import { z } from "zod";
import { getStream } from "../../emitter";
import type { TestPutRequest } from "./[testId]/models";
import type { TestPostRequest } from "./models";

// TODO: double check if there is a way to avoid the $date cast by aggregateRaw
export type TestResponse = z.infer<typeof TestPostRequest> &
  z.infer<typeof TestPutRequest> & { startTime: { $date: string }; endTime: { $date: string }; projectName: string };

export async function GET(request: Request, { params }: { params: { runId: string } }) {
  const tests = await prisma.playwrightTests.aggregateRaw({
    pipeline: [{ $match: { runId: params.runId } }, { $group: { _id: "$fileName", tests: { $push: "$$ROOT" } } }],
    options: {},
  });
  const stream = getStream();

  stream.emit("new event");

  return new Response(JSON.stringify(tests), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache, no-transform",
    },
  });
}
