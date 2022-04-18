import { User } from "discord.js";

import * as statistic_repo from "../lib/storage/statistic";
import * as member_log_repo from "../lib/storage/member_log";

import { Event } from "../lib/types";

// log incoming interactions to the console
const log_interaction: Event = {
  once: false,
  run: async (old_user: User, new_user: User) => {
    console.log(old_user);
    console.log(new_user);
  }
};

// calculate interaction statistics
const record_statistic: Event = {
  once: false,
  run: async () => {
    statistic_repo.increment_event_statistic(events.type);
  }
};

const update_member_attributes: Event = {
  once: false,
  run: async (_old_user: User, new_user: User) => {
    member_log_repo.update_member_log_from_user(new_user);
  }
};

export const events = {
  'type': 'userUpdate',
  'events': [
    record_statistic,
    // log_interaction,
    update_member_attributes
  ]
};
