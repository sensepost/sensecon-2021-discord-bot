import { REST } from "@discordjs/rest";
import { Routes } from 'discord-api-types/v9';

import * as log from '../lib/console';

import {
  CLIENT_ID,
  DISCORD_TOKEN,
  GUILD_ID
} from "../lib/constants";

import {
  slash_command_store,
  msg_command_store
} from "../commands/store";

// slash commands
import { command as slash_verify_email } from "../commands/slash/verify";

// user commands
import { command as msg_user_avatar } from "../commands/message/avatar";
import { command as msg_user_ping } from "../commands/message/ping";
import { command as msg_user_whoami } from "../commands/message/whoami";
import { command as msg_user_list } from "../commands/message/list";
import { command as msg_user_poll } from "../commands/message/poll";
import { command as msg_user_timer } from "../commands/message/timer";

// challenge commands
import { command as msg_chal_game_list } from "../commands/message/challenge/game.list";
import { command as msg_chal_game_play } from "../commands/message/challenge/game.play";
import { command as msg_chal_password_download } from "../commands/message/challenge/password/download";
import { command as msg_chal_global_nuclear_wasm } from "../commands/message/challenge/gtw/wasm";
import { command as msg_chal_global_nuclear_kernel } from "../commands/message/challenge/gtw/initrd";
import { command as msg_chal_flag_submit } from "../commands/message/challenge/submit.flag";
import { command as msg_chal_list } from "../commands/message/challenge/list";
import { command as msg_defcon_level } from "../commands/message/challenge/defcon.level";
import { command as msg_chal_passwd_submit } from "../commands/message/challenge/password/submit.clears";
import { command as msg_chal_passwd_score } from "../commands/message/challenge/password/score";

// admin commands
import { command as msg_admin_help } from "../commands/message/admin/list";
import { command as msg_admin_eval } from "../commands/message/admin/eval";
import { command as msg_admin_activity } from "../commands/message/admin/status.activity";
import { command as msg_admin_presence } from "../commands/message/admin/status.presence";
import { command as msg_admin_stats } from "../commands/message/admin/stats";
import { command as msg_admin_announce } from "../commands/message/admin/announce";
import { command as msg_admin_group_create } from "../commands/message/admin/groups.create";
import { command as msg_admin_group_delete } from "../commands/message/admin/groups.delete";
import { command as msg_admin_exit } from "../commands/message/admin/exit";
import { command as msg_admin_give_role } from "../commands/message/admin/give";
import { command as msg_admin_revoke_role } from "../commands/message/admin/revoke";
import { command as msg_admin_db_maintenance } from "../commands/message/admin/db.maintenance";

import {
  MessageCommand,
  SlashCommand
} from "../lib/types";

// registers commands that are defined.
//
// commands are loaded as defined in commands/(slash/message).
// each command exports a `command` variable. these are
// iterated and a global command store populated to later
// matching and firing in the `interactionCreate` event.
//
// this method also updates the availavle / commands using
// the discord API for the configured guild.
export const register_commands = (): void => {

  // message commands (those triggered via the messageCreate event)
  const message_command_groups: MessageCommand[] = [
    // user commands
    msg_user_avatar,
    msg_user_ping,
    msg_user_whoami,
    msg_user_list,
    msg_user_poll,
    msg_user_timer,

    //challenge commands
    msg_chal_game_list,
    msg_chal_game_play,
    msg_chal_password_download,
    msg_chal_global_nuclear_wasm,
    msg_chal_global_nuclear_kernel,
    msg_chal_flag_submit,
    msg_chal_list,
    msg_defcon_level,
    msg_chal_passwd_submit,
    msg_chal_passwd_score,

    // admin commands
    msg_admin_help,
    msg_admin_activity,
    msg_admin_presence,
    msg_admin_stats,
    msg_admin_announce,
    msg_admin_group_create,
    msg_admin_group_delete,
    msg_admin_eval,
    msg_admin_exit,
    msg_admin_give_role,
    msg_admin_revoke_role,
    msg_admin_db_maintenance
  ];

  // commands need to be unique, so populate it that way in the command store
  message_command_groups.forEach(c => {
    if (msg_command_store.has(c.name)) throw `duplicate command ${c.name} registered`;
    msg_command_store.set(c.name, c);
  });

  // slash commands (those triggered with a literal / in discord)
  const slash_command_groups: SlashCommand[] = [
    slash_verify_email
  ];

  slash_command_groups.forEach(c => {
    slash_command_store.set(c.definition.name, c);
  });

  // update the available / commands using the REST API
  const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);
  const refresh_commands = async () => {
    try {
      log.info(`refreshing slash commands...`);

      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        {
          body: slash_command_store.map((cmd: SlashCommand) => {
            return cmd.definition.toJSON();
          }),
        },
      );

      log.info(`slash commands refreshed`);
    } catch (error: any) {
      log.error(error);
    }
  };

  refresh_commands();
};
