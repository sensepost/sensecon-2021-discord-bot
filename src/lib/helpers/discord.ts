import {
  Client,
  User,
  TextChannel,
  Role,
  Message,
  GuildChannel,
  GuildMember
} from "discord.js";
import got from "got/dist/source";

import { GUILD_ID } from "../constants";

export const get_user_from_mention = (client: Client, mention: string): User | undefined => {
  if (!mention) return;
  if (!(mention.startsWith('<@')) && mention.endsWith('>')) return;

  mention = mention.slice(2, -1);

  if (mention.startsWith('!') || mention.startsWith('.')) {
    mention = mention.slice(1);
  }

  return client.users.cache.get(mention);
};

export const get_member_from_id = (client: Client, member: string): GuildMember | undefined => {
  return client.guilds.cache.get(GUILD_ID)?.members.cache.find(m => m.id == member);
};

export const guild_member_from_user = (client: Client, user: User): GuildMember | undefined => {
  return client.guilds.cache.get(GUILD_ID)?.members.cache.find(m => m.id == user.id);
};

//code very similar to user mention, just changed to <#, maybe one function to rule them all?
export const get_text_channel_from_mention = (client: Client, mention: string): TextChannel | undefined => {
  if (!mention) return;
  if (!(mention.startsWith('<#')) && mention.endsWith('>')) return;

  mention = mention.slice(2, -1);

  if (mention.startsWith('!') || mention.startsWith('.')) {
    mention = mention.slice(1);
  }

  return client.channels.cache.get(mention) as TextChannel;
};

export const get_role_from_mention = (client: Client, mention: string): Role | undefined => {
  if (!mention) return;
  if (!(mention.startsWith('<@&')) && mention.endsWith('>')) return;

  mention = mention.slice(3, -1);

  if (mention.startsWith('!') || mention.startsWith('.')) {
    mention = mention.slice(1);
  }

  return client.guilds.cache.get(GUILD_ID)?.roles.cache.get(mention);
};

export const get_role_from_name = (client: Client, role: string): Role | undefined => {
  return client.guilds.cache.get(GUILD_ID)?.roles.cache.find(r => r.name === role);
};

export const give_member_role = (member: GuildMember, role: Role): void => {
  member.roles.add(role);
};

export const revoke_role_from_member = (member: GuildMember, role: Role): void => {
  member.roles.remove(role);
};

export const create_voice_and_text_channels = (channel: GuildChannel): void => {
  channel.guild?.channels.create(`text`, { type: `GUILD_TEXT` })
    .then(async function (channel_text: GuildChannel) {
      channel_text.setParent(channel.id);
    });
  channel.guild?.channels.create(`voice`, { type: `GUILD_VOICE` })
    .then(async function (channel_voice: GuildChannel) {
      channel_voice.setParent(channel.id);
    });
};

// user_has_role_by_name checks if a user has a role
export const user_has_role_by_name = (client: Client, user: User, role: string): boolean => {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return false;

  const member = guild.members.cache.find(m => m.id === user.id);
  if (!member) return false;

  return member.roles.cache.some(r => r.name === role);
};

export const get_attachment_from_next_message = async (
  interaction: Message, max_size = 0, from_dm = false): Promise<void | Buffer> => {

  const channel = from_dm ? interaction.author.dmChannel : interaction.channel;
  if (!channel) return;

  return await channel.awaitMessages({
    filter: m => m.author == interaction.author,
    max: 1
  }).then(async msg => {
    const f = msg.first()?.attachments.first();
    if (!f) throw `no attachment on  message`;

    // 0 indicates we dont want to check file size
    if (max_size !== 0) {
      const s = (f.size / (1024 * 1024));
      if (s > max_size) throw `file size too large. i wont process anything over ${max_size}mb`;
    }

    return f.url;
  }).then(async f => {
    if (!f) throw `failed to get cdn url`;

    return (await got.get(f)).rawBody;
  }).catch(async e => {
    await interaction.reply(`failed to process file: "${e}"`);
  });
};
