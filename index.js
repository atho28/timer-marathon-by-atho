const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Middleware untuk file statis
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

  // Ganti bagian socket.on('controlTimer', ...) dengan ini:
socket.on('controlTimer', (data) => {
    const { id, command, manualTime, newName } = data;
  // FITUR BARU: Reset All Categories
    if (command === 'resetAll') {
        for (let key in timers) {
            timers[key].elapsed = 0;
            timers[key].isRunning = false;
            timers[key].startTime = null;
        }
        io.emit('sync', timers);
        return; // Keluar dari fungsi agar tidak mencari id
    }
  
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
            timers[id].startTime = null;
        } 
        // FITUR BARU: Edit Waktu Manual
        else if (command === 'edit') {
            timers[id].elapsed = manualTime;
            // Jika sedang jalan, reset startTime ke jam sekarang agar perhitungan tidak lompat
            if (timers[id].isRunning) timers[id].startTime = Date.now();
        }
        // FITUR BARU: Update Nama Kategori
        else if (command === 'updateName') {
            timers[id].name = newName;
        }
      // Cari bagian socket.on('controlTimer', ...) dan tambahkan kondisi ini:
socket.on('controlTimer', (data) => {
    const { id, command, manualTime, newName } = data;

    if (timers[id]) {
        // ... kode start, pause, reset, edit, updateName yang sudah ada ...
    }
});
        
        io.emit('sync', timers);
    }
});
});

// PENTING: Gunakan 0.0.0.0 agar bisa diakses dari luar Railway
const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
