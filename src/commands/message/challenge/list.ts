import { Message, MessageEmbed } from "discord.js";

import { PREFIX_CHAL } from "../../../lib/constants";
import { MessageCommand } from "../../../lib/types";
import { msg_command_store as cmds } from "../../store";

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}`,
  desc: `list all of the challenge commands available`,
  help: `usage: \`${PREFIX_CHAL}\``,
  run: async (interaction: Message): Promise<void> => {

    // https://discordjs.guide/popular-topics/embeds.html#embed-limits
    // WARN: There is a 25 field limit, so we'll need to count the commands
    // before we build an embed soon™

    // challenge commands
    const ch = new MessageEmbed()
      .setColor("DARK_BLUE")
      .setTitle(`Challenge Commands (\`${cmds.filter(c => c.name.startsWith(PREFIX_CHAL)).size}\`)`);

    cmds
      .sort((a, b) => (a.name > b.name ? 1 : -1))   // sort commands
      .filter(c => c.name.startsWith(PREFIX_CHAL))  // challenge commands start with &
      .each(c => ch.addField(c.name, c.desc, true)); // set the fields in the embed

    await interaction.reply({ embeds: [ch] });
  }
};
