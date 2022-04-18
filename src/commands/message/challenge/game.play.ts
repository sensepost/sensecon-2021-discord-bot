import { Message, User } from "discord.js";
import { codeBlock } from "@discordjs/builders";
import { EntityType } from "@prisma/client";

import { MessageCommand } from "../../../lib/types";
import {
  CLIENT_ID,
  game_list,
  PREFIX_CHAL
} from "../../../lib/constants";
import { extract_command_args } from "../../../lib/helpers/commands";
import * as tic_tac_toe_repo from "../../../lib/storage/tic_tac_toe_tracker";

export const command: MessageCommand = {
  name: `${PREFIX_CHAL}gp`,
  desc: `play a game`,
  help: `usage: \`&gp <game name>\``,
  run: async (interaction: Message): Promise<void> => {

    const args = extract_command_args(interaction.content, command.name.length);

    if (args.length !== 1) {
      await interaction.channel.send(`a game was not specified. ${command.help}`);
      return;
    }

    const [game_name] = args;

    if (!game_list.some(name => name === game_name) && game_name !== `tictactoe`) {
      await interaction.channel.send(`no such game.`);
      return;
    }

    if (game_list.some(name => name === game_name)) {
      await interaction.channel.send(`access denied.`);
      return;
    }

    const state = `_________`;
    //interaction.reply(`let's play a game, use the legend below:\n${codeBlock(draw_board(`123456789`))}\nx is me, o is you`);
    interaction.reply(`${codeBlock(draw_board(state))}\nmake a move by reacting with 1️⃣-9️⃣`).then(async function (message: Message) {
      await start_game(state, message, interaction.author);
    });
  }
};

export const start_game = async (state: string, message: Message, user: User): Promise<void> => {
  const collector = message.createReactionCollector({
    filter: (_reaction, user) => user.id === user.id,
    time: 360000, //let it run for 5 minutes
    dispose: true
  });

  collector.on(`collect`, (r, _u) => {
    if (!r.emoji || !r.emoji.name) return;

    const pos = (parseInt(r.emoji.name.toString()) - 1);

    if (isNaN(pos) || (pos < 0 || pos > 8)) {
      send_update(state, message, `invalid move there buddy, react with a number (1-9) to make a move.`);
    } else if (check_winner(state)) {
      send_update(state, message, `game has ended as there was a winner.`);
      collector.stop();
    } else if (!can_make_a_move(state)) {
      send_update(state, message, `A strange game. The only winning move is not to play. How about a nice game of global thermonuclear war?`);
      collector.stop();
    } else if (state.substr(pos, 1) === `_`) {
      state = state.substring(0, pos) + `o` + state.substring(pos + 1, state.length);
      //thanks kind people @ https://dev.to/bornasepic/pure-and-simple-tic-tac-toe-with-javascript-4pgn
      //if the user isnt a winner just yet, lets calc a possible move for the bot
      if (check_winner(state) === true) {
        send_update(state, message, `winner winner chicken dinner. <@${user.id}> won!`);
        collector.stop('ended');

        if (!user) return;

        tic_tac_toe_repo.add_tictactoe_result(user, EntityType.user);
        return;
      }

      if (!can_make_a_move(state)) {
        send_update(state, message, `A strange game. The only winning move is not to play. How about a nice game of global thermonuclear war?`);
        collector.stop('ended');
        return;
      }

      send_update(state, message, `thinking...`);
      const bot_pos = determine_next_move(state);
      state = state.substring(0, bot_pos) + `x` + state.substring(bot_pos + 1, state.length);

      if (check_winner(state) === true) {
        send_update(state, message, `winner winner chicken dinner. <@${CLIENT_ID}> won!`);
        collector.stop('ended');

        if (!user) return;

        tic_tac_toe_repo.add_tictactoe_result(user, EntityType.bot);
        return;
      }

      send_update(state, message, `your move :).`);
    } else {
      send_update(state, message, `can't make a move on an already taken spot.`);
    }
  });

  collector.on("end", (_collected, reason) => {
    if (reason && reason == `ended`) return;
    send_update(state, message, `times up buddy. im taking that as a win for me.`);

    if (!user) return;
    tic_tac_toe_repo.add_tictactoe_result(user, EntityType.bot);
  });
};

