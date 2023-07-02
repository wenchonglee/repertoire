import { getCurrentRunResults } from "../../runs/[runId]/getCurrentRunResults";
import { emitter } from "../emitter";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/runs
 *
 * This is a Server Sent Event API for clients to receive updates of Runs
 */
export async function GET() {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  const encoder = new TextEncoder();

  // Update the client with the current state of the run when RUN_UPDATED is emitted on tests' completion
  // TODO: throttle this
  // TODO: these event listeners should be removed if the client disconnects, but there doesn't seem to be a solution for that yet
  // TODO: https://github.com/vercel/next.js/discussions/48427
  emitter.on("RUN_UPDATED", async (runId: string, _testId: string) => {
    await writer.ready;
    const results = await getCurrentRunResults(runId);
    const runUpdatedEvent = {
      event: "RUN_UPDATED",
      runId,
      results,
    };

    writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(runUpdatedEvent)}\n\n`));
  });

  // Update the client if a new test run has started
  emitter.on("RUN_STARTED", async (runId: string, startTime: string) => {
    await writer.ready;
    const runStartedEvent = {
      event: "RUN_STARTED",
      runId,
      startTime,
    };

    writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(runStartedEvent)}\n\n`));
  });

  // Update the client if a test run has ended
  emitter.on("RUN_ENDED", async (runId: string, endTime: string) => {
    await writer.ready;
    const runEndedEvent = {
      event: "RUN_ENDED",
      runId,
      endTime,
    };

    writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(runEndedEvent)}\n\n`));
  });

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
