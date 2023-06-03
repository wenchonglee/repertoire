import { prisma } from "@/lib/db";
import { RunPutRequest } from "./models";

export async function PUT(request: Request, { params }: { params: { runId: string } }) {
  const requestBody = RunPutRequest.parse(await request.json());

  const run = await prisma.playwrightRuns.update({
    where: {
      runId: params.runId,
    },
    data: requestBody,
  });

  return new Response(JSON.stringify(run), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}
