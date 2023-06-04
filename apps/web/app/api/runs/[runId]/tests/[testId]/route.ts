import { emitter } from "@/app/api/events/emitter";
import { prisma } from "@/lib/db";
import { TestPutRequest } from "./models";

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
  emitter.emit("RUN_UPDATED", params.runId, params.testId);

  return new Response(JSON.stringify(test), {
    status: 201,
    headers: {
      "content-type": "application/json",
    },
  });
}
