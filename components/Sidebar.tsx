/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useSettings, useUI } from '../lib/state';
import c from 'classnames';
import { AVAILABLE_VOICES } from '../lib/constants';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
// FIX: Added React import to support JSX.
import React from 'react';

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar, showWordByWord } = useUI();
  const { voice, setVoice } = useSettings();
  const { connected } = useLiveAPIContext();

  return (
    <aside className={c('sidebar', { open: isSidebarOpen })}>
      <div className="sidebar-header">
        <h3>Settings</h3>
        <button onClick={toggleSidebar} className="close-button">
          <span className="icon">close</span>
        </button>
      </div>
      <div className="sidebar-content">
        <div className="sidebar-section">
          <fieldset disabled={connected}>
            <label>
              Voice
              <select value={voice} onChange={e => setVoice(e.target.value)}>
                {AVAILABLE_VOICES.map(v => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <div className="sidebar-setting-row">
              <label htmlFor="word-by-word-toggle">
                Word-by-word Transcription
              </label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="word-by-word-toggle"
                  checked={showWordByWord}
                  onChange={e =>
                    useUI.setState({ showWordByWord: e.target.checked })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>
          </fieldset>
        </div>
      </div>
    </aside>
  );
}