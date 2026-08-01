const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend client
app.use(cors({ origin: '*' }));
app.use(express.json());

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Track users in active rooms
const userSocketMap = {};
function getAllConnectedClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
}

// -------------------------------------------------------------
// 1. SOCKET.IO REAL-TIME COLLABORATION
// -------------------------------------------------------------
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // User joins a room
  socket.on('JOIN', ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    // Notify all users in room that someone joined
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('JOINED', {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  // Broadcast code changes to everyone else in the room
  socket.on('CODE_CHANGE', ({ roomId, code }) => {
    socket.in(roomId).emit('CODE_CHANGE', { code });
  });

  // Sync initial code state when a new user joins
  socket.on('SYNC_CODE', ({ socketId, code }) => {
    io.to(socketId).emit('CODE_CHANGE', { code });
  });

  // Sync active language selection
  socket.on('LANGUAGE_CHANGE', ({ roomId, language }) => {
    socket.in(roomId).emit('LANGUAGE_CHANGE', { language });
  });

  // Handle disconnection
  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit('DISCONNECTED', {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

// -------------------------------------------------------------
// 2. CODE EXECUTION ROUTE (Judge0 API Integration)
// -------------------------------------------------------------
const JUDGE0_LANGUAGES = {
  javascript: 63,
  python: 71,
  java: 62,
  'c++': 54,
  cpp: 54,
  typescript: 74,
};

app.post('/run', async (req, res) => {
  const { code, language } = req.body;
  const langId = JUDGE0_LANGUAGES[language?.toLowerCase()];

  if (!langId) {
    return res.json({
      run: { output: `Unsupported language: ${language}` },
    });
  }

  try {
    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'YOUR_DEFAULT_RAPIDAPI_KEY',
      },
      body: JSON.stringify({
        source_code: code,
        language_id: langId,
      }),
    });

    const data = await response.json();

    const outputResult =
      data.stdout ||
      data.stderr ||
      data.compile_output ||
      data.message ||
      'Executed with no output.';

    res.json({ run: { output: outputResult } });
  } catch (err) {
    res.json({ run: { output: `Server Error: ${err.message}` } });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
});