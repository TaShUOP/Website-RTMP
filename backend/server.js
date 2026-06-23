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
  }
};

const nms = new NodeMediaServer(config);
nms.run();

const { spawn } = require('child_process');
const fs = require('fs');
const ffmpegProcesses = new Map();

nms.on('postPublish', (id, StreamPath, args) => {
  console.log(`[HLS] Stream started on ${StreamPath}. Spawning FFmpeg...`);
  
  // Create output directory for HLS segments (e.g. ./media/live/test)
  const hlsDir = path.join(__dirname, 'media', StreamPath);
  fs.mkdirSync(hlsDir, { recursive: true });
  
  const ffmpegCmd = spawn('ffmpeg', [
    '-i', `rtmp://127.0.0.1:3343${StreamPath}`,
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments',
    path.join(hlsDir, 'index.m3u8')
  ]);

  ffmpegCmd.on('close', (code) => {
    console.log(`[HLS] FFmpeg closed with code ${code}`);
  });

  ffmpegProcesses.set(id, ffmpegCmd);
});

nms.on('donePublish', (id, StreamPath, args) => {
  if (ffmpegProcesses.has(id)) {
    console.log(`[HLS] Stream ended on ${StreamPath}. Killing FFmpeg...`);
    ffmpegProcesses.get(id).kill();
    ffmpegProcesses.delete(id);
  }
});

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
