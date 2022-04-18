import { EntityType } from "@prisma/client";
import {
  Client,
  TextChannel
} from "discord.js";

import * as log from "../lib/console";
import * as tic_tac_toe_tracker_repo from "../lib/storage/tic_tac_toe_tracker";
import * as defcon_level_repo from "../lib/storage/defcon_level";

import {
  DEFCON_LEVEL,
  GUILD_ID
} from "../lib/constants";
import { ScheduledJob } from "../lib/types";

const update_defcon_level: ScheduledJob = {
  name: `update_defcon_level`,
  schedule: `*/5 * * * *`,
  need_client: true,
  run: async (client: Client) => {
    log.info(`scheduled command checking defcon level`);

    const since = new Date(Date.now() - (60 * 1000) * 60); // last 60 minutes
    const user_wins = await tic_tac_toe_tracker_repo.get_games_won_by_since(EntityType.user, since);
    const bot_wins = await tic_tac_toe_tracker_repo.get_games_won_by_since(EntityType.bot, since);
    const current_level = await defcon_level_repo.get_defcon_level();

    // no change
    if (user_wins === bot_wins) return;

    // decrease the DEFCON level if users are winning!
    if (user_wins > bot_wins) await defcon_level_repo.increment_defcon_level();
    else await defcon_level_repo.decrement_defcon_level();

    const new_level = await defcon_level_repo.get_defcon_level();
    if (new_level === current_level) return; // probably a floor/ceil scenario

    const channel = client.channels.cache.get(DEFCON_LEVEL) as TextChannel;
    await channel.send(`🚨 DEFCON level changed to **${new_level}**! WOPR vs Humans score ${bot_wins}:${user_wins}`);

    // update the guild banner
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;
    await guild.setBanner(`./assets/defcon/sensecon_banner_${new_level}.jpeg`)
      .then(() => log.info(`Updated the guild banner for defcon level ${new_level}`));
  }
};

export const jobs = {
  'tasks': [
    update_defcon_level
  ]
};
