/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Added React import to support JSX.
import React, { useEffect, useCallback, useRef } from 'react';
import {
  LiveConnectConfig,
  Modality,
  GoogleGenAI,
  Type,
} from '@google/genai';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import {
  useSettings,
  useTools,
  useUI,
  AgentEmotion,
  useLogStore,
} from '../../../lib/state';
import RealtimeVisualizer from '../realtime-visualizer/RealtimeVisualizer';
import SmartLight from '../smart-home/SmartLight';
import WeatherDisplay from '../jarvis/WeatherDisplay';
import MusicPlayer from '../jarvis/MusicPlayer';
import TimerDisplay from '../jarvis/TimerDisplay';
import LiveTranscription from '../live-transcription/LiveTranscription';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

async function detectEmotion(text: string): Promise<AgentEmotion> {
  if (!text || text.trim().length === 0) {
    return 'neutral';
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the emotion of the following text and classify it as "happy", "sad", or "neutral". Only return the single word classification. Text: "${text}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotion: {
              type: Type.STRING,
              description: 'The detected emotion: happy, sad, or neutral.',
            },
          },
          required: ['emotion'],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    const emotion = result.emotion?.toLowerCase();

    if (emotion === 'happy' || emotion === 'sad' || emotion === 'neutral') {
      return emotion;
    }
    return 'neutral';
  } catch (error) {
    console.error('Error detecting emotion:', error);
    return 'neutral';
  }
}

export default function StreamingConsole() {
  const { client, setConfig, connected } = useLiveAPIContext();
  const { voice } = useSettings();
  const { tools, template } = useTools();
  const {
    userVolume,
    agentVolume,
    setVisualizerState,
    visualizerState,
    setAgentEmotion,
    setWeatherState,
    showWordByWord,
    setCurrentUserUtterance,
    setCurrentAgentUtterance,
    currentAgentUtterance,
    currentUserUtterance,
  } = useUI();
  const { addTurn } = useLogStore();

  const userInputBuffer = useRef('');
  const agentOutputBuffer = useRef('');
  const agentUtteranceFinal = useRef('');

  const lastTurnRole = useRef<'user' | 'agent' | null>(null);

  // Set the configuration for the Live API
  useEffect(() => {
    const enabledTools = tools
      .filter(tool => tool.isEnabled)
      .map(tool => ({
        functionDeclarations: [
          {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        ],
      }));

    // For this simplified version, we'll use a hardcoded, role-appropriate prompt
    const finalSystemPrompt =
      'You are Jarvis, a sophisticated AI assistant. You are witty, efficient, and slightly sarcastic. You control smart home devices and can provide information. Be concise and confirm actions. You can also describe images.';

    const config: LiveConnectConfig = {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: {
        parts: [
          {
            text: finalSystemPrompt,
          },
        ],
      },
      tools: enabledTools,
    };

    setConfig(config);
  }, [setConfig, tools, voice]);

  const handleTurnComplete = useCallback(async () => {
    if (agentUtteranceFinal.current) {
      const emotion = await detectEmotion(agentUtteranceFinal.current);
      setAgentEmotion(emotion);
      agentUtteranceFinal.current = ''; // Reset after processing
    }
  }, [setAgentEmotion]);

  // Handle API events for transcription
  useEffect(() => {
    const handleInputTranscription = (text: string, isFinal: boolean) => {
      // Clear agent utterance when user starts speaking
      if (lastTurnRole.current !== 'user') {
        setCurrentAgentUtterance('');
        agentOutputBuffer.current = '';
        lastTurnRole.current = 'user';
        // Reset any lingering emotions
        setAgentEmotion('default');
        setWeatherState({ condition: null, temperature: null });
      }

      if (showWordByWord) {
        setCurrentUserUtterance(currentUserUtterance + text);
      } else {
        userInputBuffer.current += text;
      }

      if (isFinal) {
        const finalUtterance = showWordByWord
          ? currentUserUtterance
          : userInputBuffer.current;
        if (!showWordByWord) {
          setCurrentUserUtterance(finalUtterance);
        }
        addTurn({ role: 'user', text: finalUtterance });
        // After a short delay, clear the user utterance to prepare for agent response
        setTimeout(() => {
          setCurrentUserUtterance('');
          userInputBuffer.current = '';
        }, 1200);
      }
    };

    const handleOutputTranscription = (text: string, isFinal: boolean) => {
      if (lastTurnRole.current !== 'agent') {
        lastTurnRole.current = 'agent';
      }

      if (showWordByWord) {
        setCurrentAgentUtterance(currentAgentUtterance + text);
      } else {
        agentOutputBuffer.current += text;
      }

      if (isFinal) {
        const finalUtterance = showWordByWord
          ? currentAgentUtterance + text // append final text chunk
          : agentOutputBuffer.current;
        if (!showWordByWord) {
          setCurrentAgentUtterance(finalUtterance);
        }
        addTurn({ role: 'agent', text: finalUtterance });
        agentUtteranceFinal.current = finalUtterance;
        agentOutputBuffer.current = '';
        // The agent utterance can stay on screen until the user speaks again.
      }
    };

    client.on('inputTranscription', handleInputTranscription);
    client.on('outputTranscription', handleOutputTranscription);
    client.on('turncomplete', handleTurnComplete);

    return () => {
      client.off('inputTranscription', handleInputTranscription);
      client.off('outputTranscription', handleOutputTranscription);
      client.off('turncomplete', handleTurnComplete);
    };
  }, [
    client,
    addTurn,
    handleTurnComplete,
    setAgentEmotion,
    setWeatherState,
    showWordByWord,
    currentUserUtterance,
    currentAgentUtterance,
    setCurrentUserUtterance,
    setCurrentAgentUtterance,
  ]);

  // Logic to set visualizer state
  useEffect(() => {
    const listeningThreshold = 0.01;
    const speakingThreshold = 0.01;
    let nextState: ReturnType<typeof useUI>['visualizerState'] = 'idle';

    if (connected) {
      if (userVolume > listeningThreshold) {
        nextState = 'listening';
      } else if (agentVolume > speakingThreshold) {
        nextState = 'speaking';
      } else if (lastTurnRole.current === 'agent' && currentAgentUtterance) {
        // A simple heuristic for thinking: agent's turn but no audio yet
        if (agentVolume < speakingThreshold) {
          nextState = 'thinking';
        }
      } else {
        nextState = 'idle';
      }
    } else {
      nextState = 'idle';
    }

    if (visualizerState !== nextState) {
      setVisualizerState(nextState);
    }
  }, [
    connected,
    userVolume,
    agentVolume,
    setVisualizerState,
    visualizerState,
    currentAgentUtterance,
  ]);

  return (
    <div className="transcription-container">
      {template === 'jarvis' && (
        <>
          <SmartLight />
          <WeatherDisplay />
          <MusicPlayer />
          <TimerDisplay />
        </>
      )}
      <RealtimeVisualizer />
      <LiveTranscription />
    </div>
  );
}