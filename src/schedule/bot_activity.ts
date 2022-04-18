import { Client } from "discord.js";

import * as log from "../lib/console";
import * as activity_repo from "../lib/storage/activity";

import { ScheduledJob } from "../lib/types";

type Activity = {
  activity: string;
  type: "WATCHING" | "LISTENING" | "PLAYING";
};
const activities: Activity[] = [
  { activity: `music`, type: `LISTENING` }, // "listening to" is prefixed for this type
  { activity: `launchcode guessing`, type: `PLAYING` },
  { activity: `you hack`, type: `WATCHING` },
  { activity: `challenges`, type: `PLAYING` },
  { activity: `galaga`, type: `PLAYING` },
  { activity: `a dialtone`, type: `LISTENING` },
  { activity: `tictactoe`, type: `PLAYING` }
];

const cycle_bot_activity: ScheduledJob = {
  name: `cycle_bot_status`,
  schedule: `*/5 * * * *`,  // every 5 minutes
  need_client: true,
  run: async (client: Client) => {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    log.info(`scheduled command setting bot activity to ${activity.activity}, type: ${activity.type}`);

    activity_repo.set_bot_activity(activity.activity, activity.type);
    client.user?.setActivity(activity.activity, { type: activity.type });
  }
};

export const jobs = {
  'tasks': [
    cycle_bot_activity
  ]
};
