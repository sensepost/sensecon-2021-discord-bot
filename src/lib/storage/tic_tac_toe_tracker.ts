import { EntityType } from ".prisma/client";
import { User } from "discord.js";

import { prisma } from "./init";

// increment_event_statistic increment's an event count statistic
export const add_tictactoe_result = async (member: User, winner: EntityType): Promise<void> => {
  await prisma.ticTacToeTracker.create({
    data: {
      member: {
        connect: {
          user_id: BigInt(member.id)
        }
      },
      winner: winner
    }
  });
};

// get_games_won_by_since returns the number of tictactoe games won by entity (user/bot)
// since a time (aka, the last hour as an example)
export const get_games_won_by_since = async (e_type: EntityType, since: Date): Promise<number> => {
  return await prisma.ticTacToeTracker.count({
    where: {
      winner: e_type,
      created_at: {
        gte: since
      }
    }
  });
};
