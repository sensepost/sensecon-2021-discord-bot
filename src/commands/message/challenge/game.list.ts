import { Message } from "discord.js";
import { codeBlock } from "@discordjs/builders";

import { MessageCommand } from "../../../lib/types";
import { game_list, PREFIX_CHAL } from "../../../lib/constants";

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}gl`,
  desc: `list available games`,
  help: `usage: \`${PREFIX_CHAL}gl\``,
  run: async (interaction: Message): Promise<void> => {
    await interaction.channel.send(codeBlock(game_list.join(`\n`)));
  }
};
