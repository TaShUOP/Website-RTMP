import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import VideoPlayer from './components/VideoPlayer';
// Socket will be initialized dynamically inside the component

function App() {
  const [username, setUsername] = useState(() => localStorage.getItem('wc26_username') || '');
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(!localStorage.getItem('wc26_username'));
  const [usernameInput, setUsernameInput] = useState('');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState('http://localhost:3342/live');
  const [socketUrlInput, setSocketUrlInput] = useState('http://localhost:3344');
  const [streamKeyInput, setStreamKeyInput] = useState('test');
  
  const [activeConfig, setActiveConfig] = useState({
    serverUrl: 'http://localhost:3342/live',
    socketUrl: 'http://localhost:3344',
    streamKey: 'test'
  });

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(activeConfig.socketUrl);
    setSocket(newSocket);
    return () => newSocket.close();
  }, [activeConfig.socketUrl]);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [viewers, setViewers] = useState(0);
  const chatMessagesRef = useRef(null);

  const streamUrl = `${activeConfig.serverUrl}/${activeConfig.streamKey}.flv`;

  useEffect(() => {
    if (!socket) return;

    socket.on('history', (historyMsgs) => {
      setMessages(historyMsgs);
    });

    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('viewers', (count) => {
      setViewers(count);
    });

    return () => {
      socket.off('history');
      socket.off('chat_message');
      socket.off('viewers');
    };
  }, [socket]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (serverUrlInput.trim() && streamKeyInput.trim() && socketUrlInput.trim()) {
      setActiveConfig({
        serverUrl: serverUrlInput.trim(),
        socketUrl: socketUrlInput.trim(),
        streamKey: streamKeyInput.trim()
      });
      setIsSettingsModalOpen(false);
    }
  };

  const handleSaveUsername = (e) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      const name = usernameInput.trim().slice(0, 24);
      setUsername(name);
      localStorage.setItem('wc26_username', name);
      setIsUsernameModalOpen(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!username) {
      setIsUsernameModalOpen(true);
      return;
    }

    const msg = {
      id: Date.now(),
      username: username,
      user: username, // backwards compatibility
      text: newMessage.trim(),
      ts: Date.now()
    };
    if (socket) {
      socket.emit('chat_message', msg);
    }
    setNewMessage('');
  };

  return (
    <>
      <div className="bg-ripples" aria-hidden="true"></div>
      <div className="bg-scrim" aria-hidden="true"></div>

      <div className="app">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">●</span>
            <span className="brand-name">WC26<span className="brand-name-accent">LIVE</span></span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/ios/" className="btn-settings" style={{ background: 'var(--live-red)', color: 'white', border: 'none', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 1.44S9.22 5 7 5a4.91 4.91 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>
              iOS Player
            </a>
            <button className="btn-settings" onClick={() => setIsSettingsModalOpen(true)} type="button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </button>
          </div>
          <div className="live-badge">
            <span className="live-dot"></span> LIVE
          </div>
        </header>

        <main className="layout">
          <section className="stage">
            <div className="player-wrap">
              <VideoPlayer streamUrl={streamUrl} />
              {!activeConfig.streamKey && (
                <div className="player-overlay">
                  <p>No stream configured.</p>
                  <p className="muted">Enter stream URL in settings.</p>
                </div>
              )}
            </div>

            <div className="info-card">
              <h1 className="event-title">Live Match Coverage</h1>
              <div className="meta-row">
                <span className="meta-item">World Cup 2026</span>
                <span className="meta-dot">•</span>
                <span className="meta-item ticker">{viewers || '—'} watching</span>
              </div>
              <hr className="divider" />
              <div className="broadcaster-row">
                <div className="broadcaster-id">
                  <div className="broadcaster-avatar">B</div>
                  <div>
                    <div className="broadcaster-name">Official Broadcast</div>
                    <div className="broadcaster-sub muted">Streaming now</div>
                  </div>
                </div>
                <button className="btn-follow" type="button">Follow event</button>
              </div>
            </div>
          </section>

          <aside className="chat-panel">
            <div className="chat-header">
              <span>Live chat</span>
              <span className="chat-viewer-pill">{viewers || '—'} online</span>
            </div>
            <div className="chat-messages" ref={chatMessagesRef} aria-live="polite">
              {messages.map((msg, i) => (
                <div key={msg.id || i} className="chat-message">
                  <span className="author">{msg.username || msg.user}:</span>
                  {msg.text}
                </div>
              ))}
            </div>
            <form className="chat-input-row" onSubmit={handleSendMessage}>
              <input
                className="chat-input"
                type="text"
                maxLength="300"
                placeholder="Send a message…"
                autoComplete="off"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button className="chat-send" type="submit" aria-label="Send message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
              </button>
            </form>
          </aside>
        </main>
      </div>

      {isUsernameModalOpen && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleSaveUsername}>
            <h2>Join the live chat</h2>
            <p className="muted">Pick a display name. It's stored only in this browser.</p>
            <input 
              className="modal-input" 
              type="text" 
              maxLength="24" 
              placeholder="Display name" 
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
            <button className="btn-primary" type="submit">Join chat</button>
          </form>
        </div>
      )}

      {isSettingsModalOpen && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={handleSaveSettings}>
            <div className="modal-head">
              <h2>Settings</h2>
              <button className="modal-close" onClick={() => setIsSettingsModalOpen(false)} type="button" aria-label="Close settings">✕</button>
            </div>

            <label className="field-label">Stream URL</label>
            <input className="modal-input" type="text" value={serverUrlInput} onChange={(e) => setServerUrlInput(e.target.value)} required />

            <label className="field-label">Stream Key</label>
            <input className="modal-input" type="text" value={streamKeyInput} onChange={(e) => setStreamKeyInput(e.target.value)} required />

            <label className="field-label">Chat/Socket URL</label>
            <input className="modal-input" type="text" value={socketUrlInput} onChange={(e) => setSocketUrlInput(e.target.value)} required />

            <button className="btn-primary" style={{ marginTop: '16px' }} type="submit">Save settings</button>
          </form>
        </div>
      )}
    </>
  );
}

export default App;
