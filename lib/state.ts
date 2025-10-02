/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { jarvisTools } from './tools/jarvis';

export type Template =
  | 'customer-support'
  | 'personal-assistant'
  | 'navigation-system'
  | 'jarvis';

import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from './constants';
import { FunctionResponseScheduling } from '@google/genai';

/**
 * Settings
 */
export const useSettings = create<{
  voice: string;
  setVoice: (voice: string) => void;
  // Hardcoded model for this version
  model: string;
}>(set => ({
  voice: DEFAULT_VOICE,
  setVoice: voice => set({ voice }),
  model: DEFAULT_LIVE_API_MODEL,
}));

/**
 * UI
 */
export type VisualizerState = 'idle' | 'listening' | 'speaking' | 'thinking';
export type AgentEmotion = 'happy' | 'sad' | 'neutral' | 'default';
interface LightState {
  isOn: boolean;
  color: string;
  brightness: number; // 0-100
}
interface WeatherState {
  condition: string | null;
  temperature: string | null;
}
interface MusicState {
  isPlaying: boolean;
  songName: string | null;
  artist: string | null;
}
interface TimerState {
  isActive: boolean;
  initialDuration: number;
  remainingTime: number;
  name: string | null;
}

export const useUI = create<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isHistoryOpen: boolean;
  toggleHistory: () => void;
  isAgentMuted: boolean;
  toggleAgentMuted: () => void;
  visualizerState: VisualizerState;
  setVisualizerState: (state: VisualizerState) => void;
  userVolume: number;
  setUserVolume: (volume: number) => void;
  agentVolume: number;
  setAgentVolume: (volume: number) => void;
  agentEmotion: AgentEmotion;
  setAgentEmotion: (emotion: AgentEmotion) => void;
  lightState: LightState;
  setLightState: (update: Partial<LightState>) => void;
  weatherState: WeatherState;
  setWeatherState: (update: Partial<WeatherState>) => void;
  musicState: MusicState;
  setMusicState: (update: Partial<MusicState>) => void;
  timerState: TimerState;
  setTimerState: (update: Partial<TimerState>) => void;
  decrementTimer: () => void;
  showWordByWord: boolean;
  currentUserUtterance: string;
  setCurrentUserUtterance: (utterance: string) => void;
  currentAgentUtterance: string;
  setCurrentAgentUtterance: (utterance: string) => void;
  isCameraOpen: boolean;
  setCameraOpen: (isOpen: boolean) => void;
}>(set => ({
  isSidebarOpen: false,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
  isHistoryOpen: false,
  toggleHistory: () => set(state => ({ isHistoryOpen: !state.isHistoryOpen })),
  isAgentMuted: false,
  toggleAgentMuted: () => set(state => ({ isAgentMuted: !state.isAgentMuted })),
  visualizerState: 'idle',
  setVisualizerState: state => set({ visualizerState: state }),
  userVolume: 0,
  setUserVolume: volume => set({ userVolume: volume }),
  agentVolume: 0,
  setAgentVolume: volume => set({ agentVolume: volume }),
  agentEmotion: 'default',
  setAgentEmotion: emotion => set({ agentEmotion: emotion }),
  lightState: {
    isOn: false,
    color: '#89cff0',
    brightness: 80,
  },
  setLightState: (update: Partial<LightState>) =>
    set(state => ({ lightState: { ...state.lightState, ...update } })),
  weatherState: {
    condition: null,
    temperature: null,
  },
  setWeatherState: (update: Partial<WeatherState>) =>
    set(state => ({ weatherState: { ...state.weatherState, ...update } })),
  musicState: {
    isPlaying: false,
    songName: null,
    artist: null,
  },
  setMusicState: (update: Partial<MusicState>) =>
    set(state => ({ musicState: { ...state.musicState, ...update } })),
  timerState: {
    isActive: false,
    initialDuration: 0,
    remainingTime: 0,
    name: null,
  },
  setTimerState: (update: Partial<TimerState>) =>
    set(state => ({ timerState: { ...state.timerState, ...update } })),
  decrementTimer: () =>
    set(state => ({
      timerState: {
        ...state.timerState,
        remainingTime: Math.max(0, state.timerState.remainingTime - 1),
      },
    })),
  showWordByWord: true,
  currentUserUtterance: '',
  setCurrentUserUtterance: utterance => set({ currentUserUtterance: utterance }),
  currentAgentUtterance: '',
  setCurrentAgentUtterance: utterance =>
    set({ currentAgentUtterance: utterance }),
  isCameraOpen: false,
  setCameraOpen: isOpen => set({ isCameraOpen: isOpen }),
}));

/**
 * Conversation Log
 */
export type Turn = {
  role: 'user' | 'agent' | 'system';
  text: string;
  timestamp: Date;
};

export const useLogStore = create<{
  turns: Turn[];
  addTurn: (turn: Omit<Turn, 'timestamp'>) => void;
}>(set => ({
  turns: [],
  addTurn: turn =>
    set(state => ({
      turns: [...state.turns, { ...turn, timestamp: new Date() }],
    })),
}));

/**
 * Tools
 */
export interface FunctionCall {
  name: string;
  description?: string;
  parameters?: any;
  isEnabled: boolean;
  scheduling?: FunctionResponseScheduling;
}

export const useTools = create<{
  tools: FunctionCall[];
  template: Template;
}>(() => ({
  tools: jarvisTools,
  template: 'jarvis',
}));