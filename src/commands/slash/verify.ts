import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  GuildMember
} from "discord.js";
import { SES } from "aws-sdk";

import * as log from "../../lib/console";
import * as member_repo from "../../lib/storage/member";

import {
  get_member_from_id,
  get_role_from_name,
  give_member_role,
  revoke_role_from_member
} from "../../lib/helpers/discord";
import { SlashCommand } from "../../lib/types";
import { UNVERIFIED, VERIFIED } from "../../lib/constants";

const EMAIL = `email`;
const OTP = `otp`;
const COUNTRY = `country`;

const ses = new SES({ region: `eu-west-1` });

type CountryRole = {
  role: string;
  flag: string;
};

const country_roles: CountryRole[] = [
  { flag: `🇩🇪`, role: `country:germany` },
  { flag: `🇲🇦`, role: `country:morocco` },
  { flag: `🇸🇪`, role: `country:sweden` },
  { flag: `🇳🇱`, role: `country:netherlands` },
  { flag: `🇬🇧`, role: `country:united-kingdom` },
  { flag: `🇧🇪`, role: `country:belgium` },
  { flag: `🇩🇰`, role: `country:denmark` },
  { flag: `🇳🇴`, role: `country:norway` },
  { flag: `🇿🇦`, role: `country:south-africa` },
  { flag: `🇫🇷`, role: `country:france` },
];

