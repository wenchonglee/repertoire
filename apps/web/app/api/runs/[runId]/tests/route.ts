import { prisma } from "@/lib/db";

type RequestContext = {
  params: {
    runId: string;
  };
};

/**
 * GET /api/runs/:runId/tests
 *
 * Get all tests in a run, grouped by the tests' file name
 */
export async function GET(_request: Request, context: RequestContext) {
  const { params } = context;

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
