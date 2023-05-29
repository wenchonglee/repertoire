import { prisma } from "@/lib/db";
import { RunPostRequest } from "./models";

export async function GET(request: Request) {
  // const { searchParams } = new URL(request.url);
  // const runId = searchParams.get('runId');

  const runs = await prisma.runs.findMany();

  return new Response(JSON.stringify(runs), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  const requestBody = RunPostRequest.parse(await request.json());

  const run = await prisma.runs.create({
    data: {
      runId: requestBody.runId,
      startTime: requestBody.startTime,
      allTests: requestBody.allTests,
    },
  });

  return new Response(JSON.stringify(run), {
    status: 201,
    headers: {
      "content-type": "application/json",
    },
  });
}
