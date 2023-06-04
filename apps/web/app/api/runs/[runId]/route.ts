import { prisma } from "@/lib/db";
import { RunPutRequest } from "./models";

export const getCurrentRunResults = async (runId: string) => {
  const testOutcomes = await prisma.playwrightTests.groupBy({
    by: ["outcome"],
    where: {
      runId,
    },
    _count: {
      outcome: true,
    },
  });

  const results: Record<string, number> = {};
  testOutcomes.forEach((element) => {
    if (element.outcome) results[element.outcome] = element._count.outcome;
  });

  return results;
};

export async function PUT(request: Request, { params }: { params: { runId: string } }) {
  const requestBody = RunPutRequest.parse(await request.json());
  const results = await getCurrentRunResults(params.runId);

  // todo: update status and end time doesn't really work with shards
  const run = await prisma.playwrightRuns.update({
    where: {
      runId: params.runId,
    },
    data: { ...requestBody, results },
  });

  return new Response(JSON.stringify(run), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}
