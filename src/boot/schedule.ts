import { Client } from "discord.js";
import { scheduleJob } from "node-schedule";

import * as log from "../lib/console";

import { jobs as cycle_bot_status } from "../schedule/bot_activity";
import { jobs as update_defcon_level } from "../schedule/defcon_level";
import { jobs as play_a_game } from "../schedule/play_a_game";
import { jobs as defcon_revive } from "../schedule/defcon_revive";
import { jobs as defcon_kill } from "../schedule/defcon_kill";

// register_schedule schedules task groups using node-schedule
export const register_schedule = (client: Client): void => {

  const schedule = [
    cycle_bot_status,
    update_defcon_level,
    // play_a_game,
    // defcon_revive,
    // defcon_kill
  ];

  schedule.forEach(job => {
    job.tasks.forEach(task => {
      log.debug(`scheduling task: ${task.name}`);
      if (task.need_client) scheduleJob(task.schedule, task.run.bind(null, client));
      else scheduleJob(task.schedule, task.run);
    });
  });
};
