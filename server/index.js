const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Home Route
app.get('/', (req, res) => {
  res.send('🚀 Collaborative Code Editor Server is Running!');
});

// Run Code Route (Uses Piston API for Multi-Language Execution)
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
      run: { output: `Unsupported language selected: ${language}` },
    });
  }

  try {
    const response = await fetch(
      'https://judge0-ce.p.rapidapi.com/submissions?wait=true',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          'x-rapidapi-key': '06cb1eeabfmshb5e6b720996be6fp1d222fjsn8c3caf1363cb', // <-- Make sure your key is here!
        },
        body: JSON.stringify({
          source_code: code,
          language_id: langId,
        }),
      }
    );

    const data = await response.json();
    console.log('Judge0 Raw Response:', data); // Log to backend terminal to debug

    // Extract execution result
    const outputResult =
      data.stdout ||
      data.stderr ||
      data.compile_output ||
      data.message ||
      'Code executed with no output.';

    res.json({ run: { output: outputResult } });
  } catch (err) {
    console.error('Execution Server Error:', err.message);
    res.json({ run: { output: `Execution Error: ${err.message}` } });
  }
});
// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    
    // Avoid duplicate user entries on socket reconnects
    const existingUserIndex = rooms[roomId].findIndex(u => u.id === socket.id);
    if (existingUserIndex === -1) {
      rooms[roomId].push({ id: socket.id, username });
    } else {
      rooms[roomId][existingUserIndex].username = username;
    }

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});