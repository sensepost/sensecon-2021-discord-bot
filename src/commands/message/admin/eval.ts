import { Message, MessageEmbed } from "discord.js";
import { codeBlock } from "@discordjs/builders";

import { MessageCommand } from "../../../lib/types";
import { PREFIX_ADMIN } from "../../../lib/constants";
import { extract_command_args } from "../../../lib/helpers/commands";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}e`,
  disabled: true,
  desc: `evaluate javascript in the context of the bot process`,
  help: `usage: \`${PREFIX_ADMIN}e javascript source\``,
  run: async (interaction: Message): Promise<void> => {

    const { content } = interaction;
    const args = extract_command_args(content, command.name.length);
    const js = args.join(' ');

    let r: any;
    try {
      r = eval(js);
    } catch (e) {
      r = e;
    }

    const embed = new MessageEmbed()
      .setColor("DARK_RED")
      .setTitle(`Eval`)
      .addField(`Input`, codeBlock(`javascript`, js))
      .addField(`Output`, codeBlock(r));

    await interaction.reply({ embeds: [embed] });
  }
};
