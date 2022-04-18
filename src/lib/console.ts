import chalk from "chalk";

export const log = console.log;

export const info = (m: string): void => log(`i| ${chalk.green(m)}`);
export const error = (m: string): void => log(`e| ${chalk.red(m)}`);
export const debug = (m: string): void => {
    if (process.env.DEBUG != `1`) return;
    log(`d| ${chalk.dim(m)}`);
};
