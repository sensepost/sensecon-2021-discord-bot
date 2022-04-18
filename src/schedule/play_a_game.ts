import { codeBlock } from "@discordjs/builders";
import { Client, GuildMember, Message } from "discord.js";

import * as log from "../lib/console";

import {
  draw_board,
  start_game
} from "../commands/message/challenge/game.play";
import { GUILD_ID } from "../lib/constants";
import { get_users } from "../lib/helpers/game";
import { ScheduledJob } from "../lib/types";

const play_a_tictactoe_game: ScheduledJob = {
  name: `play_a_tictactoe_game`,
  schedule: `*/30 * * * *`,  // every 30 minutes
  need_client: true,
  run: async (client: Client) => {

    log.info(`scheduled command dm'ing users to play games`);

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return;

    await guild.members.list({ limit: 1000, cache: false }).then(async (members) => {
      const users = await get_users(members);

      users.forEach(async (user: GuildMember) => {
        log.info(`scheduled command starting tictactoe game with ${user.user.username}`);
        const state = `_________`;

        await user.send(`Shall we play a game?\n${codeBlock(draw_board(state))}\nMake a move by reacting with 1️⃣-9️⃣`)
          .then(async function (message: Message) {
            await start_game(state, message, user.user);
          }).catch(e => console.log(e));
      });
    });
  }
};

export const jobs = {
  'tasks': [
    play_a_tictactoe_game
  ]
};
