/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import './RealtimeVisualizer.css';
import { useUI } from '../../../lib/state';
import cn from 'classnames';

const RealtimeVisualizer: React.FC = () => {
  const { visualizerState, userVolume, agentVolume, agentEmotion } = useUI();

  const getPillStyle = (index: number): React.CSSProperties => {
    if (visualizerState === 'listening' || visualizerState === 'speaking') {
      const volume = visualizerState === 'listening' ? userVolume : agentVolume;
      const isOuterPill = index === 0 || index === 3;
      
      const baseHeight = isOuterPill ? 35 : 55;
      const heightMultiplier = isOuterPill ? 300 : 400;
      
      const height = baseHeight + (volume * heightMultiplier);
      
      return { height: `${Math.min(250, Math.max(baseHeight, height))}px` };
    }
    return {};
  };

  return (
    <div
      className={cn(
        'realtime-visualizer',
        visualizerState,
        visualizerState === 'idle' && agentEmotion !== 'default'
          ? agentEmotion
          : '',
      )}
    >
      <div className="visualizer-pill" style={getPillStyle(0)}></div>
      <div className="visualizer-pill" style={getPillStyle(1)}></div>
      <div className="visualizer-pill" style={getPillStyle(2)}></div>
      <div className="visualizer-pill" style={getPillStyle(3)}></div>
    </div>
  );
};

export default RealtimeVisualizer;