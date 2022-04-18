import { Message, MessageEmbed } from "discord.js";
import * as prettyms from "pretty-ms";

import { MessageCommand } from "../../../lib/types";
import { PREFIX_ADMIN } from "../../../lib/constants";
import { prisma } from "../../../lib/storage/init";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}s`,
  desc: `display bot statistics`,
  help: `usage: \`${PREFIX_ADMIN}s\``,
  run: async (interaction: Message): Promise<void> => {

    const { client } = interaction;
    const ready = await prisma.statistic.findFirst({ where: { event: `ready` } });

    const embed = new MessageEmbed()
      .setTitle(`discord bot stats`)
      .addFields([
        { name: `boots`, value: `\`${ready?.count}\``, inline: true },
        { name: `guilds`, value: `\`${client.guilds.cache.size}\``, inline: true },
        { name: `users`, value: `\`${client.users.cache.size}\``, inline: true },
        { name: `uptime`, value: `\`${(prettyms.default(client.uptime || 0))}\``, inline: true },
        { name: `channels`, value: `\`${client.channels.cache.size}\``, inline: true },
        { name: `websocket`, value: `\`${interaction.client.ws.ping}ms\``, inline: true }
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
