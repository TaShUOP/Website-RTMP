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
    host: '0.0.0.0'
  },
  static: {
    router: '/',
    root: path.join(__dirname, 'media')
  }
};

const nms = new NodeMediaServer(config);
nms.run();

const { spawn } = require('child_process');
const fs = require('fs');
const ffmpegProcesses = new Map();

const startFfmpeg = (id, StreamPath, retries = 5) => {
  if (retries === 0) {
    console.log(`[HLS] FFmpeg failed too many times for ${StreamPath}. Giving up.`);
    return;
  }

  const hlsDir = path.join(__dirname, 'media', StreamPath);
  fs.mkdirSync(hlsDir, { recursive: true });
  
  console.log(`[HLS] Spawning FFmpeg for ${StreamPath} (Retries left: ${retries})...`);
  const ffmpegCmd = spawn('/usr/bin/ffmpeg', [
    '-i', `rtmp://127.0.0.1:3343${StreamPath}`,
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '3',
    '-hls_flags', 'delete_segments',
    path.join(hlsDir, 'index.m3u8')
  ]);

  ffmpegCmd.stderr.on('data', (data) => {
    // FFmpeg writes everything to stderr. Log it so we can debug if it crashes.
    console.log(`[FFmpeg] ${data.toString().trim()}`);
  });

  ffmpegCmd.on('close', (code) => {
    console.log(`[HLS] FFmpeg closed with code ${code}`);
    // If it crashed (code !== 0) and wasn't manually killed (code !== 255), retry.
    if (code !== 0 && code !== 255 && ffmpegProcesses.has(id)) {
      console.log(`[HLS] FFmpeg crashed. Retrying in 2 seconds...`);
      setTimeout(() => startFfmpeg(id, StreamPath, retries - 1), 2000);
    }
  });

  ffmpegProcesses.set(id, ffmpegCmd);
};

nms.on('postPublish', (session) => {
  const StreamPath = session.streamPath;
  const id = session.id;
  
  console.log(`[HLS] Stream published on ${StreamPath}. Waiting 1.5s for RTMP to stabilize...`);
  
  // Wait 1.5 seconds to ensure the RTMP stream is fully initialized before FFmpeg tries to read it
  setTimeout(() => {
    startFfmpeg(id, StreamPath);
  }, 1500);
});

nms.on('donePublish', (session) => {
  const StreamPath = session.streamPath;
  const id = session.id;

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
