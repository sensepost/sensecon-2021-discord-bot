import { Message } from "discord.js";

import { MessageCommand } from "../../../lib/types";
import { PREFIX_ADMIN } from "../../../lib/constants";
import { prisma } from "../../../lib/storage/init";
import * as member_repo from "../../../lib/storage/member";

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}dm`,
  desc: `perform database maintenance`,
  help: `usage: \`${PREFIX_ADMIN}dm\``,
  run: async (interaction: Message): Promise<void> => {

    // TODO: ensure this is only run in BOT_ADMIN channel
    const msg = await interaction.channel.send(`Performing database maintenace tasks!`);

    // ensure that members that are in discord are also recorded in the db
    await msg.edit(`✅ Membership record check.`);
    interaction.guild?.members.cache.forEach(async member => {
      const db_member = await prisma.member.findFirst({
        where: {
          user_id: BigInt(member.id)
        }
      });

      if (db_member) return;  // member already exists

      member_repo.store_new_member(member);
    });

    await msg.edit(`✅ Done database maintenance`);
  }
};
