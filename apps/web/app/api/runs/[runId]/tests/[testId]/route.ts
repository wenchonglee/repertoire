import { prisma } from "@/lib/db";
import { z } from "zod";

export const TestPutRequest = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  outcome: z.enum(["skipped", "expected", "unexpected", "flaky"]).optional(),
  errors: z.string().nullish(),
});

export async function PUT(request: Request, { params }: { params: { runId: string; testId: string } }) {
  const requestBody = TestPutRequest.parse(await request.json());

  const test = await prisma.playwrightTests.update({
    where: {
      runId_testId: {
        runId: params.runId,
        testId: params.testId,
      },
    },
    data: requestBody,
  });

  return new Response(JSON.stringify(test), {
    status: 201,
    headers: {
      "content-type": "application/json",
    },
  });
}
