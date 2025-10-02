/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { useLogStore } from '../../../lib/state';
import WelcomeScreen from '../welcome-screen/WelcomeScreen';
import cn from 'classnames';
import './ConversationLog.css';

const ConversationLog: React.FC = () => {
  const { turns } = useLogStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [turns]);

  if (turns.length === 0) {
    return <WelcomeScreen />;
  }

  return (
    <div className="conversation-log-container" ref={logContainerRef}>
      <div className="conversation-log">
        {turns.map((turn, index) => (
          <div
            key={`${turn.role}-${turn.timestamp.toISOString()}-${index}`}
            className={cn('turn', turn.role)}
          >
            <div className="bubble">
              <div className="role-label">
                {turn.role === 'agent'
                  ? 'Agent'
                  : turn.role === 'user'
                    ? 'You'
                    : 'System'}
              </div>
              {turn.role === 'system' ? (
                <pre>
                  <code>{turn.text}</code>
                </pre>
              ) : (
                <p>{turn.text}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationLog;
