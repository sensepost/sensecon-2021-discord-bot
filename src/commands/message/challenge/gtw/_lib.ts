import { User } from "discord.js";

import { Firecracker } from "../../../../lib/firecracker";

type Player = {
  id: string;
  instance: Firecracker;
};
// players keeps record of player firecracker instances, locking
// them to only running one at a time
export const players: Player[] = [];

// existing_run checks if the player has an existing firecracker running,
// giving them the opportunity to kill it.
export const existing_run = async (author: User): Promise<boolean> => {
  const player = players.find(p => p.id == author.id);
  if (!player) return false;

  const qmsg = await author.send(`⚠️ You have an existing launch procedure in progress. ` +
    `Would you like to terminate? \`y\`/\`n\`?`);

  await qmsg.channel.awaitMessages({
    filter: m => m.author == author,
    max: 1
  }).then(async msg => {
    if (msg.first()?.content.trim() == `y`) {
      player.instance.cleanup(`user`);  // kill the firecracker vm
    }
  });
  return true;
};
