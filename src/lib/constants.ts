import * as dotenv from "dotenv";
import dotenv_expand from "dotenv-expand";

const env = dotenv.config();
dotenv_expand(env);

// env
export const DEBUG = process.env.DEBUG || false;
export const SQL_DEBUG = process.env.SQL_DEBUG || false;
export const DISCORD_TOKEN = <string>process.env.TOKEN;
export const CLIENT_ID = <string>process.env.CLIENT_ID;
export const GUILD_ID = <string>process.env.GUILD_ID;
export const STORAGE_URI = <string>process.env.DATA_STORE;
export const FIRECRACKER_BINARY_PATH = <string>process.env.FIRECRACKER_BINARY_PATH;
export const FIRECRACKER_SOCKET_DIR = <string>process.env.FIRECRACKER_SOCKET_DIR;
export const FIRECRACKER_CHALLENGE_FS_DIR = <string>process.env.FIRECRACKER_CHALLENGE_FS_DIR;
export const FIRECRACKER_ADD_TAP_SCRIPT = process.env.FIRECRACKER_ADD_TAP_SCRIPT || ``;
export const FIRECRACKER_DEL_TAP_SCRIPT = process.env.FIRECRACKER_DEL_TAP_SCRIPT || ``;
export const PASSWORD_CHALLENGE_LISTS = process.env.PASSWORD_CHALLENGE_LISTS;

// validation
if (FIRECRACKER_ADD_TAP_SCRIPT == ``) throw `FIRECRACKER_ADD_TAP_SCRIPT not configured`;
if (FIRECRACKER_DEL_TAP_SCRIPT == ``) throw `FIRECRACKER_DEL_TAP_SCRIPT not configured`;

// msg cmd prefixes
export const PREFIX_USER = `.`;
export const PREFIX_ADMIN = `~`;
export const PREFIX_CHAL = `&`;
export const SUFFIX_HELP = `?`;

// general roles
export const ADMIN_ROLE = `admin`;
export const VERIFIED = `verified`;
export const UNVERIFIED = `unverified`;

// challenge roles
export const CHALLENGE_FOLLOWS_INSTRUCTIONS = `challenge:follows_instructions`;
export const CHALLENGE_MIMICKER = `challenge:mimicker`;
export const CHALLENGE_GTW_1 = `challenge:global_thermonuclear_war_1`;
export const CHALLENGE_GTW_2 = `challenge:global_thermonuclear_war_2`;
export const CHALLENGE_WARANDUNITY_SPY = `challenge:war_and_unity_i_can_spy`;
export const CHALLENGE_WARANDUNITY_20_GRAND = `challenge:war_and_unity_20_grand_palace`;
export const CHALLENGE_WARANDUNITY_SAVED_PLANET = `challenge:war_and_unity_saved_the_planet`;
export const CHALLENGE_WARANDUNITY_TOUCH_WOPR = `challenge:war_and_unity_touched_the_wopr`;
export const CHALLENGE_PDF_MAKER = `challenge:pdf_maker`;
export const CHALLENGE_LAUNCH_NUKE = `challenge:launch_the_nuke`;
export const CHALLENGE_SEEKER_OF_TRUTHS = `challenge:seeker_of_truths`;

// game roles
export const DEAD = `dead`;

// channels
export const BOT_ADMIN = `881092630899994684`;
export const GENERAL = `886664299521642506`;
export const ROLE_LOG = `886664421152260116`;
export const DEFCON_LEVEL = `886664640925413467`;

// password challenges
export const PASS_CHAL_JWT = `jwt`;
export const PASS_CHAL_NIST = `nist`;
export const PASS_CHAL_HTTP = `http`;

// todo: move this somewhere else? maybe the command?
export const game_list = [
  `Falken's Maze`, `Black Jack`, `Gin Rummy`, `Hearts`,
  `Bridge`, `Checkers`, `Chess`, `Poker`, `Fighter Combat`,
  `Guerrilla Engagement`, `Desert Warfare`, `Air-to-Ground Actions`,
  `Theatrewide Tactical Warfare`, `Theatrewide Biotoxic and Chemical Warfare`,
  `Global Thermonuclear War`
];
