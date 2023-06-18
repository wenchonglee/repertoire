import { prisma } from "@/lib/db";

export const getRun = async (runId: string) => {
  const run = await prisma.playwrightRuns.findUnique({
    where: {
      runId,
    },
  });

  return run;
};
