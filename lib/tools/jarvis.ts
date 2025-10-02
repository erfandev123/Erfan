/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { FunctionCall } from '../state';
import { FunctionResponseScheduling } from '@google/genai';

export const jarvisTools: FunctionCall[] = [
  {
    name: 'toggle_light',
    description: 'Toggles a smart light on or off.',
    parameters: {
      type: 'OBJECT',
      properties: {
        isOn: {
          type: 'BOOLEAN',
          description: 'Whether to turn the light on (true) or off (false).',
        },
      },
      required: ['isOn'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'control_light',
    description: 'Controls the color and brightness of a smart light.',
    parameters: {
      type: 'OBJECT',
      properties: {
        color: {
          type: 'STRING',
          description:
            'The desired color of the light (e.g., "blue", "magenta", "#FF5733").',
        },
        brightness: {
          type: 'NUMBER',
          description: 'The brightness level from 0 to 100.',
        },
      },
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'get_weather_forecast',
    description: 'Gets the current weather forecast for a specified location.',
    parameters: {
      type: 'OBJECT',
      properties: {
        location: {
          type: 'STRING',
          description: 'The city and state, e.g., San Francisco, CA',
        },
      },
      required: ['location'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'play_music',
    description: 'Plays a song. Can specify song name and artist.',
    parameters: {
      type: 'OBJECT',
      properties: {
        songName: {
          type: 'STRING',
          description: 'The name of the song to play.',
        },
        artist: {
          type: 'STRING',
          description: 'The artist of the song.',
        },
      },
      required: ['songName'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'stop_music',
    description: 'Stops the currently playing music.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
  {
    name: 'set_timer',
    description: 'Sets a timer for a specified duration.',
    parameters: {
      type: 'OBJECT',
      properties: {
        durationInSeconds: {
          type: 'NUMBER',
          description: 'The duration of the timer in seconds.',
        },
        timerName: {
          type: 'STRING',
          description: 'An optional name for the timer.',
        },
      },
      required: ['durationInSeconds'],
    },
    isEnabled: true,
    scheduling: FunctionResponseScheduling.INTERRUPT,
  },
];