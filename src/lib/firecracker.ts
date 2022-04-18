import fs from "fs";
import path from "path/posix";
import * as crypto from "crypto";
import {
  ChildProcessWithoutNullStreams,
  spawn as process_spawn,
  spawnSync as spawn_sync
} from "child_process";

import { User } from "discord.js";
import { codeBlock } from "@discordjs/builders";
import got from "got";

import * as log from "../lib/console";

import {
  FIRECRACKER_BINARY_PATH,
  FIRECRACKER_ADD_TAP_SCRIPT,
  FIRECRACKER_DEL_TAP_SCRIPT
} from "./constants";
import { players } from "../commands/message/challenge/gtw/_lib";

// OutputQueue is a simple output queue to stream vm
// output to a discord client
class OutputQueue {
  queue: string[];

  constructor() {
    this.queue = [];
  }

  public get length(): number {
    return this.queue.length;
  }

  public empty(): boolean {
    return this.queue.length === 0;
  }

  public push(d: string) {
    this.queue.push(d);
  }

  public pull(): string | undefined {
    return this.queue.shift();
  }
}

export class Firecracker {
  workdir: string;
  sock_path: string;
  log_path: string;

  _timeout: number;
  _process: ChildProcessWithoutNullStreams | undefined;

  _cleanup_started: boolean;
  _cleanup_event: NodeJS.Process | undefined;

  _tapname: string | undefined;

  _interactor: User | undefined;

  _stdout: OutputQueue;
  _stderr: OutputQueue;
  _stream_interval: NodeJS.Timer | undefined;
  _stream_max = 1800;  // maximum output per message for vm output

  constructor(workdir: string) {

    this.workdir = workdir;
    this.setup_workdir();

    this.sock_path = path.join(this.workdir, `fc.socket`);
    this.log_path = path.join(this.workdir, `firecracker.log`);
    this._timeout = 10; // 10 minute vm timeout

    this._cleanup_started = false;

    this._stdout = new OutputQueue();
    this._stderr = new OutputQueue();

    // catchall listener in case we crash/exit early to cleanup
    this._cleanup_event = process.on(`SIGINT`, () => {
      this.cleanup(`SIGINT`);
      process.exit();
    });
  }

  public set timeout(t: number) {
    this._timeout = t;
  }

  get timeout(): number {
    return this._timeout;
  }

  private setup_workdir(): void {
    fs.rmSync(this.workdir, { recursive: true, force: true });
    fs.mkdirSync(this.workdir, { recursive: true });
  }

  private os_command(cmd: string, args: string[]): void {
    log.debug(`os command|running| ${cmd} ${args.join(' ')}`);

    const res = spawn_sync(cmd, args);

    if (res.status && res.status > 0) log.error(`os command|failed|return code: ${res.status}`);

    if (res.stdout.length > 0) log.debug(`os command|stdout|${res.stdout}`);
    if (res.stderr.length > 0) log.debug(`os command|stderr|${res.stderr}`);
  }

  public async spawn(): Promise<ChildProcessWithoutNullStreams> {
    log.debug(`spawning firecracker: ${FIRECRACKER_BINARY_PATH}, ` +
      `sock_path: ${this.sock_path}, log_path: ${path.join(this.workdir, `firecracker.log`)}`);

    // 'touch' the logfile. firecracker wont boot if this file does not
    // already exist. it actually crashes :(
    fs.closeSync(fs.openSync(this.log_path, `w`));

    // boot a fresh firecracker
    this._process = process_spawn(FIRECRACKER_BINARY_PATH, [
      `--api-sock`, this.sock_path,
      `--log-path`, this.log_path
    ], {
      timeout: (1000 * 60) * this.timeout
    });

    // buffer stdin/stdout. these compliment the stream_to function
    this._process.stdout.on(`data`, (d) => this._stdout.push(d));
    this._process.stderr.on(`data`, (d) => this._stderr.push(d));

    // handle exits
    this._process.on(`exit`, () => this.cleanup(`exit`));
    this._process.on(`close`, () => this.cleanup(`close`));
    this._process.on(`error`, () => this.cleanup(`error`));

    return this._process;
  }

  public prepare_network(): string {
    this._tapname = `tap${crypto.randomInt(2147483647).toString()}`;
    this.os_command(`sudo`, [FIRECRACKER_ADD_TAP_SCRIPT, this._tapname]);

    return this._tapname;
  }

