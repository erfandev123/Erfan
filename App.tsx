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

// FIX: Added React import to support JSX.
import React from 'react';
import ControlTray from './components/console/control-tray/ControlTray';
import ErrorScreen from './components/demo/ErrorScreen';
import StreamingConsole from './components/demo/streaming-console/StreamingConsole';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { LiveAPIProvider } from './contexts/LiveAPIContext';
import { useUI } from './lib/state';
import CameraView from './components/camera/CameraView';
import HistoryModal from './components/history/HistoryModal';

const API_KEY = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string;
if (typeof API_KEY !== 'string') {
  throw new Error('Missing required environment variable: API_KEY or GEMINI_API_KEY');
}

/**
 * Main application component that provides a streaming interface for Live API.
 * Manages video streaming state and provides controls for webcam/screen capture.
 */
function App() {
  const { isCameraOpen, isHistoryOpen } = useUI();
  return (
    <div className="App">
      <LiveAPIProvider apiKey={API_KEY}>
        <Header />
        <Sidebar />
        <ErrorScreen />
        {isCameraOpen && <CameraView />}
        {isHistoryOpen && <HistoryModal />}
        <div className="streaming-console">
          <main>
            <StreamingConsole />
          </main>
        </div>
        <ControlTray />
      </LiveAPIProvider>
    </div>
  );
}

export default App;