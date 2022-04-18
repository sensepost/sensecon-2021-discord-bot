import { GuildMember, User } from "discord.js";

import { prisma } from "./init";

// update_member_log get's a user and writes updated attributes to the memberlog
export const update_member_log_from_user = async (user: User): Promise<void> => {
  await prisma.memberLog.create({
    data: {
      member: {
        connect: {
          user_id: BigInt(user.id)
        }
      },
      avatar: user.avatar,
      avatar_url: user.avatarURL(),
      user_name: user.username,
      nickname: ``, // don't have this on a User type
      discriminator: user.discriminator
    }
  });

  // update main table value as well
  await prisma.member.update({
    where: {
      user_id: BigInt(user.id)
    },
    data: {
      user_name: user.username,
      discriminator: user.discriminator
    }
  });
};

// update_member_log get's a user and writes updated attributes to the memberlog
export const update_member_log_from_member = async (member: GuildMember): Promise<void> => {
  await prisma.memberLog.create({
    data: {
      member: {
        connect: {
          user_id: BigInt(member.user.id)
        }
      },
      avatar: member.user.avatar,
      avatar_url: member.user.avatarURL(),
      user_name: member.user.username,
      nickname: member.nickname,
      discriminator: member.user.discriminator
    }
  });

  // update main table value as well
  await prisma.member.update({
    where: {
      user_id: BigInt(member.user.id)
    },
    data: {
      user_name: member.user.username,
      nickname: member.nickname,
      discriminator: member.user.discriminator
    }
  });
};
