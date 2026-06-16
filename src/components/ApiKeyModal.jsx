import { useState, useEffect, useRef } from 'react';

export default function ApiKeyModal({ isOpen, onSave, onClose, initialKey = '' }) {
  const [value, setValue] = useState(initialKey);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialKey);
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, initialKey]);

  const handleSave = () => {
    if (!value.trim()) { setError(true); return; }
    onSave(value.trim());
  };

  return (
    <div className={`modal-overlay${isOpen ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal-icon">🔑</div>
        <h2>API Key</h2>
        <p>Enter your API key to enable the AI assistant. Your key is stored only in your browser.</p>
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="sk-or-v1-..."
          autoComplete="off"
          style={error ? { borderColor: '#e05252' } : {}}
        />
        <div className="modal-actions">
          <button className="btn-primary" onClick={handleSave}>Connect AI</button>
          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="btn-link">
            Get a free key →
          </a>
        </div>
      </div>
    </div>
  );
}
