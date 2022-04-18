import { Message } from "discord.js";

import * as log from '../lib/console';
import * as statistic_repo from "../lib/storage/statistic";
import * as message_log_repo from "../lib/storage/message_log";

import { Event } from "../lib/types";

// log incoming messages to the console
const log_message_to_console: Event = {
  once: false,
  run: async (interaction: Message) => {
    if (interaction.author.bot) return;
    console.log(interaction);
  }
};

const record_statistic: Event = {
  once: false,
  run: async (interaction: Message) => {
    if (interaction.author.bot) return;

    statistic_repo.increment_event_statistic(events.type);
  }
};

// update message as deleted
const update_message_edited: Event = {
  once: false,
  run: async (interaction: Message) => {

    const m = await message_log_repo.get_message_from_interaction(interaction);
    if (!m) return;

    message_log_repo.mark_message_as_edited(interaction);
    log.debug(`message ${interaction.id} marked as edited`);
  }
};

export const events = {
  'type': 'messageUpdate',
  'events': [
    // log_message_to_console,
    record_statistic,
    update_message_edited
  ]
};