export const command: SlashCommand = {
  definition: new SlashCommandBuilder()
    .setName(`verify`)
    .setDescription(`Verify that you own an @orangecyberdefense.com email address`)
    .addSubcommand(sub_command => sub_command
      .setDescription(`Start the email verification process`)
      .setName(EMAIL)
      .addStringOption(option => option
        .setName(`address`)
        .setDescription(`Your @orangecyberdefense email address`)
        .setRequired(true)))
    .addSubcommand(sub_command => sub_command
      .setDescription(`Verify a received OTP sent to your @orangecyberdefenese address`)
      .setName(OTP).
      addIntegerOption(option => option
        .setName('otp')
        .setRequired(true)
        .setDescription(`The OTP value you received via email`)))
    .addSubcommand(sub_command => sub_command
      .setDescription(`Set your country`)
      .setName(COUNTRY)),

  run: async (interaction: CommandInteraction): Promise<void> => {
    // i dont know. slash commands are a bit of a mess for me, especially
    // when it involes sub commands. now this run() has three separate
    // major code block to handle them. *shrug*
    //
    // anyways. 

    const { member, options, client } = interaction;

    // /verify email
    if (options.getSubcommand() === EMAIL) {
      if (await member_repo.is_member_verified(member as GuildMember)) {
        interaction.reply({ content: `You are already verified.`, ephemeral: true });
        return;
      }

      const email_address = options.getString('address');
      if (!email_address?.endsWith(`@orangecyberdefense.com`)) {
        await interaction.reply({
          content: `Invalid email address. You need to use your \`@orangecyberdefense.com\` address.`,
          ephemeral: true
        });
        return;
      }

      // lol, science to get a 4 digit number: https://stackoverflow.com/a/29640472
      const otp = Math.floor(1000 + Math.random() * 9000);
      member_repo.set_member_email_and_otp(member as GuildMember, email_address, otp);

      // handle sendind the otp via email
      ses.sendEmail({
        Source: `SenseCon Discord Bot <sensecon@sensepost.pl>`,
        Destination: {
          ToAddresses: [
            email_address || ``
          ]
        },
        Message: {
          Subject: {
            Data: `Discord OTP Verification`,
            Charset: `UTF-8`
          },
          Body: {
            Text: {
              Data: `Please use the OTP ${otp} to complete verification. This can be done by issuing the /verify OTP command.`,
              Charset: `UTF-8`
            }
          }
        }
      }).promise()
        .then(_d => {
          log.info(`sent email to ${email_address}`);
          interaction.reply({
            content: `An OTP has been sent to \`${email_address}\`. Use \`/verify otp\` to verify the value sent.`,
            ephemeral: true
          });
        })
        .catch(e => {
          log.error(`failed to send email to ${email_address}. err: ${e}`);
          interaction.reply({
            content: `Failed to send email. If you think this is a system error, ping an admin`,
            ephemeral: true
          });
        });

      return;
    }

    // /verify otp
    if (options.getSubcommand() === OTP) {
      if (await member_repo.is_member_verified(member as GuildMember)) {
        interaction.reply({ content: `You are already verified.`, ephemeral: true });
        return;
      }

      const otp = options.getInteger('otp');
      const member_otp = await member_repo.get_member_otp(member as GuildMember);
      if (!otp || !member_otp) {
        interaction.reply({
          content: `Either you haven't run \`/verify email\` yet, or something broke.`,
          ephemeral: true
        });
        return;
      }

      if (otp !== member_otp) {
        // TODO: Reset OTP?
        await interaction.reply({
          content: `Sorry, that is not the correct OTP. Please try again, or send another verification ` +
            `email for a new OTP.`,
          ephemeral: true
        });
        return;
      }

      await member_repo.mark_member_as_verified(member as GuildMember);
      await interaction.reply({
        content: `🎉 Hooray! You are verified! The final step is to run \`/verify country\` and you're in!`,
        ephemeral: true
      });

      return;
    }

    // /verify country
    if (options.getSubcommand() === COUNTRY) {
      if (!await member_repo.is_member_verified(member as GuildMember)) {
        interaction.reply({
          content: `You need to \`/verify email\` before you can perform this step.`,
          ephemeral: true
        });
        return;
      }

      // getting an emoji reaction on a reply is not possible?!
      await interaction.reply({ content: `I've sent you a direct message!`, ephemeral: true });

      // send a DM so we can collect a reaction
      const msg = await interaction.user.send(`React to this message with the country flag you are from. ` +
        `I reacted with Antartica's flag as an example.`);
      msg.react(`🇦🇶`);  // just an example

      msg.awaitReactions({
        filter: (_reaction, user) => user.id === interaction.user.id,
        max: 1, errors: [`time`],
        time: ((1000 * 60) * 5), // wait 5 minutes for a reaction
      }).then(async r => {
        const reaction = r.first();
        if (!reaction) return;

        const emoji = reaction.emoji.name;
        if (!country_roles.some(r => r.flag === emoji)) {
          await msg.reply(`"${emoji}" is not a flag emoji we know about. ` +
            `Please rerun \`/verify country\` or ping an admin.`);
          return;
        }

        // grant the member a new country role
        const member = get_member_from_id(client, interaction.user.id);
        if (!member) {
          msg.reply(`An internal error occured. Signal an admin!`);
          log.error(`failed to fetch member from db for user id ${interaction.user.id}`);
          return;
        }

        const role_string = country_roles.find(r => r.flag === emoji)?.role;
        const role = get_role_from_name(client, role_string || ``);
        if (!role) {
          msg.reply(`An internal error occured. Signal an admin!`);
          log.error(`failed to fetch role from string name ${role_string}`);
          return;
        }

        // assign country specific role
        give_member_role(member, role);

        const unverified = get_role_from_name(client, UNVERIFIED);
        const verified = get_role_from_name(client, VERIFIED);
        if (!unverified || !verified) {
          msg.reply(`An internal error occured. Signal an admin!`);
          log.error(`failed to fetch verfied/unverified discord roles`);
          return;
        }

        // remove inverified and grant verified
        revoke_role_from_member(member, unverified);
        give_member_role(member, verified);

        await msg.reply(`🎉 You reacted with ${emoji}, we've assigned some roles and you should now ` +
          `be able to use the server!`);
      }).catch(e => {
        log.error(e);
      });

      return;
    }

    // how did you get here?
    await interaction.reply(`👀`);
  }
};
