import { getTests } from "@/app/api/runs/[runId]/tests/getTests";
import { throttle } from "lodash";
import { emitter } from "../../emitter";
export const dynamic = "force-dynamic";

/**
 * GET /api/events/runs/:runId
 *
 * This is a Server Sent Event API for clients to receive updates of a single Run
 */
export async function GET() {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  const encoder = new TextEncoder();

  // Update the client with test outcomes when RUN_UPDATED is emitted on tests' completion
  // TODO: throttle this
  // TODO: these event listeners should be removed if the client disconnects, but there doesn't seem to be a solution for that yet
  // TODO: https://github.com/vercel/next.js/discussions/48427
  emitter.on(
    "RUN_UPDATED",
    throttle(
      async (runId: string, _testId: string) => {
        await writer.ready;
        const results = await getTests(runId);
        const runUpdatedEvent = {
          event: "RUN_UPDATED",
          runId,
          results,
        };

        writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(runUpdatedEvent)}\n\n`));
      },
      5000,
      { leading: true }
    )
  );

  writer.write(encoder.encode("ready"));

  return new Response(responseStream.readable, {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      connection: "keep-alive",
      "cache-control": "no-cache, no-transform",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
