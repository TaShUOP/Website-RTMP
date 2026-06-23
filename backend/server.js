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
    port: 3342, // HTTP Streaming (FLV and HLS) and API
    allow_origin: '*',
    host: '0.0.0.0',
    mediaroot: path.join(__dirname, 'media')
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg', // Use absolute path for Alpine Linux
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeep: false // Deletes old segments to save disk space
      }
    ]
  }
};

const nms = new NodeMediaServer(config);
nms.run();

// Socket.IO Server on an independent port (3344)
const io = new Server(3344, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected to chat');
  // Broadcast the number of connected clients to all clients
  io.emit('viewers', io.engine.clientsCount);
  
  socket.on('chat_message', (msg) => {
    // Broadcast message to all connected clients
    io.emit('chat_message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Update viewers count when someone leaves
    io.emit('viewers', io.engine.clientsCount);
  });
});

// Dedicated Frontend Server on port 8865
const frontendApp = express();
const distPath = path.join(__dirname, '../frontend/dist');

frontendApp.use(express.static(distPath));

frontendApp.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

frontendApp.listen(8865, '0.0.0.0', () => {
  console.log('Frontend server is running on port 8865');
});
