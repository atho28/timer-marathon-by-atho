const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  allowEIO3: true // Menambah kompatibilitas
});

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

let timers = {
  cat1: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori A" },
  cat2: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori B" },
  cat3: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori C" }
};

io.on('connection', (socket) => {
  console.log('Koneksi baru:', socket.id);
  socket.emit('sync', timers);

  socket.on('requestSync', () => {
    socket.emit('sync', timers);
  });

  socket.on('controlTimer', (data) => {
    const { id, command } = data;
    if (timers[id]) {
        if (command === 'start' && !timers[id].isRunning) {
            timers[id].startTime = Date.now();
            timers[id].isRunning = true;
        } else if (command === 'pause' && timers[id].isRunning) {
            timers[id].elapsed += Date.now() - timers[id].startTime;
            timers[id].isRunning = false;
        } else if (command === 'reset') {
            timers[id].elapsed = 0;
            timers[id].isRunning = false;
        }
        io.emit('sync', timers);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
