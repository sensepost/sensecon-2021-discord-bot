import { Presence } from "discord.js";

import * as log from '../lib/console';
import * as statistic_repo from "../lib/storage/statistic";
import * as member_status_logs_repo from "../lib/storage/member_status_log";
import * as activity_repo from "../lib/storage/activity";

import { Event } from "../lib/types";
import { CHALLENGE_MIMICKER } from "../lib/constants";
import { get_role_from_name } from "../lib/helpers/discord";

const record_statistic: Event = {
  once: false,
  run: async () => {
    statistic_repo.increment_event_statistic(events.type);
  }
};

// log incoming interactions to the console
const log_interaction: Event = {
  once: false,
  run: async (old_pres: Presence, new_pres: Presence) => {
    console.log(old_pres);
    console.log(new_pres);
  }
};

const record_status_change: Event = {
  once: false,
  run: async (_old_pres: Presence, new_pres: Presence) => {
    member_status_logs_repo.add_member_status_change_log(new_pres);
  }
};

const monitor_change: Event = {
  once: false,
  run: async (_old_p: Presence, new_p: Presence) => {
    // TAG:challenge
    // event kicks off when user changes presence on guild
    // if user has their activity and status the same as the bot
    // caching issues were experienced in testing

    const id = new_p.client.user?.id;
    if (!id || !new_p.activities[0]) return;

    const user_activity = new_p.activities[0].state;
    const bot_activity = await activity_repo.get_bot_activity();
    if (!bot_activity?.activity) return;

    if (user_activity !== bot_activity.activity) return;

    const role = get_role_from_name(new_p.client, CHALLENGE_MIMICKER);
    if (!role) return;

    if (new_p.member?.roles.cache.some(r => r.name === role.name)) return;

    log.info(`role ${role.name} has been added to ${new_p.member?.user.username}`);
    await new_p.member?.roles.add(role);
  }
};

export const events = {
  'type': 'presenceUpdate',
  'events': [
    // log_interaction,
    record_statistic,
    record_status_change,
    monitor_change
  ]
};
