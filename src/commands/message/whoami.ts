import { Message, MessageEmbed } from "discord.js";

import { PREFIX_USER } from "../../lib/constants";
import { get_member_from_id } from "../../lib/helpers/discord";
import { MessageCommand } from "../../lib/types";

export const command: MessageCommand = {
  name: `${PREFIX_USER}whoami`,
  desc: `who are you!?`,
  help: `usage: \`${PREFIX_USER}whoami\``,
  run: async (interaction: Message): Promise<void> => {

    const { client, author } = interaction;

    const member = get_member_from_id(client, interaction.author.id);

    const embed = new MessageEmbed()
      .setColor("NOT_QUITE_BLACK")
      .setTitle('Member Information')
      .setThumbnail(author.displayAvatarURL())
      .addField(`Known as`, `<@${interaction.author.id}>`, true)
      .addField(`Username`, member?.user.username || ``, true)
      .addField(`Discord ID`, interaction.author.id, true)
      .addField(`Joined Guild`, member?.guild.joinedAt.toString() || ``, true)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
};
