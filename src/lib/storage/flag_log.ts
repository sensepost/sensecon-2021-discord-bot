import { Message } from "discord.js";

import { prisma } from "./init";

// store_flag_submission stores a flag submission, assuming that it will be successful
export const store_flag_submission = async (interaction: Message, flag: string): Promise<void> => {
  await prisma.flagLog.create({
    data: {
      message_id: BigInt(interaction.id),
      user_id: BigInt(interaction.author.id),
      user_name: interaction.author.username,
      flag: flag
    }
  });
};

// mark_flag_submission_as_failed marks an existing flag submission as failed
export const mark_flag_submission_as_failed = async (interaction: Message): Promise<void> => {
  await prisma.flagLog.update({
    where: {
      message_id: BigInt(interaction.id)
    },
    data: {
      success: false
    }
  });
};
