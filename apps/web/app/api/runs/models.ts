import { z } from "zod";

export const RunPostRequest = z.object({
  runId: z.string().min(1, "Run ID is required"),
  startTime: z.string().datetime(),
  allTests: z
    .object({
      testId: z.string(),
      title: z.string(),
    })
    .array(),
});

export const RunPutRequest = z.object({
  endTime: z.string().datetime(),
  status: z.enum(["passed", "failed", "timedout", "interrupted"]),
});

export type RunPostRequest = z.infer<typeof RunPostRequest>;
export type RunResponse = RunPostRequest & z.infer<typeof RunPutRequest>;
