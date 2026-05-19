const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' }
});

// Run Code Route
app.post('/run', async (req, res) => {
  const { code, language } = req.body;
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: language,
        version: '*',
        files: [{ content: code }],
      }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log('Error:', err);
    res.json({ run: { stdout: '', stderr: 'Error running code!' } });
  }
});

// Socket.io
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ id: socket.id, username });
    io.to(roomId).emit('users-update', rooms[roomId]);
    console.log(`${username} joined room ${roomId}`);
  });

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', code);
  });

  socket.on('language-change', ({ roomId, language }) => {
    socket.to(roomId).emit('language-update', language);
  });

  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(u => u.id !== socket.id);
      io.to(roomId).emit('users-update', rooms[roomId]);
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});