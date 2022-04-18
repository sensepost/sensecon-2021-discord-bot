import { Message } from "discord.js";

import * as log from "../../../lib/console";

import { MessageCommand } from "../../../lib/types";
import { extract_command_args } from "../../../lib/helpers/commands";
import { PREFIX_ADMIN } from "../../../lib/constants";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}gd`,
  desc: `delete discord categories with a voice & text channel`,
  help: `usage: \`${PREFIX_ADMIN}gd <group name prefix>\``,
  run: async (interaction: Message): Promise<void> => {

    const { content } = interaction;
    const args = extract_command_args(content, command.name.length);

    if (args.length !== 1) {
      await interaction.reply(`erm, some args are missing. ${command.help}`);
      return;
    }

    const channels = interaction.guild?.channels.cache.filter(channel =>
      channel.name.indexOf(args[0]) !== -1);

    const x = interaction.guild?.channels.cache.map(c => c.name);

    channels?.forEach(c => {
      log.info(`user ${interaction.author.username} deleted channel ${c.name}`);
      const channels = interaction.guild?.channels.cache.filter(channel => channel.parentId === c.id);
      channels?.forEach(c => c.delete());
      c.delete();
    });
  }
};
