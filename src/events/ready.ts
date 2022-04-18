import {
  Client,
  TextChannel
} from "discord.js";

import * as log from "../lib/console";
import * as statistic_repo from "../lib/storage/statistic";

import { Event } from "../lib/types";
import { BOT_ADMIN } from "../lib/constants";

const record_statistic: Event = {
  once: false,
  run: async () => {
    await statistic_repo.increment_event_statistic(events.type);
  }
};

const announce: Event = {
  once: true,
  run: async (client: Client) => {
    log.info(`discord client logged in and ready!`);

    const c = await statistic_repo.get_event_statistic(events.type);

    const channel = client.channels.cache.get(BOT_ADMIN) as TextChannel;
    channel.send(`hello! 👋 i am ready. this was boot number: \`${c}\``);
  }
};

export const events = {
  'type': 'ready',
  'events': [
    record_statistic,
    announce
  ]
};
