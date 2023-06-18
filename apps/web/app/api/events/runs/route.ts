import { getCurrentRunResults } from "../../runs/[runId]/getCurrentRunResults";
import { emitter } from "../emitter";

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
  emitter.on("RUN_UPDATED", async (runId: string, _testId: string) => {
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
    const runStartedEvent = {
      event: "RUN_STARTED",
      runId,
      startTime,
    };

    writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(runStartedEvent)}\n\n`));
  });

  writer.write(encoder.encode(`event: open`));

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
