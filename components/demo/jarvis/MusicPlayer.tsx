/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import './MusicPlayer.css';
import { useUI } from '../../../lib/state';
import cn from 'classnames';

const MUSIC_URL =
  'https://storage.googleapis.com/v-live-sandbox-public-assets/sample-music.mp3';

const MusicPlayer: React.FC = () => {
  const { musicState, setMusicState } = useUI();
  const { isPlaying, songName, artist } = musicState;
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play().catch(e => console.error('Audio play failed:', e));
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        setMusicState({ isPlaying: false });
      };
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [setMusicState]);

  return (
    <>
      <audio ref={audioRef} src={MUSIC_URL} />
      <div className={cn('music-player', { show: isPlaying })}>
        <div className="music-icon material-symbols-outlined">music_note</div>
        <div className="music-info">
          <div className="music-title">{songName || 'Ambient Music'}</div>
          {artist && <div className="music-artist">{artist}</div>}
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;