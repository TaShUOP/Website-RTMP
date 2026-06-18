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
  // Broadcast the number of connected clients to all clients
  io.emit('viewers', io.engine.clientsCount);
  
  socket.on('chat_message', (msg) => {
    // Broadcast message to all connected clients
    io.emit('chat_message', msg);
    io.emit('chat:message', msg); // support both formats
  });

  socket.on('chat:message', (msg) => {
    io.emit('chat_message', msg);
    io.emit('chat:message', msg);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Update viewers count when someone leaves
    io.emit('viewers', io.engine.clientsCount);
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
