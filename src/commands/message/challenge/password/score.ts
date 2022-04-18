import {
  Message,
  MessageEmbed
} from "discord.js";

import * as password_repo from "../../../../lib/storage/password";

import {
  PASS_CHAL_NIST,
  PASS_CHAL_HTTP,
  PASS_CHAL_JWT,
  PREFIX_CHAL
} from "../../../../lib/constants";
import { MessageCommand } from "../../../../lib/types";

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}ps`,
  desc: `get password challenge scoreboard`,
  help: `usage: \`${PREFIX_CHAL}ps\``,
  run: async (interaction: Message): Promise<void> => {

    const nist = await password_repo.get_challenge_solve_count(PASS_CHAL_NIST);
    const nist_embed = new MessageEmbed()
      .setColor("NOT_QUITE_BLACK")
      .setTitle('NIST Password Challenge Scoreboard')
      .setTimestamp();
    nist.slice(0, 20).forEach((c, i) => {
      const [member, count] = c;
      nist_embed.addField(`Position: ${i + 1}`, `<@${member}> has ${count} solves`, true);
    });

    const jwt = await password_repo.get_challenge_solve_count(PASS_CHAL_JWT);
    const jwt_embed = new MessageEmbed()
      .setColor(`BLURPLE`)
      .setTitle('JWT Password Challenge Scoreboard')
      .setTimestamp();
    jwt.slice(0, 20).forEach((c, i) => {
      const [member, count] = c;
      jwt_embed.addField(`Position: ${i + 1}`, `<@${member}> has ${count} solves`, true);
    });

    const http = await password_repo.get_challenge_solve_count(PASS_CHAL_HTTP);
    const http_embed = new MessageEmbed()
      .setColor(`DARK_GREEN`)
      .setTitle('HTTP Password Challenge Scoreboard')
      .setTimestamp();
    http.slice(0, 20).forEach((c, i) => {
      const [member, count] = c;
      http_embed.addField(`Position: ${i + 1}`, `<@${member}> has ${count} solves`, true);
    });

    interaction.reply({ embeds: [nist_embed, jwt_embed, http_embed] });
  }
};
