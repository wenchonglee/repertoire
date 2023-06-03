import { prisma } from "@/lib/db";
import { RunPostRequest } from "./models";

// export async function GET(request: Request) {
//   // const runs = await prisma.runs.findMany({
//   //   orderBy: {
//   //     startTime: "desc",
//   //   },
//   // });
//   let responseStream = new TransformStream();
//   const writer = responseStream.writable.getWriter();

//   const encoder = new TextEncoder();
//   const stream = getStream();
//   stream.on("new event", () => {
//     console.log("!");
//     writer.write(encoder.encode(`data: {"time": ${new Date().toISOString()}}`));
//   });
//   stream.emit("new event");

//   return new Response(responseStream.readable, {
//     status: 200,
//     headers: {
//       "content-type": "text/event-stream",
//       connection: "keep-alive",
//       "cache-control": "no-cache, no-transform",
//       "Access-Control-Allow-Origin": "*",
//     },
//   });
// }
export async function GET(request: Request) {
  // const { searchParams } = new URL(request.url);
  // const runId = searchParams.get('runId');

  const runs = await prisma.playwrightRuns.findMany({
    orderBy: {
      startTime: "desc",
    },
  });

  return new Response(JSON.stringify(runs), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  const requestBody = RunPostRequest.parse(await request.json());
  const run = await prisma.playwrightRuns.findUnique({
    where: {
      runId: requestBody.runId,
    },
  });

  if (run) {
    if (requestBody.shardId) {
      if (run.joinedShards.includes(requestBody.shardId)) {
        // Shard run already included, can be skipped
        return new Response("Sharded run already exists", {
          status: 409,
          headers: {
            "content-type": "application/json",
          },
        });
      }

      await prisma.$transaction([
        // update the run with this shard id
        prisma.playwrightRuns.update({
          where: {
            runId: requestBody.runId,
          },
          data: {
            joinedShards: [...run.joinedShards, requestBody.shardId],
          },
        }),
        // create all the tests of this shard
        prisma.playwrightTests.createMany({
          data: requestBody.tests.map((test) => ({ ...test, runId: requestBody.runId })),
        }),
      ]);
    }
  } else {
    await prisma.$transaction([
      // create the run
      prisma.playwrightRuns.create({
        data: {
          runId: requestBody.runId,
          startTime: requestBody.startTime,
          totalShards: requestBody.totalShards,
          version: requestBody.version,
          joinedShards: requestBody.shardId ? [requestBody.shardId] : undefined,
          projects: requestBody.projects,
        },
      }),
      // create all the tests of this shard
      prisma.playwrightTests.createMany({
        data: requestBody.tests.map((test) => ({ ...test, runId: requestBody.runId })),
      }),
    ]);
  }

  return new Response(JSON.stringify(run), {
    status: 201,
    headers: {
      "content-type": "application/json",
    },
  });
}
