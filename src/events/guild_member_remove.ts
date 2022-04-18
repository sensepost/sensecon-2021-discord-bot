import { GuildMember } from "discord.js";

import * as statistic_repo from "../lib/storage/statistic";
import * as member_repo from "../lib/storage/member";
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

const record_member_removed: Event = {
  once: false,
  run: async (member: GuildMember) => {
    member_repo.mark_member_as_left(member);
  }
};

export const events = {
  'type': 'guildMemberRemove',
  'events': [
    record_statistic,
    // log_interaction,
    record_member_removed
  ]
};
