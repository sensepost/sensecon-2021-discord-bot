import { BotActivityTracker } from "@prisma/client";
import { prisma } from "./init";

// set_bot_activity sets the latest bot activity
export const set_bot_activity = async (activity: string, type: string): Promise<void> => {
  await prisma.botActivityTracker.create({
    data: {
      activity: activity,
      type: type
    }
  });
};

// get_bot_activity gets the current bot activity
export const get_bot_activity = async (): Promise<BotActivityTracker | undefined> => {
  const bot_activity = await prisma.botActivityTracker.findFirst({
    orderBy: {
      created_at: `desc`
    }
  });

  if (!bot_activity) return;

  return bot_activity;
};
