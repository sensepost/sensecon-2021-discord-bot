import { Message } from "discord.js";

import * as log from "../../../lib/console";

import { MessageCommand } from "../../../lib/types";
import { extract_command_args } from "../../../lib/helpers/commands";
import { PREFIX_ADMIN } from "../../../lib/constants";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}sa`,
  desc: `set the bot activity`,
  help: `usage: \`${PREFIX_ADMIN}sa new status\``,
  run: async (interaction: Message): Promise<void> => {
    const { content, client } = interaction;

    const args = extract_command_args(content, command.name.length);

    if (args.length <= 0) {
      await interaction.reply(command.help);
      return;
    }

    const activity = args.join(' ');

    log.info(`setting bot presence activity to: ${activity}`);
    await client.user?.setActivity(activity, { type: "WATCHING" });
  }
};
