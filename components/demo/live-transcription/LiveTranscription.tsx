/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useUI } from '../../../lib/state';
import './LiveTranscription.css';
import cn from 'classnames';

const LiveTranscription: React.FC = () => {
  const { currentUserUtterance, currentAgentUtterance } = useUI();

  const hasUserText = currentUserUtterance.trim().length > 0;
  const hasAgentText = currentAgentUtterance.trim().length > 0;

  // Render the container only if there's text to show, but keep it transparent
  // This allows for fade-in/out animations on the container itself if desired later.
  const isVisible = hasUserText || hasAgentText;

  return (
    <div className={cn('live-transcription-overlay', { visible: isVisible })}>
      <p className="transcription-text user-text">
        {hasUserText && `YOU: ${currentUserUtterance}`}
      </p>
      <p className="transcription-text agent-text">
        {hasAgentText && `AGENT: ${currentAgentUtterance}`}
      </p>
    </div>
  );
};

export default LiveTranscription;
