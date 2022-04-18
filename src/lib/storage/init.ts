import { PrismaClient } from "@prisma/client";

import * as log from "../console";
import { SQL_DEBUG } from "../constants";

export const prisma = new PrismaClient({
  log: [
    { emit: `event`, level: `query` },
    { emit: `event`, level: `error` },
    { emit: `event`, level: `info` },
    { emit: `event`, level: `warn` }
  ]
});

// log events
prisma.$on(`error`, q => log.error(`prisma: ${q.message}`));
prisma.$on(`info`, q => log.info(`prisma: ${q.message}`));
prisma.$on(`warn`, q => log.info(`prisma: ${q.message}`));
if (SQL_DEBUG) prisma.$on(`query`, q => log.debug(`prisma: (${q.duration}ms) ${q.query}`));
