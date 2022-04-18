import {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from "@discordjs/builders";
import {
  CommandInteraction,
  Message
} from "discord.js";

export type Event = {
  once: boolean;
  run: (...args: any) => void;
};

export type SlashCommand = {
  definition: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  run: (arg: CommandInteraction) => void;
};

export type MessageCommand = {
  name: string;
  desc: string;
  help: string;
  disabled?: boolean;
  run: (msg: Message) => void;
};

export type ScheduledJob = {
  name: string;
  schedule: string;
  need_client: boolean;
  run: (...args: any) => void;
};

export type Flag = {
  flag: string;
  role_name: string;
};
