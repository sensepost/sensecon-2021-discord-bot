import { Message, MessageEmbed } from "discord.js";
import {
  BOT_ADMIN,
  PREFIX_ADMIN,
  PREFIX_CHAL,
  PREFIX_USER
} from "../../../lib/constants";
import { MessageCommand } from "../../../lib/types";
import { msg_command_store as cmds } from "../../store";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}`,
  desc: `list all of the commands available`,
  help: `usage: \`${PREFIX_ADMIN}\``,
  run: async (interaction: Message): Promise<void> => {

    // https://discordjs.guide/popular-topics/embeds.html#embed-limits
    // WARN: There is a 25 field limit, so we'll need to count the commands
    // before we build an embed soon™

    // user commands
    const u = new MessageEmbed()
      .setColor("DARK_GREEN")
      .setTitle(`User Commands (\`${cmds.filter(c => c.name.startsWith(`.`)).size}\`)`);

    cmds
      .sort((a, b) => (a.name > b.name ? 1 : -1))   // sort commands
      .filter(c => c.name.startsWith(PREFIX_USER))  // user commands start with .
      .each(c => u.addField(c.name, c.desc, true)); // set the fields in the embed

    // challenge commands
    const ch = new MessageEmbed()
      .setColor("DARK_BLUE")
      .setTitle(`Challenge Commands (\`${cmds.filter(c => c.name.startsWith(`&`)).size}\`)`);

    cmds
      .sort((a, b) => (a.name > b.name ? 1 : -1))   // sort commands
      .filter(c => c.name.startsWith(PREFIX_CHAL))  // challenge commands start with &
      .each(c => ch.addField(c.name, c.desc, true)); // set the fields in the embed

    // admin commands
    const a = new MessageEmbed()
      .setColor("DARK_RED")
      .setTitle(`Admin Commands (\`${cmds.filter(c => c.name.startsWith(`~`)).size}\`)`);

    cmds
      .sort((a, b) => (a.name > b.name ? 1 : -1))   // sort commands
      .filter(c => c.name.startsWith(PREFIX_ADMIN)) // admin commands start with ~
      .each(c => a.addField(c.name, c.desc, true)); // set the fields in the embed

    // if we're in the bot-admin channel, reply there.
    if (interaction.channel.id == BOT_ADMIN) {
      await interaction.reply({ embeds: [u, ch, a] });
      return;
    }

    // send a dm instead.
    await interaction.author.send({ embeds: [u, ch, a] });
    await interaction.reply(`sent you a dm! 💥`);
  }
};
