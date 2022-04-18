import { MessageLog } from ".prisma/client";
import { Message } from "discord.js";

import { prisma } from "./init";

// store_new_message stores a message
export const store_new_message = async (interaction: Message): Promise<void> => {
  await prisma.messageLog.create({
    data: {
      message_id: BigInt(interaction.id),
      created: interaction.createdTimestamp,
      channel_id: BigInt(interaction.channelId),
      user_id: BigInt(interaction.author.id),
      user_name: interaction.author.username,
      is_dm: interaction.channel.type === `DM` ? true : false,
      is_bot: interaction.author.bot,
    }
  });
};

// get_message_from_interaction returns an existing message based on the interaction id
export const get_message_from_interaction = async (interaction: Message): Promise<MessageLog | null> => {
  return await prisma.messageLog.findUnique({
    where: {
      message_id: BigInt(interaction.id)
    }
  });
};

// mark_message_as_deleted marks a message as deleted
export const mark_message_as_deleted = async (interaction: Message): Promise<void> => {
  await prisma.messageLog.update({
    where: {
      message_id: BigInt(interaction.id)
    },
    data: {
      is_deleted: true
    }
  });
};

// mark_message_as_edited marks a message as edited, saving the new message content
export const mark_message_as_edited = async (interaction: Message): Promise<void> => {
  await prisma.messageLog.update({
    where: {
      message_id: BigInt(interaction.id)
    },
    data: {
      is_edited: true,
    }
  });
};
