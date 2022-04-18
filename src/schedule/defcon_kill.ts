import { Client, TextChannel } from "discord.js";

import * as defcon_level_repo from "../lib/storage/defcon_level";
import * as log from "../lib/console";

import { DEAD, DEFCON_LEVEL, GUILD_ID } from "../lib/constants";
import { get_users } from "../lib/helpers/game";
import { ScheduledJob } from "../lib/types";
import {
  get_role_from_name,
  give_member_role
} from "../lib/helpers/discord";

const kill_users: ScheduledJob = {
  name: `kill_users`,
  schedule: `*/15 * * * *`,  // every 15 minutes
  need_client: true,
  run: async (client: Client) => {

    log.info(`scheduled command checking if any members should be killed`);

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    const channel = client.channels.cache.get(DEFCON_LEVEL) as TextChannel;
    const level = await defcon_level_repo.get_defcon_level();

    if (level !== 1) {
      log.info(`scheduled command defcon level is not 1. bailing kill.`);
      return;
    }

    await guild.members.list({ limit: 1000, cache: false }).then(async (members) => {
      const role = await get_role_from_name(client, DEAD);
      if (!role) {
        log.error(`failed to fetch role from string name ${DEAD}`);
        return;
      }

      const users = get_users(members);
      if (users.size === 0) return;

      const user_mentions: Array<string> = [];

      users.forEach(async (user) => {
        user_mentions.push(`<@${user.id}>`);
        await give_member_role(user, role);
      });

      await channel.send(`🚨 BEEP BOP! Nuke launched. Succesfully killed ${user_mentions.join(', ')}!`);
    });
  }
};

export const jobs = {
  'tasks': [
    kill_users
  ]
};
