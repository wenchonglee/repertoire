import { z } from "zod";

export const RunPutRequest = z.object({
  endTime: z.string().datetime(),
  status: z.enum(["passed", "failed", "timedout", "interrupted"]),
});