  public tear_down_network(): void {
    if (!this._tapname) return;

    this.os_command(`sudo`, [FIRECRACKER_DEL_TAP_SCRIPT, this._tapname]);
  }

  // stream's the stdin/stdout buffer's to a message as a reply
  public stream_to(user: User): void {
    if (!this._process) return;

    this._interactor = user;

    // heh, am i in trouble? https://stackoverflow.com/a/29497680
    const cleanup = (s: string): string => s.replace(
      // eslint-disable-next-line no-control-regex
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

    // the "intervaled" function that streams to a discord user
    const send_output = async (): Promise<void> => {
      let payload: string;

      while (!this._stdout.empty() || !this._stderr.empty()) {
        [this._stdout, this._stderr].forEach(async stream => {
          payload = ``; // empty the payload
          while (!stream.empty() && payload.length < this._stream_max) payload += stream.pull();
          if (payload != ``) await user.send(codeBlock(cleanup(payload))).catch(e => console.log(e));
        });
      }
    };

    // flush the buffer every x seconds
    this._stream_interval = setInterval(send_output, (1000 * 5) /* 5 sec */);

    // once we reach _timeout, remove the interval
    setInterval(() => {
      if (this._stream_interval) clearInterval(this._stream_interval);
    }, (1000 * 60) * this._timeout);
  }

  // -- socket api calls

  private make_uri(e: string): string {
    while (e.startsWith(`/`)) e = e.substring(1);
    return `http://unix:${this.sock_path}:/${e}`;
  }

  public async get(s: string): Promise<void | string> {
    const p = this.make_uri(s);
    log.debug(`getting firecracker api endpoint: GET ${p}`);
    const data = await got.get(p).catch(e => console.log(e));
    if (!data) return;
    log.debug(`resp code : ${data.statusCode}`);

    return data.body;
  }

  public async put(s: string, body: BootSource | Drive | Interface | MmdsChallenge1 | MmdsChallenge2 | Action): Promise<boolean> {
    const p = this.make_uri(s);
    log.debug(`firecracker api call: PUT ${p}`);

    return await got.put(p, { body: JSON.stringify(body) })
      .then((data) => {
        log.debug(`firecracker api call: PUT ${p} => ${data.statusCode}`);

        return true;  // success
      })
      .catch(e => {
        const { response } = e;
        if (!response) {
          log.error(`firecracker api call: PUT ${p} failed with: ${e}`);
          log.error(`check out the firecracker.log in ${this.workdir}`);
          return false;
        }

        const body = JSON.parse(response.body);
        console.log(body.fault_message);
        log.error(`firecracker api call: PUT ${p} failed with: ${body.fault_message}`);

        return false; // failure!
      });
  }

  // --

  public cleanup(sig: string): void {

    // check if another signal is already handling cleanup. if not,
    // mark this one as the one that is.
    if (this._cleanup_started) return;
    this._cleanup_started = true;

    log.debug(`cleaning up firecracker process ${this._process?.pid} from signal ${sig}`);

    // remove the vm lock
    players.splice(players.findIndex(p => p.id == this._interactor?.id), 1);

    // kill the child process
    if (this._process) this._process.kill();

    // remove the firecracker socket
    if (fs.existsSync(this.sock_path)) fs.unlinkSync(this.sock_path); // remove the socket

    // remove tap interfaces
    this.tear_down_network();

    // clear sigint handler
    this._cleanup_event?.removeAllListeners();

    // let the player know!
    if (this._interactor) this._interactor.send(`💀 Procedure terminating.`);
  }
}

export type BootSource = {
  kernel_image_path: string;
  boot_args?: string;
  initrd_path?: string;
};

export type Drive = {
  drive_id: string;
  path_on_host: string;
  is_root_device: boolean;
  is_read_only: boolean;
};

export type Interface = {
  allow_mmds_requests?: boolean;
  guest_mac?: string;
  host_dev_name: string;
  iface_id: string;
};

export type MmdsChallenge1 = {
  global_thermonuclear_war: {
    flag: string;
  };
};

export type MmdsChallenge2 = {
  global_thermonuclear_war_part2: {
    luks: string;
  };
};

export type Action = {
  action_type: "FlushMetrics" | "InstanceStart" | "SendCtrlAltDel";
};
