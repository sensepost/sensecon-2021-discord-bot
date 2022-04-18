import { Message, MessageEmbed } from "discord.js";

import { PREFIX_USER } from "../../lib/constants";
import { MessageCommand } from "../../lib/types";
import { msg_command_store as cmds } from "../store";

export const command: MessageCommand = {
  name: `${PREFIX_USER}`,
  desc: `list all of the user commands available`,
  help: `usage: \`${PREFIX_USER}\``,
  run: async (interaction: Message): Promise<void> => {

    // https://discordjs.guide/popular-topics/embeds.html#embed-limits
    // WARN: There is a 25 field limit, so we'll need to count the commands
    // before we build an embed soon™

    // user commands
    const u = new MessageEmbed()
      .setColor("DARK_GREEN")
      .setTitle(`User Commands (\`${cmds.filter(c => c.name.startsWith(PREFIX_USER)).size}\`)`);

    cmds
      .sort((a, b) => (a.name > b.name ? 1 : -1))   // sort commands
      .filter(c => c.name.startsWith(PREFIX_USER))  // user commands start with .
      .each(c => u.addField(c.name, c.desc, true)); // set the fields in the embed

    await interaction.reply({ embeds: [u] });
  }
};
