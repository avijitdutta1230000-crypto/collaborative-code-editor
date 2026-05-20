const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { VM } = require('vm2');

const app = express();
app.use(cors());
app.use(express.json());

// Home Route
app.get('/', (req, res) => {
  res.send('🚀 Collaborative Code Editor Server is Running!');
});

// Run Code Route
app.post('/run', async (req, res) => {
  const { code, language } = req.body;

  if (language === 'javascript') {
    try {
      let output = '';
      const vm = new VM({
        timeout: 3000,
        sandbox: {
          console: {
            log: (...args) => { output += args.join(' ') + '\n'; },
            error: (...args) => { output += args.join(' ') + '\n'; },
            warn: (...args) => { output += args.join(' ') + '\n'; },
          }
        }
      });
      vm.run(code);
      res.json({ run: { stdout: output || 'No output', stderr: '' } });
    } catch (err) {
      res.json({ run: { stdout: '', stderr: err.message } });
    }
  } else {
    res.json({
      run: {
        stdout: `⚠️ ${language.toUpperCase()} execution coming soon!\n\nCurrently supported:\n✅ JavaScript\n\nSwitch to JavaScript to run code!`,
        stderr: ''
      }
    });
  }
});

// Socket.io
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