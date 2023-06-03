import { z } from "zod";

export const TestPutRequest = z.object({
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  outcome: z.enum(["skipped", "expected", "unexpected", "flaky"]).optional(),
  status: z.enum(["passed", "failed", "timedOut", "skipped", "interrupted"]).optional(),
  expectedStatus: z.enum(["passed", "failed", "timedOut", "skipped", "interrupted"]).optional(),
  errors: z.string().nullish(),
});
