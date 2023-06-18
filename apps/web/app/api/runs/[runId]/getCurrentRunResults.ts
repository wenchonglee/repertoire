import { prisma } from "@/lib/db";

export const getCurrentRunResults = async (runId: string) => {
  const testOutcomes = await prisma.playwrightTests.groupBy({
    by: ["outcome"],
    where: {
      runId,
    },
    _count: {
      outcome: true,
    },
  });

  const results: Record<string, number> = {};
  testOutcomes.forEach((element) => {
    if (element.outcome) results[element.outcome] = element._count.outcome;
  });

  return results;
};
