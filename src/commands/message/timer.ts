import { Message } from "discord.js";

import { PREFIX_USER } from "../../lib/constants";
import { extract_command_args } from "../../lib/helpers/commands";
import { MessageCommand } from "../../lib/types";

export const command: MessageCommand = {
  name: `${PREFIX_USER}timer`,
  desc: `start a timer`,
  help: `usage: \`${PREFIX_USER}timer <number of minutes to wait>\``,
  run: async (interaction: Message): Promise<void> => {

    const { content } = interaction;

    const args = extract_command_args(content, command.name.length);
    if (args.length < 1) {
      await interaction.reply(`Need a # of minutes to wait. See \`${command.name}?\``);
      return;
    }

    const [minutes_arg,] = args;
    const minutes = parseInt(minutes_arg);
    if (!minutes) {
      await interaction.reply(`Failed to parse '${minutes_arg}'. Make sure its a number.`);
      return;
    }

    // wait for ${minutes}
    setTimeout(() => {
      interaction.reply(`⏰ ${minutes} ${minutes > 1 ? 'minutes' : 'minute'} is over!`);
    }, ((1000 * 60) * minutes));

    await interaction.reply(`Alright, waiting for ${minutes} ${minutes > 1 ? 'minutes' : 'minute'}`);
  }
};