export const winning_conditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

export const can_make_a_move = (state: string): boolean => {
  if (state.indexOf(`_`) === -1) {
    return false;
  } else {
    return true;
  }
};

export const draw_board = (state: string): string => {
  let new_message = `._ _ _\n`;

  for (let i = 0; i < state.length; i++) {
    new_message += `|` + state.substr(i, 1);

    if (((i + 1) % 3) == 0) {
      new_message += `|\n`;
    }
  }

  return new_message;
};

export const check_winner = (state: string): boolean => {
  let winner = false;

  for (let i = 0; i <= 7; i++) {
    const win_condition = winning_conditions[i];
    const a = state[win_condition[0]];
    const b = state[win_condition[1]];
    const c = state[win_condition[2]];
    if (a === `` || b === `` || c === ``) {
      continue;
    }
    if (a === b && b === c && c !== `_`) {
      winner = true;
    }
  }
  return winner;
};

export const send_update = (state: string, message: Message, feedback: string): void => {
  message.edit(`${codeBlock(draw_board(state))}\n${feedback}`);
};

// this function is for the bot to determine a the right move.
// priority wise - a winning move by the bot is preferred above all else
// second - a blocking move is preferred next
// third - a move which will make sure that we have two in a row
// fourth - any move essentially 
export const determine_next_move = (state: string): number => {

  let placeholder = -1;
  let new_score = -1;

  for (let i = 0; i <= 7; i++) {
    const win_conditions = winning_conditions[i];
    const a = state[win_conditions[0]];
    const b = state[win_conditions[1]];
    const c = state[win_conditions[2]];
    if ((a === `x` && b === `x` && c === `_`) || (c === `x` && b === `x` && a === `_`) || (c === `x` && a === `x` && b === `_`)) {
      if (new_score < 95) {
        new_score = 95;
        if (a === `_`) {
          placeholder = win_conditions[0];
        } else if (b === `_`) {
          placeholder = win_conditions[1];
        } else if (c === `_`) {
          placeholder = win_conditions[2];
        }
      }
    } else if ((a === b && a === `o` && c === `_`) || (a === c && a === `o` && b === `_`) || (b === c && c === `o` && a === `_`)) {
      if (new_score < 90) {
        new_score = 90;
        if (c === `_`) {
          placeholder = win_conditions[2];
        } else if (b === `_`) {
          placeholder = win_conditions[1];
        } else if (a === `_`) {
          placeholder = win_conditions[0];
        }
      }
    } else if ((a === `x` && b === `_` && c === `_`) || (a === `_` && b === `x` && c === `_`) || (a === `_` && b === `_` && c === `x`)) {
      if (new_score < 85) {
        new_score = 85;
        if (a === `x`) {
          placeholder = win_conditions[1];
        } else if (b === `x`) {
          placeholder = win_conditions[2];
        } else if (c === `x`) {
          placeholder = win_conditions[0];
        }
      }
    } else if (a === `_` && b === `_` && c === `_`) {
      // this else if needs to be checked, there exists a condition which leads to a bot making no moves.
      if (new_score < 80) {
        new_score = 80;
        const pos = Math.trunc(Math.random() * 4);
        if (pos === 1) {
          placeholder = win_conditions[0];
        } else if (pos === 2) {
          placeholder = win_conditions[1];
        } else if (pos === 3) {
          placeholder = win_conditions[2];
        }
      }
    }
  }

  if (new_score === -1 || placeholder === -1) {
    const state_array: number[] = [];
    state.split(``).forEach((e, i) => {
      if (e === `_`) {
        state_array.push(i);
      }
    });
    placeholder = Math.floor(Math.random() * state_array.length);
  }

  return placeholder;
};
