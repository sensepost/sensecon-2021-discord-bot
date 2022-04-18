import { MemberClear, PasswordClear } from ".prisma/client";
import { User } from "discord.js";

import { prisma } from "./init";

// get_clear_id_for_chal returns the db id a clear is recorded for per challenge
export const get_clear_id_for_chal = async (clear: string, chal: string): Promise<PasswordClear | null> => {
  return await prisma.passwordClear.findFirst({
    where: {
      challenge_name: chal,
      password: clear
    }
  });
};

// user_has_clear_for_challenge checks if a clear_id has already been connected to a user
export const user_has_clear_for_challenge = async (user: User, clear_id: number): Promise<boolean> => {
  const ex = await prisma.memberClear.findFirst({
    where: {
      member_id: BigInt(user.id),
      password_id: clear_id,
    }
  });

  if (!ex) return false;

  return true;
};

// add_clear_to_member connects a clear password to a member
export const add_clear_to_member = async (user: User, clear_id: number, chal: string): Promise<void> => {
  await prisma.memberClear.create({
    data: {
      member: {
        connect: {
          user_id: BigInt(user.id)
        }
      },
      password: {
        connect: {
          id: clear_id
        }
      },
      challenge: {
        connect: {
          name: chal
        }
      },
    }
  });
};

// get_players returns the players that have submitted passwords
export const get_players = async (): Promise<MemberClear[]> => {
  return await prisma.memberClear.findMany({
    where: {},
    distinct: [`member_id`]
  });
};

// get_challenge_solve_count returns the members and a count of how many solved a challenge
export const get_challenge_solve_count = async (chal: string): Promise<(string | number)[][]> => {
  const y = await prisma.memberClear.findMany({
    where: {
      challenge_name: chal
    }
  });

  return Array.from(new Set(y.map(e => e.member_id)))
    .map(m => {
      const c = y.filter(h => h.member_id == m).map(h => h.password_id);
      return [m.toString(), new Set(c).size];
    }).sort((a, b) => {
      const va = a[1];
      const vb = b[1];

      if (va > vb) return -1;
      else if (vb > va) return 1;

      return 0;
    });
};
