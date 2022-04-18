import { Message } from "discord.js";

import * as defcon_level_repo from "../../../lib/storage/defcon_level";
import * as tic_tac_toe_tracker_repo from "../../../lib/storage/tic_tac_toe_tracker";

import { MessageCommand } from "../../../lib/types";
import { PREFIX_CHAL } from "../../../lib/constants";
import { EntityType } from ".prisma/client";

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}dl`,
  desc: `get the current defcon level`,
  help: `usage: \`${PREFIX_CHAL}dl\``,
  run: async (interaction: Message): Promise<void> => {

    const level = await defcon_level_repo.get_defcon_level();
    const since = new Date(Date.now() - (60 * 1000) * 60); // last 60 minutes
    const user_wins = await tic_tac_toe_tracker_repo.get_games_won_by_since(EntityType.user, since);
    const bot_wins = await tic_tac_toe_tracker_repo.get_games_won_by_since(EntityType.bot, since);

    if (!level) interaction.reply(`We're not sure what the DEFCON level is yet.`);
    else interaction.reply(`We're at DEFCON level **${level}**. WOPR vs Humans score ${bot_wins}:${user_wins}`);
  }
};
