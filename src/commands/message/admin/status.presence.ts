import {
  Message,
  PresenceStatusData
} from "discord.js";

import * as log from "../../../lib/console";

import { MessageCommand } from "../../../lib/types";
import { extract_command_args } from "../../../lib/helpers/commands";
import { PREFIX_ADMIN } from "../../../lib/constants";

const POSSIBLE_PRESENCE: PresenceStatusData[] = ['online', 'idle', 'dnd', 'invisible'];

export const command: MessageCommand = {
  name: `${PREFIX_ADMIN}sp`,
  desc: `set the bot presence`,
  help: `usage: \`${PREFIX_ADMIN}sp ${POSSIBLE_PRESENCE.join('/')}\``,
  run: async (interaction: Message): Promise<void> => {
    const { content, client } = interaction;
    const args = extract_command_args(content, command.name.length);

    if (args.length <= 0) {
      await interaction.reply(command.help);
      return;
    }

    const [presence] = args;

    let new_presence: PresenceStatusData = "online";

    for (let i = 0; i < POSSIBLE_PRESENCE.length; i++) {
      if (POSSIBLE_PRESENCE[i] == presence) {
        new_presence = POSSIBLE_PRESENCE[i];
        break;
      }
    }
    log.info(`setting bot presence as ${new_presence}`);

    await client.user?.setStatus(new_presence);
  }
};
