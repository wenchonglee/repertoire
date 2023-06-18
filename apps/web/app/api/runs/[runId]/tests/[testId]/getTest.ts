import { prisma } from "@/lib/db";

export const getTest = async (runId: string, testId: string) => {
  const test = await prisma.playwrightTests.findUnique({
    where: {
      runId_testId: {
        runId,
        testId,
      },
    },
  });

  return test;
};
