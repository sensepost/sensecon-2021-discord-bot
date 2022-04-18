import {
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageButton
} from "discord.js";

import {
  PASSWORD_CHALLENGE_LISTS,
  PASS_CHAL_NIST, PASS_CHAL_HTTP,
  PASS_CHAL_JWT, PREFIX_CHAL
} from "../../../../lib/constants";
import { MessageCommand } from "../../../../lib/types";

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}pd`,
  desc: `download password challenge hash files`,
  help: `usage: \`${PREFIX_CHAL}pd\``,
  run: async (interaction: Message): Promise<void> => {

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton().setCustomId(PASS_CHAL_JWT).setLabel(PASS_CHAL_JWT).setStyle(`PRIMARY`),
        new MessageButton().setCustomId(PASS_CHAL_HTTP).setLabel(PASS_CHAL_HTTP).setStyle(`SECONDARY`),
        new MessageButton().setCustomId(PASS_CHAL_NIST).setLabel(PASS_CHAL_NIST).setStyle(`SUCCESS`)
      );

    const msg = await interaction.channel.send({
      content: `Please select the password challenge you want the hashes for.`,
      components: [row]
    });

    try {
      await interaction.channel.createMessageComponentCollector({
        filter: undefined,
        max: 1,
        time: (1000 * 60) * 10  // 10 minutes
      }).on(`collect`, async i => {
        if (i.customId == PASS_CHAL_JWT) {
          if (i !== null && i.token !== null)
            await i.update(`✅ Sending hash list for \`${PASS_CHAL_JWT}\`.`).catch(e => console.log(e));
          await send_hash_file(interaction, PASS_CHAL_JWT);
          await msg.edit({ components: [] });
        }
        if (i.customId == PASS_CHAL_HTTP) {
          if (i !== null && i.token !== null)
            await i.update(`✅ Sending hash list for \`${PASS_CHAL_HTTP}\`.`).catch(e => console.log(e));
          await send_hash_file(interaction, PASS_CHAL_HTTP);
          await msg.edit({ components: [] });
        }
        if (i.customId == PASS_CHAL_NIST) {
          if (i !== null && i.token !== null)
            await i.update(`✅ Sending hash list for \`${PASS_CHAL_NIST}\`.`).catch(e => console.log(e));
          await send_hash_file(interaction, PASS_CHAL_NIST);
          await msg.edit({ components: [] });
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
};

const send_hash_file = async (interaction: Message, chal: string): Promise<void> => {
  const file = new MessageAttachment(`${PASSWORD_CHALLENGE_LISTS}/${chal}-hashes.txt`);
  await interaction.channel.send({ files: [file] });
};
