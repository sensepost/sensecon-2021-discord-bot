import { Message } from "discord.js";

import { MessageCommand } from "../../../lib/types";
import { PREFIX_ADMIN } from "../../../lib/constants";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}ex`,
  desc: `exit the bot. if pm2 is supervising, it should come back automatically`,
  help: `usage: \`${PREFIX_ADMIN}ex\``,
  run: async (interaction: Message): Promise<void> => {
    await interaction.reply(`bye 👋`);

    process.exit(0);
  }
};
