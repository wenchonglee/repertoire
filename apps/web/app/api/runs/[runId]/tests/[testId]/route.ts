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

  return new Response(JSON.stringify(test), {
    status: 201,
    headers: {
      "content-type": "application/json",
    },
  });
}
