const NodeMediaServer = require('node-media-server');
const { Server } = require('socket.io');
const express = require('express');
const path = require('path');

const config = {
  rtmp: {
    port: 3343, // Capturing from OBS
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
    host: '0.0.0.0'
  },
  http: {
    port: 3342, // HTTP Streaming (FLV and API)
    allow_origin: '*',
    host: '0.0.0.0'
  }
};

const nms = new NodeMediaServer(config);
nms.run();

nms.on('postPublish', (session) => {
  console.log(`[RTMP] Stream published on ${session.streamPath}`);
});

nms.on('donePublish', (session) => {
  console.log(`[RTMP] Stream ended on ${session.streamPath}`);
});

// Socket.IO Server on an independent port (3344)
const io = new Server(3344, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store chat history in memory
let chatHistory = [];

// Clear chat history every 12 hours
setInterval(() => {
  chatHistory = [];
  io.emit('history', chatHistory); // Tell all clients to clear their screens
  console.log('[Chat] History cleared (12-hour interval)');
}, 12 * 60 * 60 * 1000);

io.on('connection', (socket) => {
  console.log('User connected to chat');
  // Send existing chat history to the new user
  socket.emit('history', chatHistory);
  // Broadcast the number of connected clients to all clients
  io.emit('viewers', io.engine.clientsCount);
  
  socket.on('chat_message', (msg) => {
    // Save message to history
    chatHistory.push(msg);
    // Optional: Keep history reasonably sized (e.g. max 500 messages) to prevent memory leaks over 12 hours
    if (chatHistory.length > 500) {
      chatHistory.shift();
    }
    // Broadcast message to all connected clients
    io.emit('chat_message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Update viewers count when someone leaves
    io.emit('viewers', io.engine.clientsCount);
  });
});

// Serve Frontend (Port 8865)
const frontendApp = express();
const distPath = path.join(__dirname, '../frontend/dist');

// Serve the static React build
frontendApp.use(express.static(distPath));

frontendApp.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

frontendApp.listen(8865, '0.0.0.0', () => {
  console.log('Frontend server is running on port 8865');
});
