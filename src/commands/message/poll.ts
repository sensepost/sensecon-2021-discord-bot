import {
  Message,
  MessageEmbed
} from "discord.js";

import { PREFIX_USER } from "../../lib/constants";
import { extract_command_args } from "../../lib/helpers/commands";
import { MessageCommand } from "../../lib/types";

const numbers = [
  `1️⃣`, `2️⃣`, `3️⃣`, `4️⃣`, `5️⃣`, `6️⃣`, `7️⃣`, `8️⃣`, `9️⃣`
];

export const command: MessageCommand = {
  name: `${PREFIX_USER}poll`,
  desc: `create a simple poll`,
  help: `usage: \`${PREFIX_USER}poll "<question>" "<choice 1>" "<choice 2>" "<choice ...>"\``,
  run: async (interaction: Message): Promise<void> => {

    const { content } = interaction;

    const args = extract_command_args(content, command.name.length);
    if (args.length < 3) {
      await interaction.reply(`Need a question and at least two answers. See \`${command.name}?\``);
      return;
    }

    const [question,] = args;
    args.shift();

    if (args.length > 10) {
      await interaction.reply(`Nah, more than 10 questions is too much for me.`);
      return;
    }
    const embed = new MessageEmbed()
      .setTitle(`Let's vote!`)
      .setDescription(question)
      .setTimestamp();

    for (let i = 0; i < args.length; i++) {
      const e = args[i];
      embed.addField(numbers[i], e);
    }

    const msg = await interaction.reply({ embeds: [embed] });

    for (let i = 0; i < args.length; i++) {
      await msg.react(numbers[i]);
    }
  }
};
