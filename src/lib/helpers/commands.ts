import {
  Message,
  MessageEmbed
} from "discord.js";
import shlex from "shlex";

import { msg_command_store } from "../../commands/store";
import { SUFFIX_HELP } from "../constants";

// returns a command without the help operator
const clean_command = (cmd: string): string => {
  return cmd.endsWith(SUFFIX_HELP) ? cmd.slice(0, -1) : cmd;
};

// check that a command exists, keeping in mind that help commands
// end with a ?
export const have_command = (interaction: Message, cmd: string): boolean => {
  cmd = clean_command(cmd);

  if (!msg_command_store.has(cmd)) {
    interaction.reply(`🧨 Invalid command. ` +
      `Use prefix to see available commands. Append \`${SUFFIX_HELP}\` for command help.`);
    return false;
  }

  return true;
};

// checks if a command is disabled
export const is_disabled_command = (interaction: Message, cmd: string): boolean => {
  cmd = clean_command(cmd);

  if (msg_command_store.get(cmd)?.disabled) {
    interaction.reply(`⛔️ Command \`${cmd}\` is disabled.`);
    return true;
  }

  return false;
};

export const print_help = (interaction: Message, cmd: string): void => {
  if (!cmd.endsWith(SUFFIX_HELP)) return;

  cmd = clean_command(cmd);

  const command = msg_command_store.get(cmd);
  if (!command) return;

  const embed = new MessageEmbed()
    .setColor("GREEN")
    .setTitle(`Command: \`${cmd}\``)
    .addField(`Disabled`, command.disabled ? `yes` : `no`)
    .addField(`help`, command.help)
    .addField(`description`, command.desc);

  interaction.reply({ embeds: [embed] });
};

// takes a string in the format of .bot.command arg1 arg2 and
// returns an array of the arguments: ['arg1', 'arg2']
export const extract_command_args = (msg: string, plen: number): string[] => {
  try {
    const args = msg.slice(plen).trim();
    return shlex.split(args).filter(e => e);  // do "shell like" splitting and remove '' entries
  } catch (e) {
    return [];
  }
};
