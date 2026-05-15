const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const path = require('path');

const io = new Server(server, {
  cors: { origin: "*" }
});

// Memastikan folder public terbaca benar
app.use(express.static(path.join(__dirname, 'public')));

let timers = {
  cat1: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori A" },
  cat2: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori B" },
  cat3: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori C" }
};

io.on('connection', (socket) => {
  console.log('User connected');
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

// PENTING: Railway butuh port ini untuk menghilangkan 502 Bad Gateway
const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
