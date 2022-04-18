import { Message } from "discord.js";

import * as log from "../../../lib/console";

import { MessageCommand } from "../../../lib/types";
import { PREFIX_ADMIN } from "../../../lib/constants";
import { get_text_channel_from_mention } from "../../../lib/helpers/discord";
import { extract_command_args } from "../../../lib/helpers/commands";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}a`,
  desc: `make an announcement`,
  help: `usage: \`${PREFIX_ADMIN}a #channel_name message\``,
  run: async (interaction: Message): Promise<void> => {

    const { content, client } = interaction;
    const args = extract_command_args(content, command.name.length);

    if (args.length < 2) {
      await interaction.reply(`erm, some args are missing. ${command.help}`);
      return;
    }

    const [channel_identifier,] = args;

    //this will only fire when interacting with the bot via a channel on a guild. 
    //attempting to dm the bot will fail here since it doesnt know which guild.
    const channel = get_text_channel_from_mention(client, channel_identifier);

    if (!channel) {
      await interaction.reply(`erm, no such channel exists`);
      return;
    }

    args.shift();

    log.info(`${interaction.author.username} announced to ${channel.name} with ${args.join(` `)}`);
    await channel.send(args.join(` `));
  }
};
