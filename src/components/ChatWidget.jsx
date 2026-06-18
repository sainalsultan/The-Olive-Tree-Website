import { useEffect, useRef, useState } from 'react';
import LeafIcon from './LeafIcon';

function TypingIndicator() {
  return (
    <div className="typing">
      <span /><span /><span />
    </div>
  );
}

function Message({ msg }) {
  if (msg.role === 'typing') return <TypingIndicator />;
  return (
    <div
      className={`message ${msg.role}${msg.isStreaming ? ' streaming' : ''}`}
      dangerouslySetInnerHTML={{ __html: msg.html }}
    />
  );
}

export default function ChatWidget({ isOpen, onClose, onResetKey, messages, suggestions, isBusy, onSend, onSuggestionClick }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isBusy) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className={`chat-container${isOpen ? ' open' : ''}`}>
      {/* Header */}
      <div className="chat-header">
        <div className="chat-avatar" aria-hidden="true" style={{ position: 'relative', display: 'inline-flex' }}>
          <LeafIcon size={24} />
          <span className="badge-online" aria-label="Online" />
        </div>
        <div className="chat-header-info">
          <strong>Le Petit Bistrot</strong>
          <small>AI Assistant · Online</small>
        </div>
        <div className="chat-header-actions"> 
          <button className="close-btn" onClick={onClose} aria-label="Close chat">✕</button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((chip, i) => (
            <button
              key={i}
              className="suggestion-chip"
              onClick={() => { onSuggestionClick(chip); }}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything…"
          disabled={isBusy}
          autoComplete="off"
        />
        <button id="sendBtn" onClick={handleSend} disabled={isBusy} aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
