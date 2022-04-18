import { Message } from "discord.js";

import { MessageCommand } from "../../../lib/types";
import {
  get_role_from_mention,
  get_user_from_mention,
  guild_member_from_user,
  revoke_role_from_member
} from "../../../lib/helpers/discord";
import { extract_command_args } from "../../../lib/helpers/commands";
import { PREFIX_ADMIN } from "../../../lib/constants";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}r`,
  desc: `revoke a role from someone`,
  help: `usage: \`${PREFIX_ADMIN}r @user @role\``,
  run: async (interaction: Message): Promise<void> => {

    const { content, client } = interaction;
    const args = extract_command_args(content, command.name.length);

    if (args.length < 2) {
      await interaction.reply(`erm, some args are missing. ${command.help}`);
      return;
    }

    const [member, role,] = args;

    const discord_user = get_user_from_mention(client, member);
    if (!discord_user) {
      await interaction.reply(`Failed to get user from mention`);
      return;
    }
    const discord_role = get_role_from_mention(client, role);
    if (!discord_role) {
      await interaction.reply(`Failed to get role from mention`);
      return;
    }
    const discord_member = guild_member_from_user(client, discord_user);
    if (!discord_member) {
      await interaction.reply(`Failed to find the member or the role.`);
      return;
    }

    revoke_role_from_member(discord_member, discord_role);
  }
};
