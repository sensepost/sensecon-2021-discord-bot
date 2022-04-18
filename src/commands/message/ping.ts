import { Message } from "discord.js";

import { PREFIX_USER } from "../../lib/constants";
import { MessageCommand } from "../../lib/types";

export const command: MessageCommand = {
  name: `${PREFIX_USER}ping`,
  desc: `check bot latency`,
  help: `usage: \`${PREFIX_USER}ping\``,
  run: async (interaction: Message): Promise<void> => {
    await interaction.reply('Pinging...',)
      .then(sent => {
        sent.edit(`Websocket latency: \`${interaction.client.ws.ping}ms\`\n` +
          `Full Roundtrip latency: \`${sent.createdTimestamp - interaction.createdTimestamp}ms\``);
      });
  }
};
