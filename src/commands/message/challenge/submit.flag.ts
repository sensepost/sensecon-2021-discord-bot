import { Message } from "discord.js";

import * as log from "../../../lib/console";
import * as flag_log_repo from "../../../lib/storage/flag_log";

import { MessageCommand } from "../../../lib/types";
import { PREFIX_CHAL } from "../../../lib/constants";
import {
  get_member_from_id,
  get_role_from_name,
  give_member_role
} from "../../../lib/helpers/discord";
import { extract_command_args } from "../../../lib/helpers/commands";
import { flags } from "../../../lib/flags";   // valid flags live here!

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}sf`,
  desc: `submit challenge flags via a DM`,
  help: `usage: \`${PREFIX_CHAL}sf SENSECON{YourFlagHere}\``,
  run: async (interaction: Message): Promise<void> => {

    // remove messages for this command if it was not a DM
    if (interaction.channel.type !== `DM`) {
      interaction.delete();
      interaction.channel.send(
        `<@${interaction.author.id}>, flag submissions should rather be done in a DM with me please!`);
      return;
    }

    const { content, client } = interaction;
    const args = extract_command_args(content, command.name.length);

    if (args.length < 1) {
      await interaction.reply(`erm, some args are missing. ${command.help}`);
      return;
    }

    const flag = args.join(' ');

    // save the flag submission attempt. its considered successful by default
    flag_log_repo.store_flag_submission(interaction, flag);

    if (!flag.startsWith(`SENSECON{`) || !flag.endsWith(`}`)) {
      await interaction.reply(`Invalid flag format.`);
      flag_log_repo.mark_flag_submission_as_failed(interaction);
      return;
    }

    const new_role = flags.find(f => f.flag == flag);
    if (!new_role) {
      await interaction.reply(`Sorry, that is not a valid flag.`);
      flag_log_repo.mark_flag_submission_as_failed(interaction);
      return;
    }

    const role = get_role_from_name(client, new_role.role_name);
    if (!role) {
      log.error(`tried to give user a role ${new_role.role_name} that could not be found on discord`);
      flag_log_repo.mark_flag_submission_as_failed(interaction);
      return;
    }

    const member = get_member_from_id(client, interaction.author.id);
    if (!member) {
      log.error(`could not find member to give new role to`);
      flag_log_repo.mark_flag_submission_as_failed(interaction);
      return;
    }

    give_member_role(member, role);

    await interaction.reply(`🎉 Congratulations! You now have the \`${new_role.role_name}\` role!`);
  }
};
