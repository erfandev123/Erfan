/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may not obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import cn from 'classnames';

// FIX: Added React to import to fix "Cannot find namespace 'React'" error.
import React, { memo, ReactNode, useEffect, useRef, useState } from 'react';
import { AudioRecorder } from '../../../lib/audio-recorder';
import { useUI } from '../../../lib/state';

import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';

export type ControlTrayProps = {
  children?: ReactNode;
};

function ControlTray({ children }: ControlTrayProps) {
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(true);
  const micButtonRef = useRef<HTMLButtonElement>(null);

  const { client, connected, connect, disconnect } = useLiveAPIContext();
  const { visualizerState, userVolume, setCameraOpen } = useUI();

  useEffect(() => {
    if (!connected && micButtonRef.current) {
      micButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    if (!connected) {
      setMuted(true);
      audioRecorder.stop();
    }
  }, [connected, audioRecorder]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData);
      audioRecorder.start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off('data', onData);
    };
  }, [connected, client, muted, audioRecorder]);

  useEffect(() => {
    const onVolume = (volume: number) => {
      useUI.getState().setUserVolume(volume);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on('volume', onVolume);
    }
    return () => {
      audioRecorder.off('volume', onVolume);
      useUI.getState().setUserVolume(0); // Reset volume when disconnected/muted
    };
  }, [connected, muted, audioRecorder]);

  const handleMicClick = () => {
    if (connected) {
      // Allow muting/unmuting, but disconnection is now handled elsewhere if desired.
      // For this design, we'll keep the session open.
      setMuted(!muted);
      if (!muted === false) {
        // if unmuting
        // A short delay before ending the call allows the last speech to be processed.
        setTimeout(() => disconnect(), 500);
      }
    } else {
      connect();
      setMuted(false);
    }
  };

  const handleCameraClick = () => {
    setCameraOpen(true);
  };

  const micButtonTitle = connected
    ? muted
      ? 'Start speaking'
      : 'Stop speaking'
    : 'Start conversation';

  const icon = connected ? (muted ? 'mic_off' : 'mic') : 'mic';

  const micGlowStyle: React.CSSProperties = {};
  if (connected && !muted && visualizerState === 'listening') {
    const scale = 1 + userVolume * 4;
    micGlowStyle['--user-volume-scale'] = scale;
  }

  return (
    <section className="control-tray">
      <div className="control-tray-buttons">
        <button
          className="icon-button camera-button"
          onClick={handleCameraClick}
          title="Send an image"
          aria-label="Send an image"
          disabled={!connected}
        >
          <span className="material-symbols-outlined">photo_camera</span>
        </button>
        <div
          className={cn('mic-button-container', visualizerState, {
            connected,
            muted,
          })}
          style={micGlowStyle}
        >
          <div className="mic-glow"></div>
          <button
            ref={micButtonRef}
            className={cn('icon-button mic-button')}
            onClick={handleMicClick}
            title={micButtonTitle}
          >
            <span className="material-symbols-outlined filled">{icon}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default memo(ControlTray);