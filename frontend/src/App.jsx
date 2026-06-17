import React from 'react';
import VideoPlayer from './components/VideoPlayer';

function App() {
  // Assuming the user will stream to 'rtmp://localhost/live' with key 'test'
  const streamUrl = 'http://localhost:8000/live/test.flv';

  return (
    <div className="layout-container">
      <header className="header glass-panel">
        <div className="logo">
          <span>▶</span> StreamHub
        </div>
        <div className="live-badge">Live</div>
      </header>

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
            <span className="chat-user">System:</span> Start streaming on OBS to rtmp://localhost/live with stream key 'test'.
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
