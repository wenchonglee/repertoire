import { z } from "zod";

export const RunPostRequest = z.object({
  runId: z.string().min(1, "Run ID is required"),
  startTime: z.string().datetime(),
  projects: z.string().array(),
  totalShards: z.number(),
  shardId: z.number().optional(), // this request's shard id
  version: z.string(),
  tests: z
    .object({
      groupTitle: z.string().optional(),
      fileName: z.string(),
      projectName: z.string(),
      title: z.string(),
      testId: z.string(),
      tags: z.string().array(),
      titlePath: z.string().array(),
      timeout: z.number(),
      annotations: z
        .object({
          type: z.string(),
          description: z.string().optional(),
        })
        .array(),
      expectedStatus: z.enum(["passed", "failed", "timedOut", "skipped", "interrupted"]),
    })
    .array(),
});

export type RunPostRequest = z.infer<typeof RunPostRequest>;
