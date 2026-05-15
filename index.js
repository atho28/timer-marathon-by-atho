const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

// Perbaikan di bagian ini:
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // Mengizinkan semua koneksi masuk
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Struktur data untuk 3 kategori
let timers = {
    cat1: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori A" },
    cat2: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori B" },
    cat3: { startTime: null, elapsed: 0, isRunning: false, name: "Kategori C" }
};

// ... kode setup server lainnya tetap sama ...

io.on('connection', (socket) => {
    console.log('User connected');

    // 1. Kirim data saat pertama kali konek
    socket.emit('sync', timers);

    // 2. Listener untuk permintaan sinkronisasi manual dari Admin
    socket.on('requestSync', () => {
        socket.emit('sync', timers);
    });

    // 3. Listener untuk kontrol timer (Start, Pause, Reset)
    socket.on('controlTimer', (data) => {
        const { id, command, manualTime, newName } = data;
        let t = timers[id];
      
        if (command === 'start' && !t.isRunning) {
            t.startTime = Date.now();
            t.isRunning = true;
        } else if (command === 'pause' && t.isRunning) {
            t.elapsed += Date.now() - t.startTime;
            t.isRunning = false;
        } else if (command === 'reset') {
            timers[id] = { ...timers[id], startTime: null, elapsed: 0, isRunning: false };
        } else if (command === 'edit') {
            t.elapsed = manualTime;
            t.startTime = t.isRunning ? Date.now() : null;
        } else if (command === 'updateName') {
            // Fitur baru: Update nama kategori
            t.name = newName;
        }
        io.emit('sync', timers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server Pro V2 jalan di port ${PORT}`));
