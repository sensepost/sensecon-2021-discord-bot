import { Message, GuildChannel } from "discord.js";

import * as log from "../../../lib/console";

import { MessageCommand } from "../../../lib/types";
import { create_voice_and_text_channels } from "../../../lib/helpers/discord";
import { extract_command_args } from "../../../lib/helpers/commands";
import { PREFIX_ADMIN } from "../../../lib/constants";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}gc`,
  desc: `create discord categories with a voice & text channel`,
  help: `usage: \`${PREFIX_ADMIN}gc <group name prefix> <number of groups>\``,
  run: async (interaction: Message): Promise<void> => {

    const { content } = interaction;
    const args = extract_command_args(content, command.name.length);

    if (args.length !== 2) {
      await interaction.reply(`erm, some args are missing. ${command.help}`);
      return;
    }

    const number_of_groups = parseInt(args[1]);

    if (!number_of_groups) {
      interaction.channel.send(`not a number, please try agin`);
      return;
    }

    log.info(`user ${interaction.author.username} created ${number_of_groups} ${args[0]} groups`);

    for (let iter = 0; iter < number_of_groups; iter++) {
      interaction.guild?.channels.create(`${args[0]}-${iter}`, { type: `GUILD_CATEGORY` })
        .then(async function (channel: GuildChannel) {
          create_voice_and_text_channels(channel);
        });
    }
  }
};
