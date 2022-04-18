import path from "path/posix";
import fs from "fs";
import { spawnSync } from "node:child_process";

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
  PREFIX_CHAL
} from "../../../../lib/constants";
import { get_attachment_from_next_message } from "../../../../lib/helpers/discord";
import {
  existing_run,
  players
} from "./_lib";

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}gtw.w`,
  desc: `play global thermonuclear war, stage 1`,
  help: `usage: \`${PREFIX_CHAL}gtw.w\` (run again to stop)`,
  run: async (interaction: Message): Promise<void> => {

    const { author } = interaction;

    // block when an existing instance is running
    if (await existing_run(author)) return;

    interaction.reply(`🔐 Entry restricted to MCCC and DMCCC on duty.`);
    await author.send(`Welcome to the Intercontinental Ballistic Missile System. Before we can launch, you ` +
      `need to provide the correct launch code routine to our cloud server. As part of the MCC, this is the ` +
      `first launch code of two.`);
    await author.send(`_Hint: You are looking for a flag in this challenge to submit using the \`&sf command\`._`);

    // start a fresh session, direct messaging the player
    const msg = await author.send(`🔓 Please upload a file with your launch code routine, MCCC.`);
    const attachment = await get_attachment_from_next_message(interaction, 2.0, true);
    if (!attachment) return;

    msg.edit(`✅ Launch code routine received. Processing... (use \`${command.name}\` again to stop processing)`);

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
    const chall_rootfs = path.join(FIRECRACKER_CHALLENGE_FS_DIR, `wasm`, `rootfs.ext4`);
    const running_kernel = path.join(workdir, `vmlinux.bin`);
    const running_rootfs = path.join(workdir, `rootfs.ext4`);

    fs.copyFileSync(chall_kernel, running_kernel);
    fs.copyFileSync(chall_rootfs, running_rootfs);

    // prepare the user provided file as a new fs. the idea is that
    // they upload a .wasm to discord and we exec that in the vm.
    //
    // yes, this is janky.
    // 1. create a new file with dd for 3mb
    // 2. mkfs a new user.ext4 file, using the -d flag to populate it
    // 3. add this fs as a userfs to the firecracker vm
    const user_file_p = path.join(workdir, `user_fs`);
    const user_file = path.join(user_file_p, `user.wasm`);
    const user_fs = path.join(workdir, `user.ext4`);
    fs.mkdirSync(user_file_p, { recursive: true }); // create user_fs dir
    fs.writeFileSync(user_file, attachment);        // dump file in user_fs/user.wasm
    // write the userdir to a new ext4 fs
    spawnSync(`dd`, [`if=/dev/zero`, `of=${user_fs}`, `bs=1M`, `count=3`]);
    spawnSync(`mkfs.ext4`, [`-d`, `${user_file_p}`, `${user_fs}`]);

    // vm configuration

    // error handler function in case we fail to configure
    // or start the vm
    const err_handle = async () => {
      firecracker.cleanup(`error`);
      await author.send(`❗️ Failed to process launch code routine! This looks like a system error. ` +
        `Signal an admin to help!`);
    };

    // kernel
    if (!await firecracker.put(`/boot-source`, {
      kernel_image_path: running_kernel,
      boot_args: `quiet console=ttyS0 reboot=k panic=1 pci=off ip=:::::eth0:dhcp`,
    })) {
      await err_handle();
      return;
    }

    // rootfs (/dev/vda)
    if (!await firecracker.put(`/drives/rootfs`, {
      drive_id: `rootfs`,
      path_on_host: running_rootfs,
      is_root_device: true,
      is_read_only: false
    })) {
      await err_handle();
      return;
    }

    // userfs (/dev/vdb)
    if (!await firecracker.put(`/drives/userfs`, {
      drive_id: `userfs`,
      path_on_host: user_fs,
      is_root_device: false,
      is_read_only: true
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
      global_thermonuclear_war: {
        flag: `SENSECON{TheyDontKnowAboutJoshua}`
      },
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

    await author.send(`🔏 Going to process your routine for a maximum of ${firecracker.timeout} minutes!`);
    players.push({ id: interaction.author.id, instance: firecracker });
  }
};
