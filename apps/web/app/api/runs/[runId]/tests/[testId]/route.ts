import { prisma } from "@/lib/db";
import { z } from "zod";

export const TestPutRequest = z.object({
  endTime: z.string().datetime(),
  outcome: z.enum(["skipped", "expected", "unexpected", "flaky"]).optional(),
  errors: z.string().nullish(),
});

export async function PUT(request: Request, { params }: { params: { runId: string; testId: string } }) {
  const requestBody = TestPutRequest.parse(await request.json());

  const test = await prisma.tests.update({
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
