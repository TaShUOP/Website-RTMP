const NodeMediaServer = require('node-media-server');
const { Server } = require('socket.io');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

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

let ffmpegProcess = null;
const mediaPath = path.join(__dirname, 'media/live');
fs.mkdirSync(mediaPath, { recursive: true });

nms.on('postPublish', (...args) => {
  console.log(`[RTMP] postPublish event triggered with args:`, args);
  
  // NMS docs say (id, StreamPath, args), but sometimes it is just (id, StreamPath)
  // Let's dynamically find the string argument that starts with '/'
  const streamPath = args.find(arg => typeof arg === 'string' && arg.startsWith('/'));
  
  if (!streamPath) {
    console.log(`[RTMP] Error: Could not determine StreamPath from args!`);
    return;
  }
  
  console.log(`[RTMP] Stream published on ${streamPath}`);
  
  const streamKey = streamPath.split('/').pop();
  const streamDir = path.join(mediaPath, streamKey);
  fs.mkdirSync(streamDir, { recursive: true });

  const inputUrl = `rtmp://localhost:3343${streamPath}`;
  
  ffmpegProcess = spawn('ffmpeg', [
    '-i', inputUrl,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments',
    path.join(streamDir, 'index.m3u8')
  ]);

  ffmpegProcess.on('close', (code) => {
    console.log(`[FFmpeg] Exited with code ${code}`);
  });
});

nms.on('donePublish', (...args) => {
  console.log(`[RTMP] donePublish event triggered with args:`, args);
  const streamPath = args.find(arg => typeof arg === 'string' && arg.startsWith('/'));
  if (streamPath) {
    console.log(`[RTMP] Stream ended on ${streamPath}`);
  }
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGINT');
    ffmpegProcess = null;
  }
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

// Serve HLS streams with CORS
frontendApp.use('/hls', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
}, express.static(path.join(__dirname, 'media')));

// Serve the static React build
frontendApp.use(express.static(distPath));

frontendApp.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

frontendApp.listen(8865, '0.0.0.0', () => {
  console.log('Frontend server is running on port 8865');
});
