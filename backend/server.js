const NodeMediaServer = require('node-media-server');
const { Server } = require('socket.io');

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
    port: 3342, // HTTP Streaming (FLV) and API
    allow_origin: '*',
    host: '0.0.0.0'
  }
};

const nms = new NodeMediaServer(config);
nms.run();

// Socket.IO Server attached to the NodeMediaServer HTTP Server (port 3342)
const io = new Server(nms.nhs.server, {
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
