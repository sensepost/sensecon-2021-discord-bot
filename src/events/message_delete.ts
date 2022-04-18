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
const update_message_deleted: Event = {
  once: false,
  run: async (interaction: Message) => {
    message_log_repo.mark_message_as_deleted(interaction);
    log.debug(`marking message ${interaction.id} as deleted`);
  }
};

export const events = {
  'type': 'messageDelete',
  'events': [
    // log_message_to_console,
    record_statistic,
    update_message_deleted
  ]
};
