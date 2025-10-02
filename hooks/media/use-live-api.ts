/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenAILiveClient } from '../../lib/genai-live-client';
import { LiveConnectConfig, LiveServerToolCall } from '@google/genai';
import { AudioStreamer } from '../../lib/audio-streamer';
import { audioContext } from '../../lib/utils';
import VolMeterWorket from '../../lib/worklets/vol-meter';
import { useSettings, useUI } from '../../lib/state';

export type UseLiveApiResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;

  connect: () => Promise<void>;
  disconnect: () => void;
  connected: boolean;

  volume: number;
};

export function useLiveApi({
  apiKey,
}: {
  apiKey: string;
}): UseLiveApiResults {
  const { model } = useSettings();
  const client = useMemo(
    () => new GenAILiveClient(apiKey, model),
    [apiKey, model],
  );

  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [volume, setVolume] = useState(0);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConnectConfig>({});
  const { setLightState, setWeatherState, setMusicState, setTimerState } =
    useUI();

  // Listen to mute state changes and control audio output gain
  useEffect(() => {
    const unsub = useUI.subscribe(
      state => ({
        isMuted: state.isAgentMuted,
      }),
      ({ isMuted }) => {
        if (audioStreamerRef.current) {
          audioStreamerRef.current.gainNode.gain.value = isMuted ? 0 : 1;
        }
      },
      {
        equalityFn: (a, b) => a.isMuted === b.isMuted,
      },
    );
    return unsub;
  }, []);

  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        // Set initial volume based on state
        const { isAgentMuted } = useUI.getState();
        audioStreamerRef.current.gainNode.gain.value = isAgentMuted ? 0 : 1;

        audioStreamerRef.current
          .addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
            useUI.getState().setAgentVolume(ev.data.volume);
          })
          .then(() => {
            // Successfully added worklet
          })
          .catch(err => {
            console.error('Error adding worklet:', err);
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onOpen = () => {
      setConnected(true);
    };

    const onClose = () => {
      setConnected(false);
    };

    const stopAudioStreamer = () => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
      }
    };

    const onAudio = (data: ArrayBuffer) => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.addPCM16(new Uint8Array(data));
      }
    };

    // Bind event listeners
    client.on('open', onOpen);
    client.on('close', onClose);
    client.on('interrupted', stopAudioStreamer);
    client.on('audio', onAudio);

    const onToolCall = (toolCall: LiveServerToolCall) => {
      const functionResponses: any[] = [];

      for (const fc of toolCall.functionCalls) {
        // Handle smart home functions
        if (fc.name === 'toggle_light') {
          if (typeof fc.args.isOn === 'boolean') {
            setLightState({ isOn: fc.args.isOn });
          }
        } else if (fc.name === 'control_light') {
          const update: { color?: string; brightness?: number } = {};
          if (typeof fc.args.color === 'string') {
            update.color = fc.args.color;
          }
          if (typeof fc.args.brightness === 'number') {
            update.brightness = Math.max(
              0,
              Math.min(100, fc.args.brightness),
            );
          }
          setLightState(update);
        } else if (fc.name === 'get_weather_forecast') {
          // Simulate weather API call
          setWeatherState({ condition: 'Sunny', temperature: '25°C' });
        } else if (fc.name === 'play_music') {
          setMusicState({
            isPlaying: true,
            songName: fc.args.songName,
            artist: fc.args.artist ?? null,
          });
        } else if (fc.name === 'stop_music') {
          setMusicState({ isPlaying: false, songName: null, artist: null });
        } else if (fc.name === 'set_timer') {
          setTimerState({
            isActive: true,
            initialDuration: fc.args.durationInSeconds,
            remainingTime: fc.args.durationInSeconds,
            name: fc.args.timerName ?? null,
          });
        }

        // Prepare the response
        functionResponses.push({
          id: fc.id,
          name: fc.name,
          response: { result: 'ok' }, // simple, hard-coded function response
        });
      }

      client.sendToolResponse({ functionResponses: functionResponses });
    };

    client.on('toolcall', onToolCall);

    return () => {
      // Clean up event listeners
      client.off('open', onOpen);
      client.off('close', onClose);
      client.off('interrupted', stopAudioStreamer);
      client.off('audio', onAudio);
      client.off('toolcall', onToolCall);
    };
  }, [client, setLightState, setWeatherState, setMusicState, setTimerState]);

  const connect = useCallback(async () => {
    if (!config) {
      throw new Error('config has not been set');
    }
    client.disconnect();
    await client.connect(config);
  }, [client, config]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    setConnected(false);
    useUI.getState().setAgentVolume(0);
  }, [setConnected, client]);

  return {
    client,
    config,
    setConfig,
    connect,
    connected,
    disconnect,
    volume,
  };
}