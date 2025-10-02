/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState } from 'react';
import { useLogStore, useUI } from '../../lib/state';
import cn from 'classnames';
import './HistoryModal.css';

const HistoryModal: React.FC = () => {
  const { turns } = useLogStore();
  const { toggleHistory } = useUI();
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [turns]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="history-modal-overlay" onClick={toggleHistory}>
      <div className="history-modal-content" onClick={e => e.stopPropagation()}>
        <div className="history-modal-header">
          <h2>Conversation History</h2>
          <button
            onClick={toggleHistory}
            className="close-button"
            aria-label="Close history"
          >
            <span className="icon">close</span>
          </button>
        </div>
        <div className="history-log-container" ref={logContainerRef}>
          {turns.length === 0 ? (
            <div className="empty-history">
              <span className="icon">chat_bubble_outline</span>
              <p>No history yet.</p>
              <p>Start a conversation to see it here.</p>
            </div>
          ) : (
            <div className="history-log">
              {turns.map((turn, index) => (
                <div
                  key={`${turn.role}-${turn.timestamp.toISOString()}-${index}`}
                  className={cn('turn', turn.role)}
                >
                  <div className="bubble">
                    <div className="bubble-header">
                      <div className="role-label">
                        {turn.role === 'agent'
                          ? 'Agent'
                          : turn.role === 'user'
                            ? 'You'
                            : 'System'}
                      </div>
                      <button
                        className="copy-button"
                        onClick={() => handleCopy(turn.text, index)}
                        title="Copy text"
                      >
                        <span className="icon">
                          {copiedIndex === index ? 'check' : 'content_copy'}
                        </span>
                      </button>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;