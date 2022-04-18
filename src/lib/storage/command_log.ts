import { Message } from "discord.js";

import { prisma } from "./init";

// store_new_command stores a new command invocation
export const store_new_command = async (interaction: Message, prefix: string): Promise<void> => {
  await prisma.commandLog.create({
    data: {
      message_id: BigInt(interaction.id),
      user_id: BigInt(interaction.author.id),
      user_name: interaction.author.username,
      prefix: prefix,
      command: interaction.content
    }
  });
  return;
};

// fail_stored_command_with_reason marks a command invocation as failed with a reason
export const fail_stored_command_with_reason = async (interaction: Message, reason: string): Promise<void> => {
  await prisma.commandLog.update({
    where: {
      message_id: BigInt(interaction.id)
    },
    data: {
      success: false,
      reason: reason
    }
  });
};
