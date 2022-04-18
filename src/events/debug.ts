import { Event } from "../lib/types";

const event: Event = {
  once: false,
  run: (i) => {
    console.log(i);
  }
};

export const events = {
  'type': 'debug',
  'events': [
    event
  ]
};
