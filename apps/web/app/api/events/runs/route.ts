import { getCurrentRunResults } from "../../runs/[runId]/route";
import { emitter } from "../emitter";

export async function GET(request: Request) {
  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();

  const encoder = new TextEncoder();

  emitter.on("RUN_UPDATED", async (runId: string, _testId: string) => {
    const results = await getCurrentRunResults(runId);
    const runUpdatedEvent = { runId, results, event: "RUN_UPDATED" };

    writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(runUpdatedEvent)}\n\n`));
  });

  emitter.on("RUN_STARTED", async (runId: string, startTime: string) => {
    const runStartedEvent = { runId, startTime, event: "RUN_STARTED" };

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
