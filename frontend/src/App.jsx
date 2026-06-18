import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import VideoPlayer from './components/VideoPlayer';

const socket = io('http://localhost:8001');

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState('http://localhost:8000/live');
  const [streamKeyInput, setStreamKeyInput] = useState('test');
  
  const [activeConfig, setActiveConfig] = useState({
    serverUrl: 'http://localhost:8000/live',
    streamKey: 'test'
  });

  const [messages, setMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to the live chat!' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatMessagesRef = useRef(null);

  const streamUrl = `${activeConfig.serverUrl}/${activeConfig.streamKey}.flv`;

  useEffect(() => {
    socket.on('chat_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('chat_message');
    };
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (serverUrlInput.trim() && streamKeyInput.trim()) {
      setActiveConfig({
        serverUrl: serverUrlInput.trim(),
        streamKey: streamKeyInput.trim()
      });
      setIsSettingsOpen(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const msg = {
        id: Date.now(),
        user: 'Guest' + Math.floor(Math.random() * 1000),
        text: newMessage.trim()
      };
      socket.emit('chat_message', msg);
      setNewMessage('');
    }
  };

  return (
    <>
      {/* Dynamic Background Element */}
      <div className="dynamic-bg">
        <div className="bg-trophy-container">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/3/3b/FIFA_World_Cup_Trophy.svg" 
            alt="World Cup Trophy" 
            className="bg-trophy"
          />
        </div>
      </div>
      
      <div className="layout-container">
        <header className="header glass-panel">
          <div className="logo">
            <span style={{ color: 'var(--accent-color)' }}>⚽</span> FWC 26 Live
          </div>
          
          <button className="btn-icon" onClick={() => setIsSettingsOpen(true)}>
            ⚙️ Settings
          </button>

          <div className="live-badge">Live</div>
        </header>

        {isSettingsOpen && (
          <div className="modal-overlay">
            <div className="modal-content glass-panel">
              <div className="modal-header">
                <h2>Stream Connection Settings</h2>
                <button className="btn-close" onClick={() => setIsSettingsOpen(false)}>×</button>
              </div>
              <form onSubmit={handleSaveSettings} className="modal-body">
                <div className="form-group">
                  <label>Server URL</label>
                  <input 
                    type="text" 
                    value={serverUrlInput} 
                    onChange={(e) => setServerUrlInput(e.target.value)} 
                    placeholder="e.g. http://localhost:8000/live"
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stream Key</label>
                  <input 
                    type="text" 
                    value={streamKeyInput} 
                    onChange={(e) => setStreamKeyInput(e.target.value)} 
                    placeholder="Enter stream key"
                    className="form-input"
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setIsSettingsOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save & Connect</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <main className="main-content">
          <div className="video-container">
            <VideoPlayer streamUrl={streamUrl} />
          </div>
          
          <div className="stream-info glass-panel">
            <h1 className="stream-title">WE ARE 26 - Live Match Coverage</h1>
            <div className="stream-meta">
              <span>🏟️ World Cup 2026</span>
              <span>👁️ 1.2M watching</span>
            </div>
            
            <div className="streamer-info">
              <div className="avatar">FIFA</div>
              <div className="streamer-details">
                <h3>Official Broadcaster</h3>
                <p>USA | CAN | MEX</p>
              </div>
              <button className="btn-subscribe">Follow Event</button>
            </div>
          </div>
        </main>

        <aside className="sidebar glass-panel">
          <div className="chat-header">
            Live Chat
          </div>
          <div className="chat-messages" ref={chatMessagesRef}>
            {messages.map((msg) => (
              <div key={msg.id} className="chat-message">
                <span className="chat-user">{msg.user}:</span> {msg.text}
              </div>
            ))}
          </div>
          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="chat-input" 
              placeholder="Send a message..." 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </form>
        </aside>
      </div>
    </>
  );
}

export default App;
