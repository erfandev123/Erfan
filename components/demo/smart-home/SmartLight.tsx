/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './SmartLight.css';
import { useUI } from '../../../lib/state';
import cn from 'classnames';

const SmartLight: React.FC = () => {
  const { lightState } = useUI();
  const { isOn, color, brightness } = lightState;

  const lightStyle: React.CSSProperties = {
    backgroundColor: isOn ? color : 'transparent',
    boxShadow: isOn
      ? `0 0 ${brightness * 2}px ${brightness * 0.5}px ${color}`
      : 'none',
  };

  return (
    <div className={cn('smart-light-container', { on: isOn })}>
      <div className="light-icon-wrapper">
        <span className="material-symbols-outlined">lightbulb</span>
        <div className="light-glow" style={lightStyle}></div>
      </div>
    </div>
  );
};

export default SmartLight;