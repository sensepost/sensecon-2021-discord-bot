import { GuildMember } from "discord.js";

import { prisma } from "./init";

// store_new_member stores a new guild member. if the member already
// exists it means they may have left previously. in that case, simply
// update the member information
export const store_new_member = async (member: GuildMember): Promise<void> => {
  await prisma.member.upsert({
    create: {
      user_id: BigInt(member.id),
      user_name: member.user.username,
      nickname: member.nickname,
      discriminator: member.user.discriminator,
      status: member.presence?.status,
      member_log: {
        create: {
          avatar: member.user.avatar,
          avatar_url: member.user.avatarURL(),
          user_name: member.user.username,
          nickname: member.nickname,
          discriminator: member.user.discriminator
        }
      }
    },
    update: {
      has_left: false,
      user_name: member.user.username,
      nickname: member.nickname,
      discriminator: member.user.discriminator,
      status: member.presence?.status,
      member_log: {
        create: {
          avatar: member.user.avatar,
          avatar_url: member.user.avatarURL(),
          user_name: member.user.username,
          nickname: member.nickname,
          discriminator: member.user.discriminator
        }
      }
    },
    where: {
      user_id: BigInt(member.id)
    }
  });
};

// mark_member_as_left marks a member has having left the guild
export const mark_member_as_left = async (member: GuildMember): Promise<void> => {
  await prisma.member.update({
    where: {
      user_id: BigInt(member.id),
    },
    data: {
      has_left: true
    }
  });
};

// set_member_email_and_otp sets the email and otp field for a member
export const set_member_email_and_otp = async (member: GuildMember, email: string, otp: number): Promise<void> => {
  await prisma.member.update({
    where: {
      user_id: BigInt(member.user.id)
    },
    data: {
      email: email,
      otp: otp
    }
  });
};

// get the otp value for a member
export const get_member_otp = async (member: GuildMember): Promise<number | void> => {
  const m = await prisma.member.findFirst({
    where: {
      user_id: BigInt(member.user.id)
    }
  });
  if (!m || !m.otp) return;

  return m.otp;
};

// mark_member_as_verified sets the is_verified bit to true
export const mark_member_as_verified = async (member: GuildMember): Promise<void> => {
  await prisma.member.update({
    where: {
      user_id: BigInt(member.user.id)
    },
    data: {
      is_verified: true
    }
  });
};

// is_member_verified checks if a member is marked as verified
export const is_member_verified = async (member: GuildMember): Promise<boolean> => {
  const m = await prisma.member.findFirst({
    where: {
      user_id: BigInt(member.user.id)
    }
  });

  if (!m || !m.is_verified) return false;

  return m.is_verified;
};
