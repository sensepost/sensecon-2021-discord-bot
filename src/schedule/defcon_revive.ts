import { Client, TextChannel } from "discord.js";

import * as defcon_level_repo from "../lib/storage/defcon_level";
import * as log from "../lib/console";

import { DEAD, DEFCON_LEVEL, GUILD_ID } from "../lib/constants";
import { ScheduledJob } from "../lib/types";
import {
  get_role_from_name,
  revoke_role_from_member
} from "../lib/helpers/discord";

const defcon_revive: ScheduledJob = {
  name: `defcon_revive`,
  schedule: `*/1 * * * *`,  // every 1 minute
  need_client: true,
  run: async (client: Client) => {

    log.info(`scheduled command checking if any members should be revived`);

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    const channel = client.channels.cache.get(DEFCON_LEVEL) as TextChannel;
    const level = await defcon_level_repo.get_defcon_level();

    if (level !== 5) {
      log.info(`scheduled command defcon level is not 5. bailing revive.`);
      return;
    }

    await guild.members.list({ limit: 1000, cache: false }).then(async (members) => {
      const role = await get_role_from_name(client, DEAD);
      if (!role) {
        log.error(`failed to fetch role from string name ${DEAD}`);
        return;
      }

      const dead_users = members.filter(member => member.roles.cache.some(r => r.name == DEAD));
      if (dead_users.size === 0) return;

      const user_mentions: Array<string> = [];

      dead_users.forEach(async (user) => {
        user_mentions.push(`<@${user.id}>`);
        await revoke_role_from_member(user, role);
      });

      await channel.send(`🚨 BEEP BOP! Welcome back ${user_mentions.join(', ')}. Shall we play another game?`);
    });
  }
};

export const jobs = {
  'tasks': [
    defcon_revive
  ]
};
