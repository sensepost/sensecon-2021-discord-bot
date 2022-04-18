import {
  Client,
  Intents
} from "discord.js";

import * as log from './lib/console';

import {
  DEBUG,
  DISCORD_TOKEN
} from "./lib/constants";
import { register_events } from "./boot/events";
import { register_commands } from "./boot/commands";
import { register_schedule } from "./boot/schedule";

if (DISCORD_TOKEN === ``) {
  log.error(`no discord token found in env/.env. you have to set \`TOKEN\`! bye!`);
  process.exit();
}

if (DEBUG == `1`) {
  log.info(`debug mode enabled`);
}

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING
  ],
  partials: ["CHANNEL"] // https://discordjs.guide/additional-info/changes-in-v13.html#dm-channels
});

// boot events, schedule and commands
register_events(client);
register_schedule(client);
register_commands();

client.login(DISCORD_TOKEN);
