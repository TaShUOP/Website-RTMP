const NodeMediaServer = require('node-media-server');
const { Server } = require('socket.io');

// Socket.IO Server on port 8001
const io = new Server(8001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected to chat');
  
  socket.on('chat_message', (msg) => {
    // Broadcast message to all connected clients
    io.emit('chat_message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*' // Allow CORS for the frontend React app
  }
};

const nms = new NodeMediaServer(config);
nms.run();
