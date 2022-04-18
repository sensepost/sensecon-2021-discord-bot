import {
  CHALLENGE_GTW_1,
  CHALLENGE_GTW_2,
  CHALLENGE_FOLLOWS_INSTRUCTIONS,
  CHALLENGE_WARANDUNITY_20_GRAND,
  CHALLENGE_WARANDUNITY_SAVED_PLANET,
  CHALLENGE_WARANDUNITY_TOUCH_WOPR,
  CHALLENGE_PDF_MAKER,
  CHALLENGE_WARANDUNITY_SPY,
  CHALLENGE_SEEKER_OF_TRUTHS
} from "./constants";

import { Flag } from "./types";

export const flags: Flag[] = [
  // lol :D
  {
    flag: `SENSECON{YourFlagHere}`,
    role_name: CHALLENGE_FOLLOWS_INSTRUCTIONS
  },
  // global thermonuclear war
  {
    flag: `SENSECON{TheyDontKnowAboutJoshua}`,
    role_name: CHALLENGE_GTW_1
  },
  {
    flag: `SENSECON{General, you are listening to a machine. ` +
      `Do the world a favor and don't act like one.}`,
    role_name: CHALLENGE_GTW_2
  },
  // WarAndUnity game
  {
    flag: `SENSECON{SaulsFishMarketHadNoCarrierTone}`,
    role_name: CHALLENGE_WARANDUNITY_SPY
  },
  {
    flag: `SENSECON{Pl4y3dAllTh3Arc4de}`,
    role_name: CHALLENGE_WARANDUNITY_20_GRAND
  },
  {
    flag: `SENSECON{n0-w1nn1ng-m0ve}`,
    role_name: CHALLENGE_WARANDUNITY_SAVED_PLANET
  },
  {
    flag: `SENSECON{OvergrownPileOfMicrochips}`,
    role_name: CHALLENGE_WARANDUNITY_TOUCH_WOPR
  },
  // PDFMaker
  {
    flag: `SENSECON{Th3_p4s$w0rd_iS_jOshUa}`,
    role_name: CHALLENGE_PDF_MAKER
  },
  // avatar
  {
    flag: `SENSECON{What-you_see-on_these-screens_up-here_is-a_fantasy-a_computer-enhanced_hallucination.}`,
    role_name: CHALLENGE_SEEKER_OF_TRUTHS
  }
];
