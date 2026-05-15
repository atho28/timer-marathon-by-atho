const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Inisialisasi Socket.io dengan CORS yang longgar untuk hosting
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

let timers = {
  cat1: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori A" },
  cat2: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori B" },
  cat3: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori C" }
};

io.on('connection', (socket) => {
  console.log('User connected');
  
  // Kirim data saat admin baru masuk
  socket.emit('sync', timers);

  socket.on('requestSync', () => {
    socket.emit('sync', timers);
  });

  socket.on('controlTimer', (data) => {
    const { id, command, manualTime, newName } = data;
    let t = timers[id];
    if (!t) return;

    if (command === 'start' && !t.isRunning) {
      t.startTime = Date.now();
      t.isRunning = true;
    } else if (command === 'pause' && t.isRunning) {
      t.elapsed += Date.now() - t.startTime;
      t.isRunning = false;
    } else if (command === 'reset') {
      timers[id] = { ...timers[id], startTime: null, elapsed: 0, isRunning: false };
    }
    io.emit('sync', timers);
  });
});

// PENTING: Gunakan PORT dari Railway
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server Pro berjalan di port ${PORT}`);
});
