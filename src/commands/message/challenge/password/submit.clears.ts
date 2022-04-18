import * as readline from "readline";
import * as stream from "stream";
import * as crypto from "crypto";

import {
  Message,
  MessageActionRow,
  MessageButton
} from "discord.js";

import {
  PASS_CHAL_NIST,
  PASS_CHAL_HTTP,
  PASS_CHAL_JWT,
  PREFIX_CHAL
} from "../../../../lib/constants";
import { get_attachment_from_next_message } from "../../../../lib/helpers/discord";
import { MessageCommand } from "../../../../lib/types";
import * as password_repo from "../../../../lib/storage/password";

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}psc`,
  desc: `submit password clears`,
  help: `usage: \`${PREFIX_CHAL}psc <challenge_name>\``,
  run: async (interaction: Message): Promise<void> => {

    // remove messages for this command if it was not a DM
    if (interaction.channel.type !== `DM`) {
      interaction.delete();
      interaction.channel.send(
        `<@${interaction.author.id}>, submitting password clears should rather be done in a DM with me please!`);
      return;
    }

    const { author } = interaction;

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton().setCustomId(PASS_CHAL_JWT).setLabel(PASS_CHAL_JWT).setStyle(`PRIMARY`),
        new MessageButton().setCustomId(PASS_CHAL_HTTP).setLabel(PASS_CHAL_HTTP).setStyle(`SECONDARY`),
        new MessageButton().setCustomId(PASS_CHAL_NIST).setLabel(PASS_CHAL_NIST).setStyle(`SUCCESS`)
      );

    const msg = await author.send({
      content: `Please select the password challenge you are uploading clears for.`,
      components: [row]
    });

    try {
      await author.dmChannel?.createMessageComponentCollector({
        filter: i => i.user.id == author.id,
        max: 1
      }).on(`collect`, async i => {
        if (i.customId == PASS_CHAL_JWT) {
          if (i !== null && i.token !== null)
            await i.update(`✅ \`${PASS_CHAL_JWT}\` clicked.`).catch(e => console.log(e));
          msg.edit({ components: [] });
          await process_clears(interaction, PASS_CHAL_JWT);
        }
        if (i.customId == PASS_CHAL_HTTP) {
          if (i !== null && i.token !== null)
            await i.update(`✅ \`${PASS_CHAL_HTTP}\` clicked.`).catch(e => console.log(e));
          msg.edit({ components: [] });
          await process_clears(interaction, PASS_CHAL_HTTP);
        }
        if (i.customId == PASS_CHAL_NIST) {
          if (i !== null && i.token !== null)
            await i.update(`✅ \`${PASS_CHAL_NIST}\` clicked.`).catch(e => console.log(e));
          msg.edit({ components: [] });
          await process_clears(interaction, PASS_CHAL_NIST);
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
};

// process_clears reads the lines from an uploaded file and connects the
// clears to the member, indicating a cracked password
const process_clears = async (interaction: Message, chal: string) => {
  const { author } = interaction;

  author.send(`🛹 Please upload your clears for the \`${chal}\` challenge`);
  const file = await get_attachment_from_next_message(interaction, 0.5);
  if (!file) return;

  const rl = readline.createInterface({
    input: stream.Readable.from(file.toString()),
    crlfDelay: Infinity
  });

  let success = 0;
  let failed = 0;

  for await (const l of rl) {
    if (l === ``) continue;

    const cl = crypto.createHash(`sha256`).update(l).digest(`hex`);

    const clear = await password_repo.get_clear_id_for_chal(cl, chal);
    if (!clear) {
      failed++;
      continue;
    }

    if (!await password_repo.user_has_clear_for_challenge(author, clear.id)) {
      success++;
      await password_repo.add_clear_to_member(author, clear.id, chal);
    } else {
      failed++;
    }
  }

  await author.send(`🔥 Submission pocessed. ` +
    `**${success}** ${success > 1 ? `were` : `was`} successful and **${failed}** failed/duplicate.`);
};
