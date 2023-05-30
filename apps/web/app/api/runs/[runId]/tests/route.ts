import { prisma } from "@/lib/db";
import { z } from "zod";
import type { TestPutRequest } from "./[testId]/route";

const TestPostRequest = z.object({
  testId: z.string().min(1, "Test ID is Required"),
  title: z.string(),
  startTime: z.string().datetime(),
  titlePath: z.string().array(),
  annotations: z.object({ type: z.string(), description: z.string().optional() }).array(),
  location: z.object({ column: z.number(), file: z.string(), line: z.number() }),
  retries: z.number(),
  timeout: z.number(),
  expectedStatus: z.enum(["passed", "failed", "timedOut", "skipped", "interrupted"]),
});

export type TestResponse = z.infer<typeof TestPostRequest> & z.infer<typeof TestPutRequest>;

export async function GET(request: Request, { params }: { params: { runId: string } }) {
  const tests = await prisma.tests.findMany({
    where: {
      runId: params.runId,
    },
  });

  return new Response(JSON.stringify(tests), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function POST(request: Request, { params }: { params: { runId: string } }) {
  const requestBody = TestPostRequest.parse(await request.json());

  const test = await prisma.tests.create({
    data: {
      runId: params.runId,
      ...requestBody,
    },
  });

  return new Response(JSON.stringify(test), {
    status: 201,
    headers: {
      "content-type": "application/json",
    },
  });
}
