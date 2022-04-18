import { Interaction } from "discord.js";

import * as log from "../lib/console";
import * as statistic_repo from "../lib/storage/statistic";

import { slash_command_store } from "../commands/store";
import { Event } from "../lib/types";

// log incoming interactions to the console
const log_interaction: Event = {
  once: false,
  run: async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    console.log(interaction);
  }
};

// calculate interaction statistics
const record_statistic: Event = {
  once: false,
  run: async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    statistic_repo.increment_event_statistic(events.type);
  }
};

// dispatches / commands as loaded in boot.ts to the
// appropriate command
const dispatch: Event = {
  once: false,
  run: async (interaction: Interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (!slash_command_store.has(commandName)) {
      log.error(`we dont have command ${commandName}!`);
      return;
    }

    log.debug(`processing slash command ${commandName}`);
    await slash_command_store.get(commandName)?.run(interaction);
  }
};

export const events = {
  'type': 'interactionCreate',
  'events': [
    record_statistic,
    // log_interaction,
    dispatch
  ]
};
