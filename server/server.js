const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Servir /public
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  // Guardamos el nombre cuando el cliente "se une"
  socket.on('join', (username) => {
    socket.data.username = (username || 'Anónimo').trim();
    console.log(`👤 ${socket.data.username} se unió (${socket.id})`);

    // Mensaje de sistema (opcional)
    socket.broadcast.emit('system', `${socket.data.username} se ha unido al chat`);
  });

  // Mensajes de chat
  socket.on('mensaje', (text) => {
    const msg = String(text || '').trim();
    if (!msg) return;

    const payload = {
      user: socket.data.username || 'Anónimo',
      text: msg,
      ts: new Date().toISOString()
    };
    io.emit('mensaje', payload);
  });

  socket.on('disconnect', () => {
    if (socket.data.username) {
      io.emit('system', `${socket.data.username} salió del chat`);
    }
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
