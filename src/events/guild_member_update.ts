import { Event } from "../lib/types";

import * as statistic_repo from "../lib/storage/statistic";
import * as member_log_repo from "../lib/storage/member_log";

import {
  GuildMember,
  Role,
  TextChannel
} from "discord.js";
import {
  GUILD_ID,
  ROLE_LOG
} from "../lib/constants";

// log incoming interactions to the console
const log_interaction: Event = {
  once: false,
  run: async (old_member: GuildMember, new_member: GuildMember) => {
    console.log(old_member);
    console.log(new_member);
  }
};

// calculate interaction statistics
const record_statistic: Event = {
  once: false,
  run: async () => {
    statistic_repo.increment_event_statistic(events.type);
  }
};

const record_on_nickname_change: Event = {
  once: false,
  run: async (old_member: GuildMember, new_member: GuildMember) => {
    if (old_member.nickname === new_member.nickname) return;
    member_log_repo.update_member_log_from_member(new_member);
  }
};

// announces role changes in the role-log channel
const announce_on_role_change: Event = {
  once: false,
  run: async (old_member: GuildMember, new_member: GuildMember) => {
    const old_roles = old_member.roles.cache.map(r => r.name);
    const new_roles = new_member.roles.cache.map(r => r.name);

    // skip if theres no role change
    if (old_roles.length === new_roles.length) return;

    const channel = old_member.client.channels.cache.get(ROLE_LOG) as TextChannel;

    // small name => role resolver
    const get_role_id = (name: string): Role | undefined => {
      return old_member.client.guilds.cache.get(GUILD_ID)?.roles.cache.find(r => r.name == name);
    };

    // a role got removed
    if (old_roles.length > new_roles.length) {
      const diff = old_roles.filter(r => !new_roles.includes(r)).join(` `);
      channel.send(`❗️ <@${old_member.id}> no longer has role ${get_role_id(diff)}`);
      return;
    }

    // a role was added
    const diff = new_roles.filter(r => !old_roles.includes(r)).join(` `);
    channel.send(`✅ <@${old_member.id}> now has role ${get_role_id(diff)}`);
  }
};

export const events = {
  'type': 'guildMemberUpdate',
  'events': [
    record_statistic,
    // log_interaction,
    record_on_nickname_change,
    announce_on_role_change
  ]
};
