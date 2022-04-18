import * as fs from "fs";

import {
  Message,
  MessageAttachment
} from "discord.js";

import * as steggy from 'steggy';
import gm from "gm";
import { Readable } from "stream";
import got from "got/dist/source";

import * as log from "../../lib/console";

import {
  CHALLENGE_SEEKER_OF_TRUTHS,
  PREFIX_USER
} from "../../lib/constants";
import { get_user_from_mention } from "../../lib/helpers/discord";
import { MessageCommand } from "../../lib/types";
import { extract_command_args } from "../../lib/helpers/commands";
import { flags } from "../../lib/flags";

export const command: MessageCommand = {
  name: `${PREFIX_USER}avatar`,
  desc: `display the avatar of a user`,
  help: `usage: \`${PREFIX_USER}avatar\` / \`.avatar @mention\``,
  run: async (interaction: Message): Promise<void> => {

    const { content, client, author } = interaction;
    const args = extract_command_args(content, command.name.length);

    // show your own avatar
    if (args.length <= 0) {
      await interaction.reply(`${author.username}'s avatar: ${author.displayAvatarURL({ dynamic: true })}`);
      return;
    }

    const [mention] = args;

    // show a user mentioned avatar
    const user = get_user_from_mention(client, mention);
    if (!user) {
      await interaction.reply(`invalid mention`);
      return;
    }

    const avatar_url = user.avatarURL({ dynamic: true });
    if (!avatar_url) return;

    const stream = Readable.from((await got.get(avatar_url)).rawBody);
    const im = gm.subClass({ imageMagick: true });

    const path = `/tmp/`;
    const filename = `${Date.now()}.png`;
    const filename_modified = `modded-${Date.now()}.png`;

    await im(stream).write(`${path}${filename}`, async (err) => {
      if (!err) {
        const image = await fs.readFileSync(`${path}${filename}`);

        let flag_text;

        flags.forEach(flag => {
          if (flag.role_name === CHALLENGE_SEEKER_OF_TRUTHS) flag_text = flag.flag;
        });

        const concealed_image = steggy.conceal(/* optional password */)(image, flag_text/*, encoding */);
        await fs.writeFileSync(`${path}${filename_modified}`, concealed_image);
        const file = new MessageAttachment(`${path}${filename_modified}`);
        await interaction.reply({ files: [file] });

        clean_up(`${path}${filename}`);
        clean_up(`${path}${filename_modified}`);
      }
      else {
        log.error(err);
        await interaction.reply(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`);
      }
    });
  }
};

export const clean_up = (filename: string): void => {
  fs.stat(filename, function (err) {
    if (err) {
      return console.error(err);
    }

    fs.unlink(filename, function (err) {
      if (err) return console.log(err);
    });
  });
};
