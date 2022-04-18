import { Presence } from "discord.js";

import { prisma } from "./init";

// add_member_status_change_log records a new online/dnd/idle status or custom status
export const add_member_status_change_log = async (presence: Presence): Promise<void> => {
  if (!presence.user) return;  // can't correlate without the user being set
  // write log entry

  const status = presence.status;
  const state = presence.activities.length > 0 ? presence.activities[0].state : ``;

  // can be racy if we dont have a member yet
  if (!await prisma.member.findFirst({ where: { user_id: BigInt(presence.user.id) } })) return;

  await prisma.memberStatusLog.create({
    data: {
      member: {
        connect: {
          user_id: BigInt(presence.user.id)
        }
      },
      status: status,
      state: state
    }
  });

  // update main table value as well
  await prisma.member.update({
    where: {
      user_id: BigInt(presence.user.id),
    },
    data: {
      status: status,
      state: state
    }
  });
};
