const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const users = new Map();

io.on('connection', (socket) => {
  socket.on('register', (username) => {
    if (!username) return;
    users.set(username, socket.id);
    socket.username = username;
    io.emit('users', Array.from(users.keys()));
  });

  socket.on('private-message', (data) => {
    const targetId = users.get(data.to);
    if (targetId) {
      io.to(targetId).emit('private-message', {
        from: socket.username,
        message: data.message,
        time: new Date().toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'})
      });
    }
  });

  socket.on('group-message', (data) => {
    io.emit('group-message', {
      from: socket.username,
      group: data.group,
      message: data.message,
      time: new Date().toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'})
    });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      users.delete(socket.username);
      io.emit('users', Array.from(users.keys()));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running'));
