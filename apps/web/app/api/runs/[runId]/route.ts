import { prisma } from "@/lib/db";
import { emitter } from "../../events/emitter";
import { getCurrentRunResults } from "./getCurrentRunResults";
import { getRun } from "./getRun";
import { RunPutRequest } from "./models";

type RequestContext = {
  params: { runId: string };
};

/**
 * GET /api/runs/:runId
 *
 * Get the details of the run, which includes a numerical summary of the run
 */
export async function GET(_request: Request, context: RequestContext) {
  const { params } = context;
  const run = await getRun(params.runId);

  return new Response(JSON.stringify(run), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  });
}

/**
 * PUT /api/runs/:runId
 *
 * Update the run, this is only used when the run is sharded
 */
export async function PUT(request: Request, context: RequestContext) {
  const { params } = context;
  const requestBody = RunPutRequest.parse(await request.json());
  const results = await getCurrentRunResults(params.runId);

  // todo: update status and end time doesn't really work with shards
  const run = await prisma.playwrightRuns.update({
    where: {
      runId: params.runId,
    },
    data: {
      ...requestBody,
      results,
    },
  });

  if (requestBody.endTime) {
    emitter.emit("RUN_ENDED", params.runId, requestBody.endTime);
  }

  return new Response(JSON.stringify(run), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
