import { emitter } from "@/app/api/events/emitter";
import { prisma } from "@/lib/db";
import { TestPutRequest } from "./models";

type RequestContext = {
  params: {
    runId: string;
    testId: string;
  };
};

/**
 * GET /api/runs/:runId/tests/:testId
 *
 * Get a single test result
 */
export async function GET(request: Request, context: RequestContext) {
  const { params } = context;

  const test = await prisma.playwrightTests.findUnique({
    where: {
      runId_testId: {
        runId: params.runId,
        testId: params.testId,
      },
    },
  });

  return new Response(JSON.stringify(test), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

/**
 * PUT /api/runs/:runId/tests/:testId
 *
 * Update a single test result
 */
export async function PUT(request: Request, context: RequestContext) {
  const { params } = context;

  const requestBody = TestPutRequest.parse(await request.json());

  const test = await prisma.playwrightTests.update({
    where: {
      runId_testId: {
        runId: params.runId,
        testId: params.testId,
      },
    },
    data: {
      ...requestBody,
      // TODO: find a better way to patch the url
      attachments: requestBody.attachments?.map((attachment) => {
        let fileName = attachment.fileName;
        if (fileName.split(".").length === 1) {
          fileName = fileName + "." + attachment.contentType.split("/").pop();
        }

        return {
          fileName,
          url: "http://localhost:9000/repertoire/" + params.runId + "/" + params.testId + "/" + fileName,
          contentType: attachment.contentType,
        };
      }),
    },
  });

  emitter.emit("RUN_UPDATED", params.runId, params.testId);

  return new Response(JSON.stringify(test), {
    status: 201,
    headers: { "content-type": "application/json" },
  });
}
