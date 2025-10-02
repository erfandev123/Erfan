/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Added React import to support JSX.
import React from 'react';
import { useUI } from '../lib/state';

export default function Header() {
  const { toggleSidebar, toggleHistory } = useUI();

  return (
    <header className="app-header">
      <button
        className="header-button"
        onClick={toggleHistory}
        title="Conversation History"
        aria-label="Open conversation history"
      >
        History
      </button>
      <button
        className="header-button"
        onClick={toggleSidebar}
        title="Settings"
        aria-label="Open settings"
      >
        Settings
      </button>
    </header>
  );
}