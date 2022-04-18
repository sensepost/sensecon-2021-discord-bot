import { Client } from "discord.js";

import { events as ready_events } from "../events/ready";
import { events as message_create } from "../events/message_create";
import { events as message_delete } from "../events/message_delete";
import { events as message_update } from "../events/message_update";
import { events as debug_events } from "../events/debug";
import { events as interaction_events } from "../events/interaction_create";
import { events as presence_event } from "../events/presence_change";
import { events as guild_member_update } from "../events/guild_member_update";
import { events as guild_member_add } from "../events/guild_member_add";
import { events as guild_member_remove } from "../events/guild_member_remove";
import { events as user_update } from "../events/user_update";

// registers events we will react to in the bot.
// events a loaded as defined in groups in events/.
// an event group can have many events, so to bind them
// all to the client, we loop the groups and their own
// events[] arrays.
export const register_events = (client: Client): void => {

  const event_groups = [
    ready_events,
    debug_events,
    message_create,
    message_delete,
    message_update,
    interaction_events,
    presence_event,
    guild_member_update,
    guild_member_add,
    guild_member_remove,
    user_update
  ];

  event_groups.forEach(event_category => {
    const { type } = event_category;

    event_category.events.forEach(event => {
      if (event.once) {
        client.once(type, event.run);
        return;
      }

      client.on(type, event.run);
    });
  });

  // the next section can be used to debug event firing.
  // this is especially useful when you want to build
  // something with a new event, but not sure which discord
  // events fire.

  // the code stays commented such that it doesnt flood the
  // bots output when not needed.

  // all_events.forEach(evt => {
  //   client.on(evt, () => {
  //     log.debug(`event triggered: ${evt}`);
  //   });
  // });
};
