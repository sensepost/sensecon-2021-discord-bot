import {
  Collection,
  GuildMember
} from "discord.js";
import NodeCache from "node-cache";

import * as log from "../../lib/console";

import {
  DEAD,
  VERIFIED
} from "../constants";
import { user_has_role_by_name } from "./discord";

const cache = new NodeCache({
  stdTTL: (60 * 60) * 3 // 3 hours
});

export const get_users = (members: Collection<string, GuildMember>): Set<GuildMember> => {
  const online_non_bots = members.filter(member => member.user.bot === false)
    .filter(member => member.presence?.status === 'online');
  const dead_users = online_non_bots.filter(member => member.roles.cache.some(r => r.name == DEAD));
  const available_users = online_non_bots.difference(dead_users);

  let num_of_users = 0;
  const users: Set<GuildMember> = new Set();
  let max_attempts = 100; // try a maximum of 100 times to get the users set filled

  // do nothing when the server is quiet
  if (available_users.size < 20) return users;

  if (available_users.size > 50) {
    num_of_users = 5;
  } else {
    num_of_users = Math.ceil(available_users.size * 0.1);
  }

  while ((users.size != num_of_users) && max_attempts > 0) {
    const c = available_users.random();

    if (!cache.has(c.id) && (user_has_role_by_name(c.client, c.user, VERIFIED))) {
      cache.set(c.id, `blocked`);
      users.add(c);
    } else {
      log.info(`ignoring game user ${c.user.username} as they are either cached or not verified`);
    }

    max_attempts--;
  }

  return users;
};
