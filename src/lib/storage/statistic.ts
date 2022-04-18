import { prisma } from "./init";

// increment_event_statistic increment's an event count statistic
export const increment_event_statistic = async (event: string): Promise<void> => {
  await prisma.statistic.upsert({
    where: {
      event: event
    },
    update: {
      count: {
        increment: 1
      }
    },
    create: {
      event: event,
      count: 1
    }
  });
};

// get_event_statistic returns the count for an event
export const get_event_statistic = async (event: string): Promise<number> => {
  const stat = await prisma.statistic.findUnique({
    where: {
      event: event
    }
  });

  if (!stat) return 0;

  return stat.count;
};
