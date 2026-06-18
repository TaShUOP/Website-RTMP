import React, { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState('http://localhost:8000/live');
  const [streamKeyInput, setStreamKeyInput] = useState('test');
  
  const [activeConfig, setActiveConfig] = useState({
    serverUrl: 'http://localhost:8000/live',
    streamKey: 'test'
  });

  const streamUrl = `${activeConfig.serverUrl}/${activeConfig.streamKey}.flv`;

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

  return (
    <div className="layout-container">
      <header className="header glass-panel">
        <div className="logo">
          <span>▶</span> StreamHub
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
          <h1 className="stream-title">Testing Live Stream with OBS</h1>
          <div className="stream-meta">
            <span>🎮 Just Chatting</span>
            <span>👁️ 1 watching</span>
          </div>
          
          <div className="streamer-info">
            <div className="avatar">YOU</div>
            <div className="streamer-details">
              <h3>Local Streamer</h3>
              <p>1 Subscriber</p>
            </div>
            <button className="btn-subscribe">Subscribe</button>
          </div>
        </div>
      </main>

      <aside className="sidebar glass-panel">
        <div className="chat-header">
          Live Chat
        </div>
        <div className="chat-messages">
          <div className="chat-message">
            <span className="chat-user">System:</span> Welcome to the live chat!
          </div>
          <div className="chat-message">
            <span className="chat-user">System:</span> Connecting to: {activeConfig.serverUrl}
          </div>
          <div className="chat-message">
            <span className="chat-user">System:</span> Stream Key: '{activeConfig.streamKey}'.
          </div>
        </div>
        <div className="chat-input-container">
          <input type="text" className="chat-input" placeholder="Send a message..." />
        </div>
      </aside>
    </div>
  );
}

export default App;
