import { PAGE_SIZE, prisma } from "@/lib/db";

export const getRuns = async (page: number) => {
  const [totalCount, runs] = await prisma.$transaction([
    prisma.playwrightRuns.count(),
    prisma.playwrightRuns.findMany({
      take: PAGE_SIZE,
      // page is 1-indexed to clients
      skip: page ? (page - 1) * PAGE_SIZE : 0,
      orderBy: {
        startTime: "desc",
      },
    }),
  ]);

  return { totalCount, runs };
};
