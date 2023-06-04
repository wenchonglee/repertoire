import { prisma } from "@/lib/db";
import type { PlaywrightRuns } from "@prisma/client";
import { RunPostRequest } from "./models";

export type RunResponse = PlaywrightRuns;
const PAGE_SIZE = 2;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page");

  const [totalCount, runs] = await prisma.$transaction([
    prisma.playwrightRuns.count(),
    prisma.playwrightRuns.findMany({
      take: PAGE_SIZE,
      // page is 1-indexed to clients
      skip: page ? (Number(page) - 1) * PAGE_SIZE : 0,
      orderBy: {
        startTime: "desc",
      },
    }),
  ]);

  return new Response(JSON.stringify({ totalCount, runs }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-cache",
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
