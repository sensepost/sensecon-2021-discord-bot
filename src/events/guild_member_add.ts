import { GuildMember } from "discord.js";

import * as statistic_repo from "../lib/storage/statistic";
import * as member_repo from "../lib/storage/member";

import { UNVERIFIED } from "../lib/constants";
import {
  get_role_from_name,
  give_member_role
} from "../lib/helpers/discord";
import { Event } from "../lib/types";

// log incoming interactions to the console
const log_interaction: Event = {
  once: false,
  run: async (member: GuildMember) => {
    console.log(member);
  }
};

// calculate interaction statistics
const record_statistic: Event = {
  once: false,
  run: async () => {
    statistic_repo.increment_event_statistic(events.type);
  }
};

const record_new_member: Event = {
  once: false,
  run: async (member: GuildMember) => {
    member_repo.store_new_member(member);
  }
};

const assign_unverified_role: Event = {
  once: false,
  run: async (member: GuildMember) => {
    const { client } = member;
    const role = get_role_from_name(client, UNVERIFIED);
    if (!role) throw `unverified role does not exist in discord?`;

    give_member_role(member, role);
  }
};

export const events = {
  'type': 'guildMemberAdd',
  'events': [
    record_statistic,
    // log_interaction,
    record_new_member,
    assign_unverified_role
  ]
};
