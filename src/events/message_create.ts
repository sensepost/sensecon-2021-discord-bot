import {
  Message,
  ThreadChannel
} from "discord.js";

import * as log from '../lib/console';
import * as statistic_repo from "../lib/storage/statistic";
import * as message_log_repo from "../lib/storage/message_log";
import * as command_log_repo from "../lib/storage/command_log";

import { Event } from "../lib/types";
import { msg_command_store } from "../commands/store";
import {
  ADMIN_ROLE,
  PREFIX_ADMIN,
  PREFIX_CHAL,
  PREFIX_USER,
  SUFFIX_HELP,
  CHALLENGE_LAUNCH_NUKE,
  DEAD
} from "../lib/constants";
import {
  have_command,
  is_disabled_command,
  print_help
} from "../lib/helpers/commands";
import {
  get_member_from_id,
  get_role_from_name,
  give_member_role,
  user_has_role_by_name
} from "../lib/helpers/discord";
import { roleMention } from "@discordjs/builders";

// log incoming messages to the console
const log_message_to_console: Event = {
  once: false,
  run: async (interaction: Message) => {
    if (interaction.author.bot) return;
    console.log(interaction);
  }
};

// calculate message statistics
const record_statistic: Event = {
  once: false,
  run: async (interaction: Message) => {
    if (interaction.author.bot) return;

    statistic_repo.increment_event_statistic(events.type);
  }
};

// persist messages
const record_message: Event = {
  once: false,
  run: async (interaction: Message) => {
    if (interaction.author.bot) return;

    await message_log_repo.store_new_message(interaction);
    log.debug(`stored message ${interaction.id}`);
  }
};

// dispatches user commands that start with a .
const dispatch_user: Event = {
  once: false,
  run: async (interaction: Message) => {
    if (interaction.author.bot) return;
    if (!interaction.content.startsWith(PREFIX_USER)) return;

    await command_log_repo.store_new_command(interaction, PREFIX_USER);

    const [command,] = interaction.content.split(' ');

    if (!have_command(interaction, command)) {
      await command_log_repo.fail_stored_command_with_reason(interaction, `command does not exist`);
      return;
    }

    if (command.endsWith(SUFFIX_HELP)) {
      print_help(interaction, command);
      return;
    }

    if (is_disabled_command(interaction, command)) {
      await command_log_repo.fail_stored_command_with_reason(interaction, `command is disabled`);
      return;
    }

    log.debug(`processing msg command ${command}`);
    await msg_command_store.get(command)?.run(interaction);
  }
};

// dispatches challenge commands that start with a &
const dispatch_challenge: Event = {
  once: false,
  run: async (interaction: Message) => {
    if (interaction.author.bot) return;
    if (!interaction.content.startsWith(PREFIX_CHAL)) return;

    const { client, author, content } = interaction;

    const [command,] = content.split(' ');

    await command_log_repo.store_new_command(interaction, PREFIX_CHAL);

    if (!have_command(interaction, command)) {
      await command_log_repo.fail_stored_command_with_reason(interaction, `command does not exist`);
      return;
    }

    if (command.endsWith(SUFFIX_HELP)) {
      print_help(interaction, command);
      return;
    }

    if (is_disabled_command(interaction, command)) {
      await command_log_repo.fail_stored_command_with_reason(interaction, `command is disabled`);
      return;
    }

    if (user_has_role_by_name(client, author, DEAD)) {
      const role = get_role_from_name(interaction.client, DEAD);
      if (!role) return;

      interaction.reply(`BEEP BOP! Sorry you are dead. Beat me for a DEFCON 5 revive!`);
      return;
    }

    log.debug(`processing msg command ${command}`);
    await msg_command_store.get(command)?.run(interaction);
  }
};

// dispatches admin commands that start with a ~ 
const dispatch_admin: Event = {
  once: false,
  run: async (interaction: Message) => {
    if (interaction.author.bot) return;

    const { content, author, client } = interaction;
    if (!content.startsWith(PREFIX_ADMIN)) return;

    await command_log_repo.store_new_command(interaction, PREFIX_ADMIN);

    if (!user_has_role_by_name(client, author, ADMIN_ROLE)) {
      await command_log_repo.fail_stored_command_with_reason(interaction, `user does not have admin role`);
      interaction.reply(`🤣... no.`);
      return;
    }

    const [command,] = interaction.content.split(' ');

    if (!have_command(interaction, command)) {
      await command_log_repo.fail_stored_command_with_reason(interaction, `command does not exist`);
      return;
    }

    if (command.endsWith(SUFFIX_HELP)) {
      print_help(interaction, command);
      return;
    }

    if (is_disabled_command(interaction, command)) {
      await command_log_repo.fail_stored_command_with_reason(interaction, `command is disabled`);
      return;
    }

    log.debug(`processing msg command ${command}`);
    await msg_command_store.get(command)?.run(interaction);
  }
};

// launch nuke flag logic
const launch_nuke_challenge: Event = {
  once: false,
  run: async (interaction: Message) => {
    if (interaction.author.bot) return;
    if (!(interaction.channel instanceof ThreadChannel)) return;

    const role = await get_role_from_name(interaction.client, CHALLENGE_LAUNCH_NUKE);

    if (!role) {
      log.error(`failed to fetch role from string name ${CHALLENGE_LAUNCH_NUKE}`);
      return;
    }

    const thread_channel = interaction.channel as ThreadChannel;
    const authors: Set<string> = new Set();
    let success = false;

    await thread_channel.messages.fetch({ limit: 100 }).then(async messages => {
      let succession = true;
      let counter = 0;

      const launch_codes = [`C`, `P`, `E`, `1`, `7`, `0`, `4`, `T`, `K`, `S`].reverse();

      messages.forEach(message => {
        if (message.content !== launch_codes[counter]) {
          succession = false;
        }
        authors.add(message.author.id);
        counter++;
      });

      if (!succession) return;
      if (counter < launch_codes.length || counter !== launch_codes.length) return;
      if (authors.size !== launch_codes.length) return;

      success = true;
    });

    if (!success) return;

    await authors.forEach(async (author) => {
      const member = await get_member_from_id(interaction.client, author);

      if (!member) {
        log.error(`failed to fetch member from db for user id ${author}`);
        return;
      }

      await give_member_role(member, role);
    });

    await thread_channel.delete(`a nuke has been launched!`);
  }
};

export const events = {
  'type': 'messageCreate',
  'events': [
    record_statistic,
    record_message,
    // log_message_to_console,
    dispatch_user,
    dispatch_challenge,
    dispatch_admin,
    launch_nuke_challenge
  ]
};
