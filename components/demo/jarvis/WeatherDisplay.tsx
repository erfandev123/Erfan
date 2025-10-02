/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './WeatherDisplay.css';
import { useUI } from '../../../lib/state';

const WeatherDisplay: React.FC = () => {
  const { weatherState } = useUI();
  const { condition, temperature } = weatherState;

  if (!condition || !temperature) {
    return null;
  }

  return (
    <div className="weather-display">
      <div className="weather-condition">{condition}</div>
      <div className="weather-temperature">{temperature}</div>
    </div>
  );
};

export default WeatherDisplay;