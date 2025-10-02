/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import './TimerDisplay.css';
import { useUI } from '../../../lib/state';
import cn from 'classnames';

const TimerDisplay: React.FC = () => {
  const { timerState, setTimerState, decrementTimer } = useUI();
  const { isActive, remainingTime, name } = timerState;

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && remainingTime > 0) {
      interval = window.setInterval(() => {
        decrementTimer();
      }, 1000);
    } else if (isActive && remainingTime <= 0) {
      // Timer finished
      setTimeout(() => {
        setTimerState({ isActive: false, remainingTime: 0, name: null });
      }, 5000); // Hide after 5 seconds
    }
    return () => clearInterval(interval);
  }, [isActive, remainingTime, decrementTimer, setTimerState]);

  const formatTime = (seconds: number) => {
    if (seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const isFinished = isActive && remainingTime <= 0;

  if (!isActive) {
    return null;
  }

  return (
    <div className={cn('timer-display', { finished: isFinished })}>
      <div className="timer-icon material-symbols-outlined">timer</div>
      <div className="timer-info">
        <div className="timer-name">{name || 'Timer'}</div>
        <div className="timer-time">{formatTime(remainingTime)}</div>
      </div>
    </div>
  );
};

export default TimerDisplay;