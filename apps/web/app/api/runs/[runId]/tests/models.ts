import { z } from "zod";

export const TestPostRequest = z.object({
  testId: z.string().min(1, "Test ID is Required"),
  title: z.string(),
  startTime: z.string().datetime(),
  titlePath: z.string().array(),
  annotations: z.object({ type: z.string(), description: z.string().optional() }).array(),
  location: z.object({ column: z.number(), file: z.string(), line: z.number() }),
  retries: z.number(),
  timeout: z.number(),
  expectedStatus: z.enum(["passed", "failed", "timedOut", "skipped", "interrupted"]),
});
