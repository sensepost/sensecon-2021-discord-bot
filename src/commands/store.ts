import { Collection } from "discord.js";

import {
  MessageCommand,
  SlashCommand
} from "../lib/types";

// global stores for parsed command data
export const slash_command_store: Collection<string, SlashCommand> = new Collection();
export const msg_command_store: Collection<string, MessageCommand> = new Collection();
