import path from "path/posix";
import fs from "fs";

import {
  Message,
  TextChannel
} from "discord.js";

import { Firecracker } from "../../../../lib/firecracker";
import { MessageCommand } from "../../../../lib/types";
import {
  BOT_ADMIN,
  FIRECRACKER_CHALLENGE_FS_DIR,
  FIRECRACKER_SOCKET_DIR,
  CHALLENGE_GTW_1,
  PREFIX_CHAL
} from "../../../../lib/constants";
import {
  get_attachment_from_next_message,
  get_member_from_id
} from "../../../../lib/helpers/discord";
import {
  existing_run,
  players
} from "./_lib";

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}gtw.i`,
  desc: `play global thermonuclear war, stage 2`,
  help: `usage: \`${PREFIX_CHAL}gtw.i\` (run again to stop)`,
  run: async (interaction: Message): Promise<void> => {

    const { author, client } = interaction;
    const member = get_member_from_id(client, interaction.author.id);

    // check that the player got the stage 1 flag.
    if (!member?.roles.cache.some(r => r.name === CHALLENGE_GTW_1)) {
      await interaction.reply(`Sorry! You have to solve stage 1 first! Run \`${PREFIX_CHAL}gtw.w\` for that.`);
      return;
    }

    // block when an existing instance is running
    if (await existing_run(author)) return;

    interaction.reply(`🔐 Entry restricted to MCCC and DMCCC on duty.`);
    await author.send(`With the first launch code ready, the second one now needs unlocking. We're not sure ` +
      `what happened yet, but it looks like we can't boot the machine with the encrypted disk to process the ` +
      `second sequence. Can you help?`);
    await author.send(`_Hint: The target disk is available as \`/dev/vda\` once you get a shell. Use what you ` +
      `learnt in the previous challenge._`);

    // start a fresh session, direct messaging the player
    const msg = await author.send(`🔓 Please supply an initial ramdisk to unlock the final launch code.`);
    const attachment = await get_attachment_from_next_message(interaction, 8.0, true);
    if (!attachment) return;

    msg.edit(`✅ Ramdisk received. Processing... (use \`${command.name}\` again to stop processing)`);

    // --- challenge setup
    const workdir = path.join(FIRECRACKER_SOCKET_DIR, interaction.author.id);
    const firecracker = new Firecracker(workdir);
    await firecracker.spawn();

    // let admins know
    (interaction.client.channels.cache.get(BOT_ADMIN) as TextChannel)
      .send(`<@${author.id}> just started firecracker challenge \`${command.name}\``);

    // stream vm logs as replies to the original message.
    firecracker.stream_to(author);

    // copy over base files for the challenge vm
    const chall_kernel = path.join(FIRECRACKER_CHALLENGE_FS_DIR, `vmlinux.bin`);
    const chall_rootfs = path.join(FIRECRACKER_CHALLENGE_FS_DIR, `initrd`, `rootfs-crypted.ext4`);
    const running_kernel = path.join(workdir, `vmlinux.bin`);
    const running_rootfs = path.join(workdir, `rootfs.ext4`);
    const running_ramdisk = path.join(workdir, `initrd.cpio.gz`);

    fs.copyFileSync(chall_kernel, running_kernel);
    fs.copyFileSync(chall_rootfs, running_rootfs);
    fs.writeFileSync(running_ramdisk, attachment);  // write the user initrd

    // vm configuration

    // error handler function in case we fail to configure
    // or start the vm
    const err_handle = async () => {
      firecracker.cleanup(`error`);
      await author.send(`❗️ Failed! ` +
        `If you are sure you have a valid initial ramdisk, then signal an admin for help!`);
    };

    // kernel
    if (!await firecracker.put(`/boot-source`, {
      kernel_image_path: running_kernel,
      initrd_path: running_ramdisk,
      boot_args: `console=ttyS0 reboot=k panic=1 pci=off ip=:::::eth0:dhcp`,
    })) {
      await err_handle();
      return;
    }

    // rootfs (/dev/vda)
    if (!await firecracker.put(`/drives/rootfs`, {
      drive_id: `rootfs`,
      path_on_host: running_rootfs,
      is_root_device: false,  // read here why this is false: https://github.com/firecracker-microvm/firecracker/blob/main/docs/initrd.md#notes
      is_read_only: false
    })) {
      await err_handle();
      return;
    }

    // network interface
    const tap_name = firecracker.prepare_network();
    // 1a:c9:22:35:1a:21
    const mac = `1a:c9:22:XX:XX:XX`.replace(/X/g, () =>
      `0123456789ABCDEF`.charAt(Math.floor(Math.random() * 16))).toLowerCase();

    if (!await firecracker.put(`/network-interfaces/eth0`, {
      allow_mmds_requests: true,
      iface_id: `eth0`,
      host_dev_name: tap_name,
      guest_mac: mac
    })) {
      await err_handle();
      return;
    }

    // mmds service data structure
    if (!await firecracker.put(`/mmds`, {
      global_thermonuclear_war_part2: {
        luks: `{pR0f3s$0r_falk3n}`  // professor falken
      }
    })) {
      await err_handle();
      return;
    }

    // boot!
    if (!await firecracker.put(`/actions`, {
      action_type: "InstanceStart"
    })) {
      await err_handle();
      return;
    }

    await author.send(`🔏 Going to process your ramdisk for a maximum of ${firecracker.timeout} minutes!`);
    players.push({ id: interaction.author.id, instance: firecracker });
  }
};
