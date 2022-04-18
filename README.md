# dbot

the sensecon 2021 discord bot

**This repository contains the bot code as it ran for the internal SenseCon '21 conference and is no longer running in production.**

## setup

there are many moving parts to this bot. supporting infrastructure such as mysql is run in docker, with a `docker-compose.yml` available in the [infra/](infra/) directory. the directory has its own `.env`, so be sure to configure that accordingly before you start the stack.

as for the bot itself, because it makes use of [firecracker micro-vms](https://firecracker-microvm.github.io/), it needs to shell out to boot firecracker and to configure the appropriate tap interfaces. doing this from docker is not something i felt like tackling, so, the bot runs on the host os, supervised using [pm2](https://pm2.keymetrics.io/).

we'll go through each sections setup in detail, assuming you're using ubuntu.

### docker infrastructure

mysql, grafana and traefik all run in docker containers, glued together using docker-compose. the following steps should get that stack up for you.

1. install `docker` & `docker-compose` (`apt install docker.io docker-compose -y`).
2. `cd` to the `infra/` directory, and create a file called `acme.json`. then, fix it's permissions so that traefik does not get upset about it. (`touch acme.json`, `chmod 600 acme.json`).
3. next, copy the example `env.example` file to `.env` and make edits as needed. (`cp env.example .env`).
4. any infrastructure changes you may need to do such as DNS? now is a good time for that.
5. start the stack with `docker-compose up` and test. if you are happy, you can run `docker-compose up -d` to run detached.

### the bot itself

the bot runs on the host os. that means you need to install a few things for it to be ready to run. the following steps should get you going.

1. install an up to date version of node. package managers often distribute outdated versions. on ubuntu 20.04 LTS we can follow the [nodesource instructions](https://github.com/nodesource/distributions/blob/master/README.md). (`curl -fsSL https://deb.nodesource.com/setup_16.x | bash -`, `apt install nodejs`).
2. install the `pm2` process manager. (`npm i -g pm2`).
3. install the node dependencies by `cd`-ing into the root `dbot/` directory and running `npm i`. (`cd dbot/`, `npm i`).
4. next, build the bot. this should leave you with a new file in `dist/index.js`. (`npm run build`).
5. next, copy the example `env.example` file to `.env` and make edits as needed. (`cp env.example .env`).
6. next, run `npx prisma db push` to have the database setup as per the defined schema in prisma/schema.prisma.
7. the firecracker challenge requires some extra setup, check out the README in [assets/firecracker/scripts](assets/firecracker/scripts).
8. when ready, boot the bot to test that its working. (`npm run start`).
9. if everything looks good, plug it into `pm2` and save. (`pm2 start dist/index.js`, `pm2 save`).
